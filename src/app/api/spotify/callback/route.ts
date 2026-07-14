import { NextRequest, NextResponse } from "next/server";
import { exchangeSpotifyCodeForTokens } from "@/lib/spotify";

export const dynamic = "force-dynamic";

function htmlResponse(body: string, status = 200) {
  return new NextResponse(body, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return htmlResponse("<h1>Not found</h1>", 404);
  }

  const params = request.nextUrl.searchParams;
  const code = params.get("code");
  const error = params.get("error");
  const state = params.get("state");
  const expectedState = request.cookies.get("spotify_auth_state")?.value;
  const responseCookie = {
    name: "spotify_auth_state",
    value: "",
    options: {
      maxAge: 0,
      path: "/api/spotify",
    },
  };

  if (error) {
    const response = htmlResponse(
      `<h1>Spotify authorization failed</h1><p>${escapeHtml(error)}</p>`,
      400,
    );
    response.cookies.set(
      responseCookie.name,
      responseCookie.value,
      responseCookie.options,
    );
    return response;
  }

  if (!code || !state || !expectedState || state !== expectedState) {
    const response = htmlResponse(
      "<h1>Spotify authorization failed</h1><p>Invalid authorization state.</p>",
      400,
    );
    response.cookies.set(
      responseCookie.name,
      responseCookie.value,
      responseCookie.options,
    );
    return response;
  }

  try {
    const tokens = await exchangeSpotifyCodeForTokens(code);
    const refreshToken = tokens.refresh_token;
    const response = htmlResponse(`
      <main style="font-family: system-ui, sans-serif; line-height: 1.5; padding: 2rem; max-width: 48rem;">
        <h1>Spotify refresh token created</h1>
        <p>Add this value as <code>SPOTIFY_REFRESH_TOKEN</code> in your local and Vercel environment variables. Treat it like a password and do not commit it.</p>
        <pre style="white-space: pre-wrap; overflow-wrap: anywhere; padding: 1rem; border: 1px solid #ddd; background: #f7f7f7;">${refreshToken}</pre>
        <p>After saving the env var, restart the dev server and open <a href="/livemusic">/livemusic</a>.</p>
      </main>
    `);

    response.cookies.set(
      responseCookie.name,
      responseCookie.value,
      responseCookie.options,
    );
    return response;
  } catch (caughtError) {
    const message =
      caughtError instanceof Error
        ? caughtError.message
        : "Unable to complete Spotify authorization.";
    const response = htmlResponse(
      `<h1>Spotify authorization failed</h1><p>${escapeHtml(message)}</p>`,
      500,
    );

    response.cookies.set(
      responseCookie.name,
      responseCookie.value,
      responseCookie.options,
    );
    return response;
  }
}
