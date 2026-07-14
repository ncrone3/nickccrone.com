import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getSpotifyAuthorizeUrl, getSpotifyRedirectUri } from "@/lib/spotify";

export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const state = randomUUID();

  try {
    const redirectUri = getSpotifyRedirectUri();
    const response = NextResponse.redirect(getSpotifyAuthorizeUrl(state));

    response.cookies.set("spotify_auth_state", state, {
      httpOnly: true,
      sameSite: "lax",
      secure: redirectUri.startsWith("https://"),
      maxAge: 60 * 10,
      path: "/api/spotify",
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Spotify authorization is not configured.",
      },
      { status: 500 },
    );
  }
}
