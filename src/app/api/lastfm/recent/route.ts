import { NextResponse } from "next/server";
import {
  getLastfmRecentTracks,
  LastfmApiError,
  LastfmConfigError,
} from "@/lib/lastfm";

export const revalidate = 30;

export async function GET() {
  try {
    return NextResponse.json(await getLastfmRecentTracks(), {
      headers: {
        "Cache-Control": "s-maxage=30, stale-while-revalidate=300, stale-if-error=3600",
      },
    });
  } catch (error) {
    if (error instanceof LastfmConfigError) {
      return NextResponse.json(
        {
          error: error.message,
          recentlyPlayed: [],
          updatedAt: new Date().toISOString(),
        },
        { status: 503 },
      );
    }

    if (error instanceof LastfmApiError) {
      return NextResponse.json(
        {
          error: error.message,
          recentlyPlayed: [],
          updatedAt: new Date().toISOString(),
        },
        { status: error.status },
      );
    }

    return NextResponse.json(
      {
        error: "Unable to load recently played tracks.",
        recentlyPlayed: [],
        updatedAt: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
