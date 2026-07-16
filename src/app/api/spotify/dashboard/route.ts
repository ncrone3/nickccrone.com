import { NextResponse } from "next/server";
import {
  getSpotifyCurrentPlaybackData,
  SpotifyApiError,
  SpotifyConfigError,
} from "@/lib/spotify";
import {
  getLastfmRecentTracks,
  LastfmApiError,
  LastfmConfigError,
} from "@/lib/lastfm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [currentResult, recentResult] = await Promise.allSettled([
      getSpotifyCurrentPlaybackData(),
      getLastfmRecentTracks(),
    ]);
    const currentData =
      currentResult.status === "fulfilled" ? currentResult.value : null;
    const recentData =
      recentResult.status === "fulfilled" ? recentResult.value : null;
    const errors = {
      ...(currentResult.status === "rejected"
        ? { currentlyPlaying: getProviderErrorMessage(currentResult.reason) }
        : {}),
      ...(recentResult.status === "rejected"
        ? { recentlyPlayed: getProviderErrorMessage(recentResult.reason) }
        : recentData?.errors),
    };

    if (!currentData && !recentData) {
      if (currentResult.status === "rejected") {
        throw currentResult.reason;
      }

      if (recentResult.status === "rejected") {
        throw recentResult.reason;
      }

      throw new Error("Unable to load dashboard data.");
    }

    return NextResponse.json({
      currentlyPlaying: currentData?.currentlyPlaying ?? null,
      recentlyPlayed: recentData?.recentlyPlayed ?? [],
      errors: Object.keys(errors).length ? errors : undefined,
      updatedAt:
        currentData?.updatedAt ?? recentData?.updatedAt ?? new Date().toISOString(),
    }, {
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
          recentlyPlayed: [],
          updatedAt: new Date().toISOString(),
        },
        { status: 503 },
      );
    }

    if (error instanceof LastfmConfigError) {
      return NextResponse.json(
        {
          error: error.message,
          currentlyPlaying: null,
          recentlyPlayed: [],
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
          recentlyPlayed: [],
          retryAfter: error.retryAfter,
          updatedAt: new Date().toISOString(),
        },
        { status: error.status },
      );
    }

    if (error instanceof LastfmApiError) {
      return NextResponse.json(
        {
          error: error.message,
          currentlyPlaying: null,
          recentlyPlayed: [],
          updatedAt: new Date().toISOString(),
        },
        { status: error.status },
      );
    }

    return NextResponse.json(
      {
        error: "Unable to load Spotify dashboard data.",
        currentlyPlaying: null,
        recentlyPlayed: [],
        updatedAt: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

function getProviderErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unable to load provider data.";
}
