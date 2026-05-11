import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type AppsScriptResponse = {
  ok?: boolean;
  rows?: unknown[];
  error?: string;
};

export async function GET() {
  const scriptUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;

  if (!scriptUrl) {
    return NextResponse.json(
      { ok: false, error: "NEXT_PUBLIC_GOOGLE_SCRIPT_URL is not configured." },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(scriptUrl, {
      method: "GET",
      cache: "no-store",
    });

    const text = await response.text();

    try {
      const data = JSON.parse(text) as AppsScriptResponse;
      return NextResponse.json(data, { status: data.ok === false ? 500 : 200 });
    } catch {
      return NextResponse.json(
        {
          ok: false,
          error: "Apps Script did not return JSON. Please update doGet() to return response rows as JSON.",
          raw: text,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
