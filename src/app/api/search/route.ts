import { searchPerfumes } from "@/app/lib/search";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text, sex, seasons, usage_scenes } = await req.json();

    if (
      !text?.trim() &&
      !sex &&
      (!seasons || seasons.length === 0) &&
      (!usage_scenes || usage_scenes.length === 0)
    ) {
      return NextResponse.json(
        { error: "検索条件を入力してください" },
        { status: 400 }
      );
    }

    const results = await searchPerfumes(
      {
        text: text?.trim() || "",
        sex,
        seasons: seasons || [],
        usage_scenes: usage_scenes || [],
      },
      5
    );

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
