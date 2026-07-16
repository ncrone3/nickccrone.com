import { NextRequest, NextResponse } from "next/server";

export const revalidate = 30;

export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL("/api/lastfm/recent", request.url), 308);
}
