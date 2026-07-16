import {
  getSpotifyAccessToken,
  searchSpotifyArtworkWithAccessToken,
  type SpotifyArtworkSearchType,
} from "@/lib/spotify";

const LASTFM_API_URL = "https://ws.audioscrobbler.com/2.0/";
const LASTFM_REQUEST_TIMEOUT_MS = 8_000;
const LASTFM_REVALIDATE_SECONDS = 24 * 60 * 60;
const LASTFM_RECENT_REVALIDATE_SECONDS = 30;
const LASTFM_RECENT_LIMIT = 5;
const LASTFM_RECENT_FETCH_LIMIT = 25;
const SPOTIFY_ARTWORK_CACHE_MS = 24 * 60 * 60 * 1000;

export type LastfmTopType = "songs" | "albums" | "artists";
export type LastfmTopPeriod = "week" | "month" | "year";

type LastfmImage = {
  "#text"?: string;
  size?: string;
};

type LastfmArtistSummary =
  | string
  | {
      name?: string;
      url?: string;
      "#text"?: string;
    };

type LastfmTopTrack = {
  name?: string;
  playcount?: string;
  url?: string;
  artist?: LastfmArtistSummary;
  image?: LastfmImage[];
};

type LastfmTopAlbum = {
  name?: string;
  playcount?: string;
  url?: string;
  artist?: LastfmArtistSummary;
  image?: LastfmImage[];
};

type LastfmTopArtist = {
  name?: string;
  playcount?: string;
  url?: string;
  image?: LastfmImage[];
};

type LastfmRecentTrack = {
  name?: string;
  url?: string;
  artist?: LastfmArtistSummary;
  album?: LastfmArtistSummary;
  image?: LastfmImage[];
  date?: {
    uts?: string;
    "#text"?: string;
  };
  "@attr"?: {
    nowplaying?: string;
  };
};

type LastfmErrorResponse = {
  error?: number;
  message?: string;
};

type LastfmTopTracksResponse = LastfmErrorResponse & {
  toptracks?: {
    track?: LastfmTopTrack[];
  };
};

type LastfmTopAlbumsResponse = LastfmErrorResponse & {
  topalbums?: {
    album?: LastfmTopAlbum[];
  };
};

type LastfmTopArtistsResponse = LastfmErrorResponse & {
  topartists?: {
    artist?: LastfmTopArtist[];
  };
};

type LastfmRecentTracksResponse = LastfmErrorResponse & {
  recenttracks?: {
    track?: LastfmRecentTrack[];
  };
};

export type LastfmTopItem = {
  title: string;
  artist: string;
  image: string;
  lastfmUrl: string;
  spotifyUrl?: string;
  playcount: number;
};

export type LastfmTopResponse = {
  type: LastfmTopType;
  period: LastfmTopPeriod;
  items: LastfmTopItem[];
  updatedAt: string;
};

export type LastfmRecentItem = {
  title: string;
  artist: string;
  album: string;
  image: string;
  lastfmUrl: string;
  spotifyUrl?: string;
  playedAt?: string;
};

export type LastfmRecentResponse = {
  recentlyPlayed: LastfmRecentItem[];
  errors?: {
    recentlyPlayed?: string;
  };
  updatedAt: string;
};

type SpotifyArtworkCacheEntry = {
  result: {
    image: string;
    spotifyUrl: string;
  } | null;
  expiresAt: number;
};

export class LastfmConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LastfmConfigError";
  }
}

export class LastfmApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "LastfmApiError";
    this.status = status;
  }
}

const typeToMethod: Record<LastfmTopType, string> = {
  songs: "user.gettoptracks",
  albums: "user.gettopalbums",
  artists: "user.gettopartists",
};

const periodToLastfmPeriod: Record<LastfmTopPeriod, string> = {
  week: "7day",
  month: "1month",
  year: "12month",
};

const spotifyArtworkCache = new Map<string, SpotifyArtworkCacheEntry>();

export function isLastfmTopType(value: string): value is LastfmTopType {
  return value === "songs" || value === "albums" || value === "artists";
}

export function isLastfmTopPeriod(value: string): value is LastfmTopPeriod {
  return value === "week" || value === "month" || value === "year";
}

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new LastfmConfigError(`Missing ${name}.`);
  }

  return value;
}

