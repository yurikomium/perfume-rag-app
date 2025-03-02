import fs from "fs";
import path from "path";

// 香水データを読み込む
const rawData = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../src/data/example.json"), "utf8")
);

// テキスト形式に変換する関数
function convertToText(perfume) {
  return `名前: ${perfume.names.japanese}
ブランド: ${perfume.brand}
コンセプト: ${perfume.concept}
性別: ${perfume.sex}
カテゴリー: ${
    Array.isArray(perfume.categories)
      ? perfume.categories.join(", ")
      : perfume.categories
  }
香りが演出する雰囲気: ${
    Array.isArray(perfume.fragrance_image)
      ? perfume.fragrance_image.join(", ")
      : perfume.fragrance_image
  }
実際に感じる印象: ${
    Array.isArray(perfume.fragrance_impression)
      ? perfume.fragrance_impression.join(", ")
      : perfume.fragrance_impression
  }
使用シーン: ${
    Array.isArray(perfume.usage_scenes)
      ? perfume.usage_scenes.join(", ")
      : perfume.usage_scenes
  }
おすすめの季節: ${
    Array.isArray(perfume.seasons)
      ? perfume.seasons.join(", ")
      : perfume.seasons
  }`;
}

// メタデータを抽出する関数
function extractMetadata(perfume) {
  return {
    id: `${perfume.brand.toLowerCase()}-${perfume.names.english.toLowerCase()}`.replace(
      /[^a-z0-9]+/g,
      "-"
    ),
    name_jp: perfume.names.japanese,
    name_en: perfume.names.english,
    brand: perfume.brand,
    sex: perfume.sex,
    categories: perfume.categories,
    rating: perfume.rating,
    seasons: perfume.seasons,
    usage_scenes: perfume.usage_scenes,
  };
}

// データを処理して新しい形式に変換
const processedData = rawData.map((perfume) => ({
  text: convertToText(perfume),
  metadata: extractMetadata(perfume),
}));

// 処理したデータを保存
fs.writeFileSync(
  path.join(__dirname, "../src/data/processed_perfumes.json"),
  JSON.stringify(processedData, null, 2)
);

console.log(`Processed ${processedData.length} perfumes`);
