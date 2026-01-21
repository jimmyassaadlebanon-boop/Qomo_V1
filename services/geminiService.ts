import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ImageResolution } from "../types";

// Local interface to provide type safety for the aistudio object
// without conflicting with global declarations that may already exist.
interface AIStudioClient {
  hasSelectedApiKey(): Promise<boolean>;
  openSelectKey(): Promise<void>;
}

export interface ComparisonData {
  retailer: string;
  url: string;
  price: number;
  currency: string;
  whoIsCheaper: "qomo" | "retailer" | "same";
}

export interface PriceAnalysisResult {
  productName: string;
  region: string;
  qomoBasePrice: number;
  comparisons: ComparisonData[];
}

/**
 * Ensures the user has selected a paid API key for high-end generation features.
 */
export const ensureApiKey = async (): Promise<boolean> => {
  const aistudio = (window as any).aistudio as AIStudioClient | undefined;
  if (aistudio) {
    const hasKey = await aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await aistudio.openSelectKey();
      // Assume success after dialog closes (race condition mitigation per guidelines)
      return true;
    }
    return true;
  }
  return !!process.env.API_KEY;
};

/**
 * Generates a product image using gemini-3-pro-image-preview.
 */
export const generateProductImage = async (
  productName: string,
  resolution: ImageResolution
): Promise<string | null> => {
  const performGeneration = async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Construct a prompt that enforces the requested aesthetic
    const prompt = `
      Professional luxury product photography of a ${productName}.
      The lighting is neutral and soft with matte reflections.
      Centered composition, front-facing view with a slight angle to show depth.
      The background is a smooth, seamless gradient from deep charcoal (#1A1A1A) to soft off-white (#F5F5F2) smoke.
      High-end e-commerce aesthetic, sharp focus, ultra-realistic.
    `;

    return await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: resolution, // 1K, 2K, or 4K
        },
      },
    });
  };

  try {
    const response = await performGeneration();
    return extractImage(response);
  } catch (error: any) {
    // Robust error checking for permission issues (403) or Not Found (404)
    // which indicate an invalid or insufficient API key.
    const errorMessage = error.message || JSON.stringify(error);
    const isPermissionError = 
      error.status === 'PERMISSION_DENIED' || 
      error.code === 403 || 
      errorMessage.includes('PERMISSION_DENIED') || 
      errorMessage.includes('403');
      
    const isNotFoundError = 
      error.status === 'NOT_FOUND' || 
      error.code === 404 || 
      errorMessage.includes('Requested entity was not found');

    const aistudio = (window as any).aistudio as AIStudioClient | undefined;

    if ((isPermissionError || isNotFoundError) && aistudio) {
      console.warn("API Key permission issue detected. Prompting for new key...");
      
      try {
        await aistudio.openSelectKey();
        // Retry generation once with the (hopefully) updated key context
        const response = await performGeneration();
        return extractImage(response);
      } catch (retryError) {
        console.error("Retry failed after key selection:", retryError);
        throw retryError;
      }
    }
    
    console.error("Error generating image:", error);
    throw error;
  }
};

/**
 * Analyzes market prices compared to Qomo's base price using Google Search grounding.
 * Returns structured JSON data.
 */
export const analyzePriceComparison = async (
  productName: string,
  basePrice: number,
  region: string = "US"
): Promise<{ data: PriceAnalysisResult | null; sources: { title: string; uri: string }[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = `
    You are Qomo’s AI Price Analyst.

    Your job is to compare Qomo’s BASE PRICE for a specific product with prices 
    from external retailers in the user’s region.

    You must return a clean, structured JSON object that can be rendered as a 
    side-by-side comparison table. Do NOT return any markdown, formatting, 
    paragraphs, commentary, or explanations outside the JSON.

    -----------------------------------------------------
    INPUT YOU RECEIVE:
    - productName: ${productName}
    - basePrice: ${basePrice}
    - region: ${region}
    -----------------------------------------------------

    YOUR TASK:
    1. Identify at least THREE relevant external retailers in the given region.
       Use realistic, reputable sources (e.g., Apple, Amazon, Best Buy, Target, 
       Walmart, Etisalat, Jarir, Carrefour, etc. depending on region).

    2. For each retailer:
       - Provide the retailer name
       - Provide the product listing URL (realistic and plausible; keep it clean)
       - Provide the most representative price for the SAME model or closest 
         matching configuration available
       - Provide its currency
       - Compute "whoIsCheaper" with:
             • "qomo" if basePrice < retailerPrice
             • "retailer" if retailerPrice < basePrice
             • "same" if difference ≤ 1 unit

    3. You must ALWAYS return at least three comparison entries when possible.

    -----------------------------------------------------
    STRICT SAFETY RULES:
    - NEVER reveal or estimate view count.
    - NEVER mention or imply price-drop-per-view.
    - NEVER estimate or describe current live price on Qomo.
    - NEVER estimate how many interactions or views are needed for any change.
    - NEVER reveal or imply ANY internal pricing formulas.
    - NEVER mention demand level or "how close it is to selling".
    - ONLY compare retailer prices to Qomo’s BASE PRICE.

    -----------------------------------------------------
    OUTPUT FORMAT (MANDATORY):
    Return ONLY a single JSON object with THIS EXACT SHAPE:

    {
      "productName": string,
      "region": string,
      "qomoBasePrice": number,
      "comparisons": [
        {
          "retailer": string,
          "url": string,
          "price": number,
          "currency": string,
          "whoIsCheaper": "qomo" | "retailer" | "same"
        },
        ...
      ]
    }

    - No commentary.
    - No headings.
    - No markdown.
    - No explanation outside the JSON.
    - No additional fields.

    -----------------------------------------------------
    STYLE:
    - Keep JSON clean, minimal, and predictable.
    - Ensure all retailer prices are realistic for the model requested.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [{ text: `Compare market prices for ${productName} in ${region} against Qomo's base price of $${basePrice}.` }],
    },
    config: {
      systemInstruction: systemInstruction,
      tools: [{ googleSearch: {} }],
    },
  });

  // Parse JSON from response
  let data: PriceAnalysisResult | null = null;
  const rawText = response.text || "";
  
  try {
      // Clean up potential markdown formatting (```json ... ```)
      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      data = JSON.parse(cleanJson);
  } catch (e) {
      console.warn("Failed to parse JSON from AI response:", rawText);
  }
  
  // Extract grounding chunks for citations
  const sources: { title: string; uri: string }[] = [];
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  
  if (chunks) {
    chunks.forEach((chunk: any) => {
      if (chunk.web) {
        sources.push({
          title: chunk.web.title,
          uri: chunk.web.uri,
        });
      }
    });
  }

  // Remove duplicate sources based on URI
  const uniqueSources = sources.filter((v, i, a) => a.findIndex(t => (t.uri === v.uri)) === i);

  return { data, sources: uniqueSources };
};

const extractImage = (response: GenerateContentResponse): string | null => {
  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }
  return null;
}