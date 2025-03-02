import { NextResponse } from "next/server";
import { findSimilarPerfumes, analyzeCommonFeatures } from "@/app/lib/search";

async function generateEnhancedConcept(
  perfume: any,
  similarPerfumes: any[],
  features: any
) {
  const prompt = `
あなたは香水のエキスパートです。世界中の香水についての知識を持ちながら、香水についてわかりやすく説明することができます。以下の指示に従って日本語のみでお答えください。中国語や他の言語は使用しないでください。

以下の香水の特徴から、簡潔でオリジナルのコンセプトを生成してください。
[メイン香水]
名前: ${perfume.metadata.name_jp}
ブランド: ${perfume.metadata.brand}
[メイン香水の特徴]
- すべてのノート: ${features.mainPerfumeNotes.join(", ")}
- ユニークなノート: ${features.uniqueNotes.join(", ")}
[共通の特徴]
共通するノート: ${features.commonNotes.join(", ")}

以下の点を含めて、このメイン香水のコンセプトを150文字程度で生成してください：
1. この香水ならではの特徴や魅力
2. どのような感情や記憶を想起させるか
3. 全体的な印象（甘い、爽やか、深みがあるなど）

コンセプトは、香りと感情を結びつけるような表現的な言葉を使って描写してください。
類似香水との比較は含めないでください。純粋にこの香水自体の特徴を描写してください。
必ず日本語のみで回答してください。
`;
  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama3.2",
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.3,
        stop: ["</response>", "###"],
        language: "ja",
      },
    }),
  });
  const data = await response.json();
  if (data.error) {
    throw new Error(data.error);
  }
  return data.response;
}

async function rewriteConcept(concept: any) {
  const prompt = `
あなたは香水のエキスパートです。香水について初心者にもわかりやすく説明することができます。以下の指示に従って日本語のみでお答えください。

【最重要指示：ハルシネーション防止】
私があなたに与える香水説明文（元文章）を、カタカナを減らして初心者にもわかりやすく書き換えてください。
ただし、元文章に含まれる情報だけを使い、一切の創作や想像は行わないでください。あくまで書き換えタスクであることを忘れないでください。

【厳格なルール - 必ず守ってください】
1. 元文章にない香料名は絶対に追加しないこと
2. 元文章にない概念は絶対に言及しないこと

【書き換え手順 - 必ずこの順序で行うこと】
1. 元文章を注意深く読み、含まれる情報（香料、特徴、ブランド、広告など）を抽出する
2. 抽出した情報だけを使って書き換える（情報の追加は厳禁）
3. カタカナを日本語に置き換える（下記の変換リストを使用）
4. 2〜3文の短い説明文にする（120文字以内）

【文章の構成】
必ず以下の構成で書いてください（2〜3文まで）：
   - 1文目：全体的な印象を簡潔に（例：軽やかで現代的な女性向けの香り）
   - 2文目：具体的な香りの組み合わせを説明（例：最初は果実と花、中間は花、最後は温かみのある香り）
   - 3文目（必要な場合のみ）：香りの変化や特徴的な印象を追加

【専門的な香料と花の名称の言い換え】
   - 花の名前の言い換え：
     * フリージア：「小さな白や黄色の花」「春の小花」
     * ピオニー：「ボリュームのある牡丹のような花」
     * ロータス：「蓮の花」

  - 香料の言い換え：
    - 石けんのような：ホワイトムスク、ムスク
    - まろやかな木の香り：シダー、シカモアウッド
    - 森の中にいるような：オークモス → 森の土や木々を思わせる香り
    - 深みのある土の香り：パチュリ
    - 暖かみのある上品な香り：アンバー
    - さわやかな草の香り：ベチバー
    - ほのかなスパイシーな香り：アンブレットシード

【良い例】
新鮮で清潔感のある香りが特徴です。バラやユリの花の香りに、オレンジの爽やかさと石けんのような清潔感が調和しています。優しく心地よい香りが長く続きます。

【出力形式】
- 説明文をそのまま出力してください。余計な文章は一切不要です。
   - プレフィックスや説明文を付けないでください（「〜の説明文：」「〜を表現すると：」などは不要）
   - 引用符（"）は使わないでください
   - 直接説明文を始めてください
- 初心者が想像しやすい、具体的で分かりやすい表現を心がけてください

以下の元文章を書き換えてください：
${concept}
`;

  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama3.2",
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.3,
        stop: ["</response>", "###"],
        language: "ja",
      },
    }),
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error);
  }

  return data.response.trim();
}

