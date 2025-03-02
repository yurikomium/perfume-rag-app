export const usageSceneMapping = {
  office: {
    display: "仕事",
    query: "オフィス",
    output: "仕事を頑張りたいとき",
  },
  date: {
    display: "デート",
    query: "デート",
    output: "デートを盛り上げたいとき",
  },
  daily: {
    display: "日常",
    query: "デイリー",
    output: "日常のお供に",
  },
  party: {
    display: "パーティー",
    query: "パーティー",
    output: "パーティーやお祝いの場で",
  },
  relax: {
    display: "くつろぎ",
    query: "リラックス",
    output: "リラックスしたいとき",
  },
} as const;

export type UsageSceneKey = keyof typeof usageSceneMapping;
export type UsageScene = (typeof usageSceneMapping)[UsageSceneKey]["query"];
