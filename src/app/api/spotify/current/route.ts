import { NextResponse } from "next/server";
import {
  getSpotifyCurrentPlaybackData,
  SpotifyApiError,
  SpotifyConfigError,
} from "@/lib/spotify";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await getSpotifyCurrentPlaybackData(), {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof SpotifyConfigError) {
      return NextResponse.json(
        {
          error: error.message,
          currentlyPlaying: null,
          updatedAt: new Date().toISOString(),
        },
        { status: 503 },
      );
    }

    if (error instanceof SpotifyApiError) {
      return NextResponse.json(
        {
          error: error.message,
          currentlyPlaying: null,
          retryAfter: error.retryAfter,
          updatedAt: new Date().toISOString(),
        },
        { status: error.status },
      );
    }

    return NextResponse.json(
      {
        error: "Unable to load current Spotify playback.",
        currentlyPlaying: null,
        updatedAt: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
