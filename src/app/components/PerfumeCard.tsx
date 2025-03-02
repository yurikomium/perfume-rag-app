"use client";

import { useState } from "react";
import { ProcessedPerfume } from "../types/perfume";
import { usageSceneMapping } from "../types/usageScene";

interface PerfumeCardProps {
  perfume: ProcessedPerfume;
  query: string;
}

function convertUsageScenesToDisplay(scenes: string[]): string[] {
  return scenes.map((scene) => {
    const entry = Object.values(usageSceneMapping).find(
      (value) => value.query === scene
    );
    return entry ? entry.display : scene;
  });
}

export default function PerfumeCard({ perfume, query }: PerfumeCardProps) {
  const [recommendation, setRecommendation] = useState<{
    concept: string;
    recommendation: string;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateRecommendation = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-recommendation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ perfume, query }),
      });

      const data = await response.json();
      if (data.success) {
        setRecommendation({
          concept: data.concept,
          recommendation: data.recommendation,
        });
      } else {
        console.error("Generation failed:", data.error);
        alert(`生成に失敗しました: ${data.error}`);
      }
    } catch (error) {
      console.error("Recommendation generation failed:", error);
      alert("推薦文の生成中にエラーが発生しました");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-semibold text-[var(--color-text)]">
            {perfume.metadata.name_jp}
            <span className="text-sm text-light ml-6">
              {perfume.metadata.name_en}
            </span>
          </h2>
        </div>
        <div className="text-right">
          {perfume.score && (
            <p className="text-m text-light">
              類似度: {(perfume.score * 100).toFixed(1)}%
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 text-gray-700">
        {recommendation ? (
          <div className="space-y-4">
            <div className="bg-amber-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-primary mb-2">
                香水のコンセプト
              </h3>
              <p className="text-gray-700 whitespace-pre-wrap">
                {recommendation.concept}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-secondary mb-2">
                あなたにおすすめのポイント
              </h3>
              <p className="text-gray-700 whitespace-pre-wrap">
                {recommendation.recommendation}
              </p>
            </div>
          </div>
        ) : (
          <button
            className="btn-secondary"
            onClick={generateRecommendation}
            disabled={isGenerating}
          >
            {isGenerating ? "生成中..." : "おすすめポイントを生成"}
          </button>
        )}
      </div>

      <div className="mt-4 text-gray-700 whitespace-pre-line">
        {perfume.text
          .split("\n")
          .filter(
            (line) =>
              !line.startsWith("名前:") &&
              !line.startsWith("コンセプト:") &&
              !line.startsWith("トップノート:") &&
              !line.startsWith("ミドルノート:") &&
              !line.startsWith("ラストノート:")
          )
          .join("\n")}
      </div>
    </div>
  );
}
