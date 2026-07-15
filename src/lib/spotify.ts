const SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1";
const SPOTIFY_ACCOUNTS_BASE_URL = "https://accounts.spotify.com";
const SPOTIFY_REQUEST_TIMEOUT_MS = 8_000;

export const SPOTIFY_SCOPES = [
  "user-read-currently-playing",
  "user-read-recently-played",
] as const;

type SpotifyImage = {
  url: string;
  height: number | null;
  width: number | null;
};

type SpotifyArtist = {
  name: string;
};

type SpotifyTrack = {
  id?: string;
  uri?: string;
  type: string;
  name: string;
  artists: SpotifyArtist[];
  album?: {
    name: string;
    images: SpotifyImage[];
  };
  external_urls?: {
    spotify?: string;
  };
  duration_ms?: number;
};

type SpotifyAlbumSearchItem = {
  name: string;
  artists: SpotifyArtist[];
  images: SpotifyImage[];
  external_urls?: {
    spotify?: string;
  };
};

type SpotifyArtistSearchItem = {
  name: string;
  images: SpotifyImage[];
  external_urls?: {
    spotify?: string;
  };
};

type SpotifySearchResponse = {
  tracks?: {
    items?: SpotifyTrack[];
  };
  albums?: {
    items?: SpotifyAlbumSearchItem[];
  };
  artists?: {
    items?: SpotifyArtistSearchItem[];
  };
};

type SpotifyCurrentlyPlayingResponse = {
  is_playing?: boolean;
  item?: SpotifyTrack | null;
  progress_ms?: number | null;
  currently_playing_type?: string;
};

type SpotifyRecentlyPlayedResponse = {
  items?: Array<{
    track?: SpotifyTrack;
    played_at?: string;
  }>;
};

type SpotifyTokenResponse = {
  access_token?: string;
  expires_in?: number;
  refresh_token?: string;
  error?: string;
  error_description?: string;
};

type SpotifyFetchOptions = {
  retryOnRateLimit?: boolean;
};

export type DashboardTrack = {
  id?: string;
  title: string;
  artist: string;
  album: string;
  image: string;
  spotifyUrl: string;
  playedAt?: string;
  isPlaying?: boolean;
  progressMs?: number | null;
  durationMs?: number;
};

export type SpotifyDashboardData = {
  currentlyPlaying: DashboardTrack | null;
  recentlyPlayed: DashboardTrack[];
  updatedAt: string;
};

export type SpotifyArtworkSearchType = "track" | "album" | "artist";

export type SpotifyArtworkResult = {
  image: string;
  spotifyUrl: string;
};

export class SpotifyConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SpotifyConfigError";
  }
}

export class SpotifyApiError extends Error {
  status: number;
  retryAfter: string | null;

