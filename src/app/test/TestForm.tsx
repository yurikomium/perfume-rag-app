"use client";

import { useState } from "react";

export default function TestForm() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/test-llm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      console.log("Client received data:", data);

      if (data.success) {
        setResponse(data.response);
      } else {
        setResponse("Error: " + data.error);
      }
    } catch (error) {
      setResponse("Error occurred while fetching response");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4">
        <textarea
          className="w-full p-2 border rounded"
          rows={4}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="プロンプトを入力してください..."
        />
      </div>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        onClick={handleSubmit}
        disabled={isLoading || !prompt.trim()}
      >
        {isLoading ? "生成中..." : "生成"}
      </button>
      {response && (
        <div className="mt-4">
          <h2 className="font-bold mb-2">応答:</h2>
          <div className="p-4 bg-gray-100 rounded whitespace-pre-wrap">
            {response}
          </div>
        </div>
      )}
    </div>
  );
}
