export interface PerfumeMetadata {
  id: string;
  name_jp: string;
  name_en: string;
  brand: string;
  sex: string;
  categories: string[];
  rating: number;
  seasons: string[];
  usage_scenes: string[];
  fragrance_notes: string[];
}

export interface ProcessedPerfume {
  text: string;
  metadata: PerfumeMetadata;
  score: number;
}

export interface SearchResult {
  text: string;
  metadata: PerfumeMetadata;
  score: number;
}

export type Sex = "ユニセックス" | "レディース" | "メンズ";

export type Season = "春" | "夏" | "秋" | "冬";
