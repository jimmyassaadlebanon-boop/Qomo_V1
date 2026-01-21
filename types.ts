export interface Product {
  id: string;
  name: string;
  description: string;
  placeholderUrl: string;
  generatedImage?: string;
  priceHidden: boolean;
  basePrice: number;
}

export type ImageResolution = '1K' | '2K' | '4K';

export interface GenerationConfig {
  resolution: ImageResolution;
}