function getArtistName(artist: LastfmArtistSummary | undefined) {
  if (!artist) {
    return "";
  }

  if (typeof artist === "string") {
    return artist;
  }

  return artist.name ?? artist["#text"] ?? "";
}

function getLargestImage(images: LastfmImage[] | undefined) {
  const image = images?.findLast((candidate) => Boolean(candidate["#text"]));

  return image?.["#text"] ?? "";
}

function getPlaycount(value: string | undefined) {
  const count = Number(value);

  return Number.isFinite(count) ? count : 0;
}

function normalizeTrack(track: LastfmTopTrack): LastfmTopItem {
  return {
    title: track.name ?? "Unknown track",
    artist: getArtistName(track.artist),
    image: getLargestImage(track.image),
    lastfmUrl: track.url ?? "https://www.last.fm/",
    playcount: getPlaycount(track.playcount),
  };
}

function normalizeRecentTrack(track: LastfmRecentTrack): LastfmRecentItem {
  const playedAtTimestamp = Number(track.date?.uts);

  return {
    title: track.name ?? "Unknown track",
    artist: getArtistName(track.artist),
    album: getArtistName(track.album),
    image: getLargestImage(track.image),
    lastfmUrl: track.url ?? "https://www.last.fm/",
    playedAt: Number.isFinite(playedAtTimestamp)
      ? new Date(playedAtTimestamp * 1000).toISOString()
      : undefined,
  };
}

function normalizeAlbum(album: LastfmTopAlbum): LastfmTopItem {
  return {
    title: album.name ?? "Unknown album",
    artist: getArtistName(album.artist),
    image: getLargestImage(album.image),
    lastfmUrl: album.url ?? "https://www.last.fm/",
    playcount: getPlaycount(album.playcount),
  };
}

function normalizeArtist(artist: LastfmTopArtist): LastfmTopItem {
  return {
    title: artist.name ?? "Unknown artist",
    artist: `${getPlaycount(artist.playcount).toLocaleString()} plays`,
    image: getLargestImage(artist.image),
    lastfmUrl: artist.url ?? "https://www.last.fm/",
    playcount: getPlaycount(artist.playcount),
  };
}

async function enrichWithSpotifyArtwork(
  type: SpotifyArtworkSearchType,
  items: Array<LastfmTopItem | LastfmRecentItem>,
) {
  let accessToken: string;

  try {
    accessToken = await getSpotifyAccessToken();
  } catch {
    return items;
  }

  return Promise.all(
    items.map(async (item) => {
      try {
        const spotifyArtwork = await getCachedSpotifyArtwork(accessToken, {
          type,
          title: item.title,
          artist: type === "artist" ? undefined : item.artist,
        });

        if (!spotifyArtwork) {
          return item;
        }

        return {
          ...item,
          image: spotifyArtwork.image || item.image,
          spotifyUrl: spotifyArtwork.spotifyUrl,
        };
      } catch {
        return item;
      }
    }),
  );
}

async function getCachedSpotifyArtwork(
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
) {
  const cacheKey = getSpotifyArtworkCacheKey({ type, title, artist });
  const cachedArtwork = spotifyArtworkCache.get(cacheKey);

  if (cachedArtwork && cachedArtwork.expiresAt > Date.now()) {
    return cachedArtwork.result;
  }

  const result = await searchSpotifyArtworkWithAccessToken(accessToken, {
    type,
    title,
    artist,
  });

  spotifyArtworkCache.set(cacheKey, {
    result,
    expiresAt: Date.now() + SPOTIFY_ARTWORK_CACHE_MS,
  });

  return result;
}

function getSpotifyArtworkCacheKey({
  type,
  title,
  artist,
}: {
  type: SpotifyArtworkSearchType;
  title: string;
  artist?: string;
}) {
  return [type, title, artist ?? ""]
    .map((value) => value.trim().toLowerCase())
    .join("|");
}

function getRecentTrackDedupKey(track: LastfmRecentItem) {
  return `${track.title.toLowerCase()}|${track.artist.toLowerCase()}|${track.album.toLowerCase()}`;
}