  constructor(status: number, message: string, retryAfter: string | null) {
    super(message);
    this.name = "SpotifyApiError";
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

async function fetchSpotify(
  input: RequestInfo | URL,
  init: RequestInit = {},
) {
  try {
    return await fetch(input, {
      ...init,
      signal: AbortSignal.timeout(SPOTIFY_REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new SpotifyApiError(
        504,
        "Spotify request timed out.",
        null,
      );
    }

    throw error;
  }
}

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new SpotifyConfigError(`Missing ${name}.`);
  }

  return value;
}

function getClientCredentials() {
  return {
    clientId: getRequiredEnv("SPOTIFY_CLIENT_ID"),
    clientSecret: getRequiredEnv("SPOTIFY_CLIENT_SECRET"),
  };
}

export function getSpotifyRedirectUri() {
  return getRequiredEnv("SPOTIFY_REDIRECT_URI");
}

function getSpotifyRefreshToken() {
  return getRequiredEnv("SPOTIFY_REFRESH_TOKEN");
}

function getBasicAuthHeader() {
  const { clientId, clientSecret } = getClientCredentials();
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64",
  );

  return `Basic ${credentials}`;
}

async function parseSpotifyError(response: Response) {
  const fallback = `Spotify request failed with status ${response.status}.`;

  try {
    const body = await response.json();
    const message =
      body?.error?.message ??
      body?.error_description ??
      body?.error ??
      fallback;

    return String(message);
  } catch {
    return fallback;
  }
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function spotifyFetch<T>(
  path: string,
  accessToken: string,
  options: SpotifyFetchOptions = {},
  attempt = 0,
): Promise<T | null> {
  const response = await fetchSpotify(`${SPOTIFY_API_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (response.status === 204) {
    return null;
  }

  if (response.status === 429 && options.retryOnRateLimit !== false && attempt < 2) {
    const retryAfter = response.headers.get("retry-after");
    const retryAfterMs = retryAfter
      ? Number(retryAfter) * 1000
      : 500 * 2 ** attempt;

    await sleep(Math.max(retryAfterMs, 250));
    return spotifyFetch<T>(path, accessToken, options, attempt + 1);
  }

  if (!response.ok) {
    throw new SpotifyApiError(
      response.status,
      await parseSpotifyError(response),
      response.headers.get("retry-after"),
    );
  }

  return response.json() as Promise<T>;
}

function normalizeTrack(
  track: SpotifyTrack | null | undefined,
  options: {
    playedAt?: string;
    isPlaying?: boolean;
    progressMs?: number | null;
  } = {},
): DashboardTrack | null {
  if (!track || track.type !== "track") {
    return null;
  }

  return {
    id: track.id,
    title: track.name,
    artist: track.artists.map((artist) => artist.name).join(", "),
    album: track.album?.name ?? "",
    image: track.album?.images[0]?.url ?? "",
    spotifyUrl: track.external_urls?.spotify ?? "https://open.spotify.com/",
    durationMs: track.duration_ms,
    ...options,
  };
}

function getTrackDedupKey(track: DashboardTrack) {
  return (
    track.id ??
    track.spotifyUrl ??
    `${track.title.toLowerCase()}|${track.artist.toLowerCase()}|${track.album.toLowerCase()}`
  );
}

function getUniqueRecentTracks(tracks: DashboardTrack[], limit: number) {
  const seen = new Set<string>();
  const uniqueTracks: DashboardTrack[] = [];

  for (const track of tracks) {
    const key = getTrackDedupKey(track);

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    uniqueTracks.push(track);

    if (uniqueTracks.length === limit) {
      break;
    }
  }

  return uniqueTracks;
}

export function getSpotifyAuthorizeUrl(state: string) {
  const { clientId } = getClientCredentials();
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: getSpotifyRedirectUri(),
    scope: SPOTIFY_SCOPES.join(" "),
    state,
  });

  return `${SPOTIFY_ACCOUNTS_BASE_URL}/authorize?${params.toString()}`;
}

export async function exchangeSpotifyCodeForTokens(code: string) {
  const response = await fetchSpotify(`${SPOTIFY_ACCOUNTS_BASE_URL}/api/token`, {
    method: "POST",
    headers: {
      Authorization: getBasicAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: getSpotifyRedirectUri(),
    }),
    cache: "no-store",
  });

  const body = (await response.json()) as SpotifyTokenResponse;

  if (!response.ok || !body.refresh_token) {
    throw new SpotifyApiError(
      response.status,
      body.error_description ??
        body.error ??
        "Spotify did not return a refresh token.",
      response.headers.get("retry-after"),
    );
  }

  return body;
}

export async function getSpotifyAccessToken() {
  const response = await fetchSpotify(`${SPOTIFY_ACCOUNTS_BASE_URL}/api/token`, {
    method: "POST",
    headers: {
      Authorization: getBasicAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: getSpotifyRefreshToken(),
    }),
    cache: "no-store",
  });

  const body = (await response.json()) as SpotifyTokenResponse;

  if (!response.ok || !body.access_token) {
    throw new SpotifyApiError(
      response.status,
      body.error_description ?? body.error ?? "Unable to refresh Spotify token.",
      response.headers.get("retry-after"),
    );
  }

  return body.access_token;
}

function buildSearchQuery({
  type,
  title,
  artist,
}: {
  type: SpotifyArtworkSearchType;
  title: string;
  artist?: string;
}) {
  const quotedTitle = quoteSearchValue(title);
  const quotedArtist = artist ? quoteSearchValue(artist) : "";

  if (type === "artist") {
    return `artist:${quotedTitle}`;
  }

  const titleFilter =
    type === "album" ? `album:${quotedTitle}` : `track:${quotedTitle}`;

  return quotedArtist ? `${titleFilter} artist:${quotedArtist}` : titleFilter;
}

function quoteSearchValue(value: string) {
  const sanitized = value.replaceAll('"', "").trim();

  return sanitized.includes(" ") ? `"${sanitized}"` : sanitized;
}

function getFirstSpotifyImage(images: SpotifyImage[] | undefined) {
  return images?.[0]?.url ?? "";
}

export async function searchSpotifyArtwork({
  type,
  title,
  artist,
}: {
  type: SpotifyArtworkSearchType;
  title: string;
  artist?: string;
}): Promise<SpotifyArtworkResult | null> {
  const accessToken = await getSpotifyAccessToken();
  return searchSpotifyArtworkWithAccessToken(accessToken, {
    type,
    title,
    artist,
  });
}

export async function searchSpotifyArtworkWithAccessToken(
  accessToken: string,
  {
    type,
    title,
    artist,
  }: {
    type: SpotifyArtworkSearchType;
    title: string;
    artist?: string;
  },
): Promise<SpotifyArtworkResult | null> {
  const params = new URLSearchParams({
    q: buildSearchQuery({ type, title, artist }),
    type,
    limit: "1",
  });
  const response = await spotifyFetch<SpotifySearchResponse>(
    `/search?${params.toString()}`,
    accessToken,
  );

  if (type === "track") {
    const track = response?.tracks?.items?.[0];
    const image = getFirstSpotifyImage(track?.album?.images);

    return image
      ? {
          image,
          spotifyUrl:
            track?.external_urls?.spotify ?? "https://open.spotify.com/",
        }
      : null;
  }

  if (type === "album") {
    const album = response?.albums?.items?.[0];
    const image = getFirstSpotifyImage(album?.images);

    return image
      ? {
          image,
          spotifyUrl:
            album?.external_urls?.spotify ?? "https://open.spotify.com/",
        }
      : null;
  }

  const spotifyArtist = response?.artists?.items?.[0];
  const image = getFirstSpotifyImage(spotifyArtist?.images);

  return image
    ? {
        image,
        spotifyUrl:
          spotifyArtist?.external_urls?.spotify ?? "https://open.spotify.com/",
      }
    : null;
}

export async function getSpotifyDashboardData(): Promise<SpotifyDashboardData> {
  const accessToken = await getSpotifyAccessToken();
  const [currentlyPlayingResult, recentlyPlayedResult] = await Promise.allSettled([
    spotifyFetch<SpotifyCurrentlyPlayingResponse>(
      "/me/player/currently-playing",
      accessToken,
      { retryOnRateLimit: false },
    ),
    spotifyFetch<SpotifyRecentlyPlayedResponse>(
      "/me/player/recently-played?limit=20",
      accessToken,
      { retryOnRateLimit: false },
    ),
  ]);
  const currentlyPlaying =
    currentlyPlayingResult.status === "fulfilled"
      ? currentlyPlayingResult.value
      : null;
  const recentlyPlayed =
    recentlyPlayedResult.status === "fulfilled"
      ? recentlyPlayedResult.value
      : null;

  if (
    currentlyPlayingResult.status === "rejected" &&
    recentlyPlayedResult.status === "rejected"
  ) {
    throw currentlyPlayingResult.reason;
  }

  const normalizedRecentTracks =
    recentlyPlayed?.items
      ?.map((item) =>
        normalizeTrack(item.track, {
          playedAt: item.played_at,
        }),
      )
      .filter((track): track is DashboardTrack => Boolean(track)) ?? [];

  return {
    currentlyPlaying: currentlyPlaying?.is_playing
      ? normalizeTrack(currentlyPlaying.item, {
          isPlaying: true,
          progressMs: currentlyPlaying.progress_ms,
        })
      : null,
    recentlyPlayed: getUniqueRecentTracks(normalizedRecentTracks, 5),
    updatedAt: new Date().toISOString(),
  };
}
