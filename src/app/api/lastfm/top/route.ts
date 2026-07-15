import { NextRequest, NextResponse } from "next/server";
import {
  getLastfmTopItems,
  isLastfmTopPeriod,
  isLastfmTopType,
  LastfmApiError,
  LastfmConfigError,
  type LastfmTopPeriod,
  type LastfmTopType,
} from "@/lib/lastfm";

export const revalidate = 86_400;

export async function GET(request: NextRequest) {
  const typeParam = request.nextUrl.searchParams.get("type") ?? "songs";
  const periodParam = request.nextUrl.searchParams.get("period") ?? "month";

  if (!isLastfmTopType(typeParam) || !isLastfmTopPeriod(periodParam)) {
    return NextResponse.json(
      {
        error: "Invalid Last.fm top chart request.",
        items: [],
        updatedAt: new Date().toISOString(),
      },
      { status: 400 },
    );
  }

  const type: LastfmTopType = typeParam;
  const period: LastfmTopPeriod = periodParam;

  try {
    return NextResponse.json(await getLastfmTopItems(type, period), {
      headers: {
        "Cache-Control": "s-maxage=86400, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    if (error instanceof LastfmConfigError) {
      return NextResponse.json(
        {
          error: error.message,
          type,
          period,
          items: [],
          updatedAt: new Date().toISOString(),
        },
        { status: 503 },
      );
    }

    if (error instanceof LastfmApiError) {
      return NextResponse.json(
        {
          error: error.message,
          type,
          period,
          items: [],
          updatedAt: new Date().toISOString(),
        },
        { status: error.status },
      );
    }

    return NextResponse.json(
      {
        error: "Unable to load Last.fm top chart data.",
        type,
        period,
        items: [],
        updatedAt: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