function getUniqueRecentTracks(tracks: LastfmRecentItem[]) {
  const seen = new Set<string>();
  const uniqueTracks: LastfmRecentItem[] = [];

  for (const track of tracks) {
    const key = getRecentTrackDedupKey(track);

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    uniqueTracks.push(track);

    if (uniqueTracks.length === LASTFM_RECENT_LIMIT) {
      break;
    }
  }

  return uniqueTracks;
}

async function requestLastfm<T>(
  params: URLSearchParams,
  revalidateSeconds = LASTFM_REVALIDATE_SECONDS,
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${LASTFM_API_URL}?${params.toString()}`, {
      next: {
        revalidate: revalidateSeconds,
      },
      signal: AbortSignal.timeout(LASTFM_REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new LastfmApiError(504, "Last.fm request timed out.");
    }

    throw new LastfmApiError(502, "Unable to reach Last.fm.");
  }

  const body = await parseLastfmResponse<T>(response);

  if (!response.ok || body.error) {
    throw new LastfmApiError(
      getLastfmErrorStatus(body.error, response.status),
      body.message ?? "Unable to load Last.fm data.",
    );
  }

  return body;
}

async function parseLastfmResponse<T>(response: Response) {
  try {
    return (await response.json()) as T & LastfmErrorResponse;
  } catch {
    throw new LastfmApiError(
      response.ok ? 502 : response.status || 502,
      "Last.fm returned an unexpected response.",
    );
  }
}

function getLastfmErrorStatus(errorCode: number | undefined, status: number) {
  if (errorCode === 29) {
    return 429;
  }

  if (errorCode === 11 || errorCode === 16) {
    return 503;
  }

  return status || 502;
}

export async function getLastfmTopItems(
  type: LastfmTopType,
  period: LastfmTopPeriod,
): Promise<LastfmTopResponse> {
  const apiKey = getRequiredEnv("LASTFM_API_KEY");
  const username = getRequiredEnv("LASTFM_USERNAME");
  const params = new URLSearchParams({
    method: typeToMethod[type],
    user: username,
    api_key: apiKey,
    period: periodToLastfmPeriod[period],
    limit: "5",
    format: "json",
  });
  const response = await requestLastfm<
    LastfmTopTracksResponse | LastfmTopAlbumsResponse | LastfmTopArtistsResponse
  >(params);

  if (type === "songs") {
    const items =
      "toptracks" in response
        ? response.toptracks?.track?.map(normalizeTrack) ?? []
        : [];

    return {
      type,
      period,
      items: (await enrichWithSpotifyArtwork("track", items)) as LastfmTopItem[],
      updatedAt: new Date().toISOString(),
    };
  }

  if (type === "albums") {
    const items =
      "topalbums" in response
        ? response.topalbums?.album?.map(normalizeAlbum) ?? []
        : [];

    return {
      type,
      period,
      items: (await enrichWithSpotifyArtwork("album", items)) as LastfmTopItem[],
      updatedAt: new Date().toISOString(),
    };
  }

  const items =
    "topartists" in response
      ? response.topartists?.artist?.map(normalizeArtist) ?? []
      : [];

  return {
    type,
    period,
    items: (await enrichWithSpotifyArtwork("artist", items)) as LastfmTopItem[],
    updatedAt: new Date().toISOString(),
  };
}

export async function getLastfmRecentTracks(): Promise<LastfmRecentResponse> {
  const apiKey = getRequiredEnv("LASTFM_API_KEY");
  const username = getRequiredEnv("LASTFM_USERNAME");
  const params = new URLSearchParams({
    method: "user.getrecenttracks",
    user: username,
    api_key: apiKey,
    limit: String(LASTFM_RECENT_FETCH_LIMIT),
    format: "json",
  });
  const response = await requestLastfm<LastfmRecentTracksResponse>(
    params,
    LASTFM_RECENT_REVALIDATE_SECONDS,
  );
  const recentTracks =
    response.recenttracks?.track
      ?.filter((track) => track["@attr"]?.nowplaying !== "true")
      .map(normalizeRecentTrack) ?? [];
  const uniqueRecentTracks = getUniqueRecentTracks(recentTracks);

  return {
    recentlyPlayed: (await enrichWithSpotifyArtwork(
      "track",
      uniqueRecentTracks,
    )) as LastfmRecentItem[],
    updatedAt: new Date().toISOString(),
  };
}
