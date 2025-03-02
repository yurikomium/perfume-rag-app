"use client";

import { useState, useEffect } from "react";
import { ProcessedPerfume, Sex } from "./types/perfume";
import PerfumeCard from "@/app/components/PerfumeCard";
import SexSelector from "@/app/components/SexSelector";
import SeasonSelector from "@/app/components/SeasonSelector";
import { Season } from "@/app/types/perfume";
import UsageSceneSelector from "@/app/components/UsageSceneSelector";
import { UsageScene } from "@/app/types/usageScene";

interface SearchResult {
  text: string;
  metadata: {
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
  };
  score: number;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [selectedSex, setSelectedSex] = useState<Sex | null>(null);
  const [selectedSeasons, setSelectedSeasons] = useState<Season[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recommendations, setRecommendations] = useState<{
    [key: string]: {
      concept: string;
      recommendation: string;
    };
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [hasSearched, setHasSearched] = useState(false);
  const [showNoResults, setShowNoResults] = useState(false);
  const [selectedUsageScenes, setSelectedUsageScenes] = useState<UsageScene[]>(
    []
  );

  const placeholderText = `香水に求める条件を入力してください。
  
【入力例】
- フレッシュな香り
- オフィスで使える
- 爽やかな柑橘系`;

  // 検索結果がない場合のメッセージ表示を遅延させる
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isLoading) {
      setShowNoResults(false);
    } else if (hasSearched && results.length === 0) {
      timer = setTimeout(() => {
        setShowNoResults(true);
      }, 5000); // 5秒後に表示
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading, hasSearched, results]);

  const handleSearch = async () => {
    setIsLoading(true);
    setHasSearched(true);
    setShowNoResults(false);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: query,
          sex: selectedSex,
          seasons: selectedSeasons,
          usage_scenes: selectedUsageScenes,
        }),
      });
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error("検索に失敗しました:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateRecommendation = async (perfume: ProcessedPerfume) => {
    const id = perfume.metadata.name_jp;
    setIsGenerating((prev) => ({ ...prev, [id]: true }));

    try {
      const response = await fetch("/api/generate-recommendation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ perfume, query }),
      });

      const data = await response.json();
      console.log("レスポンスデータ:", data);

      if (data.success) {
        setRecommendations((prev) => ({
          ...prev,
          [id]: {
            concept: data.concept,
            recommendation: data.recommendation,
          },
        }));
      } else {
        console.error("生成に失敗しました:", data.error, data.details);
        alert(`生成に失敗しました: ${data.details || data.error}`);
      }
    } catch (error) {
      console.error("推薦文の生成に失敗しました:", error);
      alert("推薦文の生成中にエラーが発生しました");
    } finally {
      setIsGenerating((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        あなたに合う香水を検索しよう🕵️‍♀️
      </h1>
      <div className="mb-6">
        <label className="block text-sm font-medium text-light mb-2">
          性別
        </label>
        <SexSelector selectedSex={selectedSex} onSelect={setSelectedSex} />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-light mb-2">
          季節
        </label>
        <SeasonSelector
          selectedSeasons={selectedSeasons}
          onSelect={setSelectedSeasons}
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-light mb-2">
          使いたい場面
        </label>
        <UsageSceneSelector
          selectedScenes={selectedUsageScenes}
          onSelect={setSelectedUsageScenes}
        />
      </div>

      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full h-56 p-4 border rounded-lg"
        placeholder={placeholderText}
      />

      <button
        className="btn-primary mt-4 mb-10 font-bold"
        onClick={handleSearch}
        disabled={
          isLoading ||
          (!query.trim() &&
            !selectedSex &&
            selectedSeasons.length === 0 &&
            selectedUsageScenes.length === 0)
        }
      >
        {isLoading ? "探し中..." : "探す"}
      </button>

      <div className="space-y-6">
        {hasSearched && (
          <>
            {isLoading ? (
              <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-4"></div>
                <p className="text-light">香水を探しています...</p>
              </div>
            ) : results.length > 0 ? (
              results.map((perfume) => (
                <PerfumeCard
                  key={perfume.metadata.id}
                  perfume={perfume}
                  query={query}
                />
              ))
            ) : showNoResults ? (
              <p className="text-light text-center py-5">
                検索結果がありません
              </p>
            ) : (
              <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-4"></div>
                <p className="text-light">香水を探しています...</p>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
