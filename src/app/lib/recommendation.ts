import { ProcessedPerfume } from "../types/perfume";
import { usageSceneMapping } from "../types/usageScene";

function joinWithComma(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  return items.slice(0, -1).join("、") + "と" + items[items.length - 1];
}

function findQueryMatches(query: string, text: string): string[] {
  const keywords = query.split(/[\s,\n]+/);
  return keywords.filter(
    (keyword) =>
      keyword.length > 1 && // 1文字のキーワードは除外
      !["コンセプト:", "性別:", "おすすめの季節:", "使用シーン:"].includes(
        keyword
      ) && // メタ情報は除外
      text.includes(keyword)
  );
}

function convertUsageScenesToDisplay(scenes: string[]): string[] {
  return scenes.map((scene) => {
    const entry = Object.values(usageSceneMapping).find(
      (value) => value.query === scene
    );
    return entry ? entry.display : scene;
  });
}

export function generateRecommendationReason(
  query: string,
  perfume: ProcessedPerfume,
  similarity: number
): string {
  const reasons: string[] = [];

  // 類似度に基づくマッチング度の説明
  const matchingPercent = (similarity * 100).toFixed(1);
  reasons.push(`検索条件との一致度は${matchingPercent}%です。`);

  // クエリとのマッチング説明
  const matches = findQueryMatches(query, perfume.text);
  if (matches.length > 0) {
    reasons.push(`特に「${joinWithComma(matches)}」のイメージに合致します。`);
  }

  // 香りの特徴説明
  if (perfume.metadata.fragrance_notes) {
    const notes = perfume.metadata.fragrance_notes
      .filter((note) => note.trim())
      .slice(0, 3);
    if (notes.length > 0) {
      reasons.push(`${joinWithComma(notes)}などの香りが特徴的です。`);
    }
  }

  // 使用シーンの表示を変換
  if (
    perfume.metadata.usage_scenes &&
    perfume.metadata.usage_scenes.length > 0
  ) {
    const displayScenes = convertUsageScenesToDisplay(
      perfume.metadata.usage_scenes
    );
    reasons.push(`${joinWithComma(displayScenes)}の場面におすすめです。`);
  }

  // 季節
  if (perfume.metadata.seasons && perfume.metadata.seasons.length > 0) {
    reasons.push(
      `特に${joinWithComma(perfume.metadata.seasons)}の季節におすすめです。`
    );
  }

  return reasons.join(" ");
}