async function generateRecommendation(
  query: string,
  perfume: any,
  enhancedConcept: string,
  similarPerfumes: any[],
  features: any
) {
  const recommendationPrompt = `
あなたは香水のエキスパートです。世界中の香水についての知識を持ちながら、香水についてわかりやすく説明することができます。以下の指示に従って日本語のみでお答えください。中国語や他の言語は使用しないでください。

以下の情報を元に、この香水の推薦文を生成してください。
[ユーザーの検索クエリ]
${query}
[メイン香水情報]
ブランド: ${perfume.metadata.brand}
商品名: ${perfume.metadata.name_jp} (${perfume.metadata.name_en})
[生成されたコンセプト]
${enhancedConcept}
[類似香水との比較]
${similarPerfumes
  .map(
    (p) => `
・${p.metadata.name_jp} (類似度: ${(p.score * 100).toFixed(1)}%)
  - ブランド: ${p.metadata.brand}
`
  )
  .join("\n")}
[共通の特徴]
共通するノート: ${features.commonNotes.join(", ")}
この香水独自のノート: ${features.uniqueNotes.join(", ")}
[追加情報]
性別: ${perfume.metadata.sex}
カテゴリー: ${perfume.metadata.categories.join(", ")}
使用シーン: ${perfume.metadata.usage_scenes.join(", ")}
おすすめの季節: ${perfume.metadata.seasons.join(", ")}

以下の点を含めた、魅力的で具体的な推薦文を100文字程度で生成してください：
1. この香水が検索クエリに合致する理由（具体的に）
2. 類似香水と比べた際の特徴や違い（簡潔に1つの特徴を挙げる）
3. この香水ならではの魅力（1つだけ具体的に）
4. 提案する最適な使用シーン（1つだけ具体的に）

必ず日本語のみで回答してください。
抽象的な表現は避け、具体的な表現を使ってください。
専門的な香料名は一般的な言葉に置き換えてください。
類似する香水の名前は説明に含めないでください。
`;

  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama3.2",
      prompt: recommendationPrompt,
      stream: false,
      options: {
        temperature: 0.3,
        stop: ["</response>", "###"],
        language: "ja",
      },
    }),
  });
  const data = await response.json();
  if (data.error) {
    throw new Error(data.error);
  }
  return data.response;
}

export async function POST(req: Request) {
  try {
    const { perfume, query } = await req.json();
    console.log("Received request:", { perfume, query });

    // 類似香水を検索
    const similarPerfumes = await findSimilarPerfumes(perfume);
    console.log(
      "Found similar perfumes:",
      similarPerfumes.map((p) => p.metadata.name_jp)
    );

    // 共通の特徴を分析
    const features = analyzeCommonFeatures(perfume, similarPerfumes);
    console.log("Analyzed features:", features);

    // 拡充されたコンセプトを生成
    const rawConcept = await generateEnhancedConcept(
      perfume,
      similarPerfumes,
      features
    );
    console.log("Generated raw concept:", rawConcept);

    // コンセプトを書き換え
    const enhancedConcept = await rewriteConcept(rawConcept);
    console.log("Rewritten concept:", enhancedConcept);

    // 推薦文を生成
    const recommendation = await generateRecommendation(
      query,
      perfume,
      enhancedConcept,
      similarPerfumes,
      features
    );
    console.log("Generated recommendation:", recommendation);

    return NextResponse.json({
      success: true,
      concept: enhancedConcept,
      recommendation: recommendation,
      similarPerfumes: similarPerfumes.map((p) => ({
        name: p.metadata.name_jp,
        brand: p.metadata.brand,
        similarity: p.score,
      })),
    });
  } catch (error) {
    console.error("Recommendation generation error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate recommendation",
      },
      { status: 500 }
    );
  }
}
