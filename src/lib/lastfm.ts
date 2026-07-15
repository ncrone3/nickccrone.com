import {
  getSpotifyAccessToken,
  searchSpotifyArtworkWithAccessToken,
  type SpotifyArtworkSearchType,
} from "@/lib/spotify";

const LASTFM_API_URL = "https://ws.audioscrobbler.com/2.0/";
const LASTFM_REVALIDATE_SECONDS = 24 * 60 * 60;

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
  items: LastfmTopItem[],
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
        const spotifyArtwork = await searchSpotifyArtworkWithAccessToken(accessToken, {
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

async function requestLastfm<T>(params: URLSearchParams): Promise<T> {
  const response = await fetch(`${LASTFM_API_URL}?${params.toString()}`, {
    next: {
      revalidate: LASTFM_REVALIDATE_SECONDS,
    },
  });
  const body = (await response.json()) as T & LastfmErrorResponse;

  if (!response.ok || body.error) {
    throw new LastfmApiError(
      body.error === 29 ? 429 : response.status || 502,
      body.message ?? "Unable to load Last.fm data.",
    );
  }

  return body;
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
      items: await enrichWithSpotifyArtwork("track", items),
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
      items: await enrichWithSpotifyArtwork("album", items),
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
    items: await enrichWithSpotifyArtwork("artist", items),
    updatedAt: new Date().toISOString(),
  };
}
