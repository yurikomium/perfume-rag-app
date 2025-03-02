import { WeightedEmbeddings } from "./embeddings";
import perfumeData from "@/data/processed_perfumes.json";
import { ProcessedPerfume, SearchResult, Sex, Season } from "../types/perfume";
import { UsageScene } from "../types/usageScene";
const fieldWeights = {
  brand: 0.3,
  names: 0.3,
  concept: 1.6,
  categories: 1.2,
  fragrance_top: 0.3,
  fragrance_middle: 0.3,
  fragrance_last: 0.3,
  fragrance_image: 1.5,
  fragrance_impression: 1.3,
  usage_scenes: 1.5,
};

let embeddings: WeightedEmbeddings | null = null;
let perfumeEmbeddings: { [key: string]: number[] } = {};

export async function initializeEmbeddings() {
  if (!embeddings) {
    embeddings = new WeightedEmbeddings(fieldWeights);
    await embeddings.initialize();

    console.log("Initializing embeddings...");

    // 全香水のembeddingを計算
    for (const perfume of perfumeData) {
      const embedding = await embeddings.embedQuery(perfume.text);
      perfumeEmbeddings[perfume.metadata.id] = embedding;
      console.log(`Embedding calculated for ${perfume.metadata.name_jp}`, {
        id: perfume.metadata.id,
        embeddingLength: embedding.length,
      });
    }
  }
  return embeddings;
}

interface QueryConditions {
  sex: Set<string>;
  seasons: Set<string>;
}

function extractQueryConditions(query: string): QueryConditions {
  const conditions: QueryConditions = {
    sex: new Set(),
    seasons: new Set(),
  };

  const sexKeywords = {
    ユニセックス: "ユニセックス",
    メンズ: "メンズ",
    レディース: "レディース",
  };

  const seasonKeywords = {
    春: "春",
    夏: "夏",
    秋: "秋",
    冬: "冬",
  };

  // 行ごとに分割
  const lines = query.split("\n");

  for (const line of lines) {
    // キーと値を分割
    const [key, value] = line.split(":").map((part) => part.trim());

    // キーに応じて処理
    switch (key) {
      case "性別":
        // カンマで区切られた値を処理
        value.split("、").forEach((sex) => {
          if (sex in sexKeywords) {
            conditions.sex.add(sexKeywords[sex as keyof typeof sexKeywords]);
          }
        });
        break;

      case "おすすめの季節":
        // カンマで区切られた値を処理
        value.split("、").forEach((season) => {
          if (season in seasonKeywords) {
            conditions.seasons.add(
              seasonKeywords[season as keyof typeof seasonKeywords]
            );
          }
        });
        break;
    }
  }

  return conditions;
}

interface SearchQuery {
  text: string;
  sex: Sex | null;
  seasons: Season[];
  usage_scenes: UsageScene[];
}

export async function searchPerfumes(
  query: SearchQuery,
  k: number = 5
): Promise<SearchResult[]> {
  const embedder = await initializeEmbeddings();
  const queryEmbedding = await embedder.embedText(query.text);

  const results = (perfumeData as ProcessedPerfume[])
    .map((perfume) => {
      const embedding = perfumeEmbeddings[perfume.metadata.id];
      const similarity = calculateCosineSimilarity(queryEmbedding, embedding);

      return {
        text: perfume.text,
        metadata: perfume.metadata,
        score: similarity,
      };
    })
    .filter((perfume) => {
      // 性別の完全一致フィルタリング
      if (query.sex && perfume.metadata.sex !== query.sex) {
        return false;
      }
      // 季節の完全一致フィルタリング
      if (query.seasons.length > 0) {
        const hasAllSeasons = query.seasons.every((season) =>
          perfume.metadata.seasons.includes(season)
        );
        if (!hasAllSeasons) return false;
      }
      return true;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, k);

  return results;
}

// コサイン類似度の計算関数も確認
function calculateCosineSimilarity(vec1: number[], vec2: number[]): number {
  if (!vec1 || !vec2 || vec1.length !== vec2.length) {
    console.log("Vector validation failed:", {
      vec1Length: vec1?.length,
      vec2Length: vec2?.length,
    });
    return 0;
  }

  const dotProduct = vec1.reduce((sum, v1, i) => sum + v1 * vec2[i], 0);
  const norm1 = Math.sqrt(vec1.reduce((sum, v) => sum + v * v, 0));
  const norm2 = Math.sqrt(vec2.reduce((sum, v) => sum + v * v, 0));

  console.log("Similarity calculation:", {
    dotProduct,
    norm1,
    norm2,
  });

  return norm1 && norm2 ? dotProduct / (norm1 * norm2) : 0;
}

function hasIntersection<T>(set1: Set<T>, set2: Set<T>): boolean {
  for (const item of set1) {
    if (set2.has(item)) return true;
  }
  return false;
}

export async function findSimilarPerfumes(
  targetPerfume: ProcessedPerfume,
  limit: number = 3
): Promise<ProcessedPerfume[]> {
  const embedder = await initializeEmbeddings();

  // 対象の香水のembeddingを取得
  const targetEmbedding = perfumeEmbeddings[targetPerfume.metadata.id];

  // 全香水との類似度を計算
  const similarities = (perfumeData as ProcessedPerfume[])
    .filter((p) => p.metadata.id !== targetPerfume.metadata.id) // 自分自身を除外
    .map((perfume) => ({
      perfume,
      similarity: calculateCosineSimilarity(
        targetEmbedding,
        perfumeEmbeddings[perfume.metadata.id]
      ),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);

  return similarities.map((s) => ({
    ...s.perfume,
    score: s.similarity, // 類似度スコアを設定
  }));
}

// テキストからノート情報を抽出する関数
export function extractNotes(text: string) {
  const lines = text.split("\n");
  const notes = {
    top: "",
    middle: "",
    last: "",
  };

  lines.forEach((line: string) => {
    if (line.startsWith("トップノート:")) {
      notes.top = line.replace("トップノート:", "").trim();
    } else if (line.startsWith("ミドルノート:")) {
      notes.middle = line.replace("ミドルノート:", "").trim();
    } else if (line.startsWith("ラストノート:")) {
      notes.last = line.replace("ラストノート:", "").trim();
    }
  });

  return notes;
}

// 共通の特徴を分析する関数
export function analyzeCommonFeatures(
  mainPerfume: ProcessedPerfume,
  similarPerfumes: ProcessedPerfume[]
) {
  // メイン香水のノート情報を抽出
  const mainNotes = extractNotes(mainPerfume.text);

  // 類似香水のノート情報を抽出
  const similarNotes = similarPerfumes.map((p) => extractNotes(p.text));

  // すべてのノートを配列に展開
  const allNotes = [
    ...mainNotes.top.split(", "),
    ...mainNotes.middle.split(", "),
    ...mainNotes.last.split(", "),
  ].filter(Boolean);

  // 類似香水のノートを配列に展開
  const similarAllNotes = similarNotes
    .flatMap((notes) => [
      ...notes.top.split(", "),
      ...notes.middle.split(", "),
      ...notes.last.split(", "),
    ])
    .filter(Boolean);

  // 共通するノートを見つける
  const commonNotes = allNotes.filter((note) => similarAllNotes.includes(note));

  // ユニークなノートを見つける（メイン香水にのみ含まれるノート）
  const uniqueNotes = allNotes.filter(
    (note) => !similarAllNotes.includes(note)
  );

  return {
    commonNotes,
    uniqueNotes,
    mainPerfumeNotes: allNotes,
    similarPerfumesNotes: similarAllNotes,
  };
}
