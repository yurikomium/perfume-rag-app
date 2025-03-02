import { Pipeline, pipeline } from "@xenova/transformers";

type FeatureExtractionPipeline = Pipeline & {
  embed: (
    text: string,
    options?: { pooling: string; normalize: boolean }
  ) => Promise<{ data: Float32Array }>;
};

export class WeightedEmbeddings {
  private model: FeatureExtractionPipeline | null = null;
  private fieldWeights: Record<string, number>;

  constructor(fieldWeights: Record<string, number>) {
    this.fieldWeights = fieldWeights;
  }

  async initialize() {
    if (typeof window === "undefined") {
      // サーバーサイドの場合
      this.model = (await pipeline(
        "feature-extraction",
        "Xenova/multilingual-e5-small",
        {
          revision: "main",
          quantized: false,
        }
      )) as FeatureExtractionPipeline;
    } else {
      // クライアントサイドの場合
      this.model = (await pipeline(
        "feature-extraction",
        "Xenova/multilingual-e5-small",
        {
          revision: "main",
          quantized: true,
        }
      )) as FeatureExtractionPipeline;
    }
  }

  public async embedText(text: string): Promise<number[]> {
    if (!this.model) {
      throw new Error("Model not initialized");
    }
    const output = await this.model(text, { pooling: "mean", normalize: true });
    return Array.from(output.data);
  }

  private parseTextToFields(text: string): Record<string, string> {
    const fields: Record<string, string> = {
      brand: "",
      concept: "",
      categories: "",
      sex: "",
      fragrance_top: "",
      fragrance_middle: "",
      fragrance_last: "",
      fragrance_image: "",
      fragrance_impression: "",
      usage_scenes: "",
      seasons: "",
      names: "",
    };

    const lines = text.split("\n");
    for (const line of lines) {
      const [key, ...valueParts] = line.split(":");
      const value = valueParts.join(":").trim();

      switch (key.trim()) {
        case "名前":
          fields.names = value;
          break;
        case "ブランド":
          fields.brand = value;
          break;
        case "コンセプト":
          fields.concept = value;
          break;
        case "性別":
          fields.sex = value;
          break;
        case "カテゴリー":
          fields.categories = value;
          break;
        case "トップノート":
          fields.fragrance_top = value;
          break;
        case "ミドルノート":
          fields.fragrance_middle = value;
          break;
        case "ラストノート":
          fields.fragrance_last = value;
          break;
        case "香りのイメージ":
          fields.fragrance_image = value;
          break;
        case "香りの印象":
          fields.fragrance_impression = value;
          break;
        case "使用シーン":
          fields.usage_scenes = value;
          break;
        case "おすすめの季節":
          fields.seasons = value;
          break;
      }
    }

    return fields;
  }

  async embedQuery(text: string): Promise<number[]> {
    const fields = this.parseTextToFields(text);
    let combinedEmbedding: number[] = [];
    let totalWeight = 0;

    for (const [field, fieldText] of Object.entries(fields)) {
      if (fieldText.trim()) {
        const weight = this.fieldWeights[field] || 1.0;
        const embedding = await this.embedText(fieldText);

        if (!combinedEmbedding.length) {
          combinedEmbedding = embedding.map((v) => v * weight);
        } else {
          combinedEmbedding = combinedEmbedding.map(
            (v, i) => v + embedding[i] * weight
          );
        }
        totalWeight += weight;
      }
    }

    if (totalWeight > 0) {
      combinedEmbedding = combinedEmbedding.map((v) => v / totalWeight);
    }

    // L2 normalization
    const norm = Math.sqrt(
      combinedEmbedding.reduce((sum, v) => sum + v * v, 0)
    );
    if (norm > 0) {
      combinedEmbedding = combinedEmbedding.map((v) => v / norm);
    }

    return combinedEmbedding;
  }
}
