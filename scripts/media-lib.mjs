import fs from "node:fs";
import path from "node:path";

export const repoRoot = path.resolve(import.meta.dirname, "..");
export const mediaDir = path.join(repoRoot, "src", "data", "media");

const spotifyApiBase = "https://api.spotify.com/v1";
const spotifyAccountsBase = "https://accounts.spotify.com/api/token";
const iTunesSearchBase = "https://itunes.apple.com/search";

let spotifyTokenPromise;

export function parseArgs(argv) {
  const args = { _: [] };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--") {
      continue;
    }

    if (!arg.startsWith("--")) {
      args._.push(arg);
      continue;
    }

    const [rawKey, inlineValue] = arg.slice(2).split("=", 2);
    const key = rawKey.replace(/-([a-z])/g, (_, char) => char.toUpperCase());

    if (inlineValue !== undefined) {
      args[key] = inlineValue;
      continue;
    }

    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
      continue;
    }

    args[key] = next;
    index += 1;
  }

  return args;
}

export function readCatalog(type) {
  const filePath = path.join(mediaDir, `${type}.json`);
  const catalog = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return { catalog, filePath };
}

export function writeCatalog(filePath, catalog) {
  fs.writeFileSync(filePath, `${JSON.stringify(catalog, null, 2)}\n`);
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function slugify(value) {
  return normalizeText(value)
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function normalizeText(value = "") {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, "")
    .replace(/&/g, " and ")
    .replace(/\b(feat|ft|featuring|with)\.?\b/g, " ")
    .replace(/\([^)]*\)|\[[^\]]*\]/g, " ")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase();
}

export function compactTitle(value = "") {
  return normalizeText(value)
    .replace(/\b(remaster(ed)?|bonus track|explicit|single|version|radio edit)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractSpotifyId(url, expectedType) {
  if (!url) {
    return undefined;
  }

  const match = String(url).match(
    /open\.spotify\.com\/(track|album)\/([A-Za-z0-9]+)/
  );

  if (!match || match[1] !== expectedType) {
    return undefined;
  }

  return match[2];
}

export function isSpotifySearchUrl(url) {
  return String(url || "").includes("open.spotify.com/search/");
}

export function parsePlaylistId(value) {
  if (!value) {
    return undefined;
  }

  const match = String(value).match(
    /(?:open\.spotify\.com\/playlist\/|spotify:playlist:)?([A-Za-z0-9]{16,})/
  );

  return match?.[1];
}

export async function getSpotifyToken() {
  if (process.env.SPOTIFY_ACCESS_TOKEN) {
    return process.env.SPOTIFY_ACCESS_TOKEN;
  }

  if (!spotifyTokenPromise) {
    spotifyTokenPromise = requestSpotifyClientToken();
  }

  return spotifyTokenPromise;
}

async function requestSpotifyClientToken() {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = process.env;

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    throw new Error(
      "Missing Spotify credentials. Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET, or provide SPOTIFY_ACCESS_TOKEN for private playlists."
    );
  }

  const credentials = Buffer.from(
    `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch(spotifyAccountsBase, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });

  if (!response.ok) {
    throw new Error(
      `Spotify token request failed: ${response.status} ${await response.text()}`
    );
  }

  const data = await response.json();
  return data.access_token;
}

export async function spotifyGet(endpoint, params = {}) {
  const token = await getSpotifyToken();
  const url = new URL(`${spotifyApiBase}${endpoint}`);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Spotify GET ${endpoint} failed: ${response.status} ${await response.text()}`
    );
  }

  return response.json();
}

export async function searchSpotify({ title, creator, type }) {
  const queryType = type === "album" ? "album" : "track";
  const query = `${queryType}:${title} artist:${creator || ""}`.trim();
  const data = await spotifyGet("/search", {
    q: query,
    type: queryType,
    market: "US",
    limit: 8,
  });

  return data[`${queryType}s`]?.items || [];
}

export function scoreSpotifyCandidate({ item, candidate, type }) {
  const targetTitle = compactTitle(item.title);
  const targetCreator = normalizeText(item.creator);
  const candidateTitle = compactTitle(candidate.name);
  const artistNames =
    type === "album"
      ? candidate.artists || []
      : candidate.artists || candidate.album?.artists || [];
  const candidateArtists = normalizeText(
    artistNames.map((artist) => artist.name).join(" ")
  );

  let score = 0;

  if (candidateTitle === targetTitle) {
    score += 0.55;
  } else if (
    candidateTitle.includes(targetTitle) ||
    targetTitle.includes(candidateTitle)
  ) {
    score += 0.35;
  }

  if (targetCreator && candidateArtists.includes(targetCreator)) {
    score += 0.35;
  } else if (
    targetCreator &&
    targetCreator
      .split(/\s+/)
      .filter(Boolean)
      .some((part) => candidateArtists.includes(part))
  ) {
    score += 0.18;
  }

  if (candidate.external_urls?.spotify) {
    score += 0.05;
  }

  if (type === "track" && candidate.album?.album_type === "single") {
    score += 0.03;
  }

  const popularity = Number(candidate.popularity || 0);
  score += Math.min(popularity / 1000, 0.07);

  return Number(score.toFixed(3));
}

export function chooseBestSpotifyCandidate({ item, candidates, type }) {
  const scored = candidates
    .map((candidate) => ({
      candidate,
      score: scoreSpotifyCandidate({ item, candidate, type }),
    }))
    .sort((a, b) => b.score - a.score);

  const best = scored[0];
  const runnerUp = scored[1];
  const confident =
    best &&
    best.score >= 0.72 &&
    (!runnerUp || best.score - runnerUp.score >= 0.08);

  return {
    best: best?.candidate,
    confidence: best?.score || 0,
    confident,
    scored,
  };
}

export async function searchITunesSong({ title, creator }) {
  const url = new URL(iTunesSearchBase);
  url.searchParams.set("term", `${title} ${creator || ""}`.trim());
  url.searchParams.set("entity", "song");
  url.searchParams.set("country", "US");
  url.searchParams.set("limit", "10");

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `iTunes search failed: ${response.status} ${await response.text()}`
    );
  }

  const data = await response.json();
  return data.results || [];
}

export function chooseBestITunesSong({ title, creator, candidates }) {
  const targetTitle = compactTitle(title);
  const targetCreator = normalizeText(creator);

  const scored = candidates
    .map((candidate) => {
      const candidateTitle = compactTitle(candidate.trackName);
      const candidateArtist = normalizeText(candidate.artistName);
      let score = 0;

      if (candidateTitle === targetTitle) {
        score += 0.62;
      } else if (
        candidateTitle.includes(targetTitle) ||
        targetTitle.includes(candidateTitle)
      ) {
        score += 0.35;
      }

      if (targetCreator && candidateArtist.includes(targetCreator)) {
        score += 0.34;
      } else if (
        targetCreator &&
        targetCreator
          .split(/\s+/)
          .filter(Boolean)
          .some((part) => candidateArtist.includes(part))
      ) {
        score += 0.16;
      }

      if (candidate.artworkUrl100) {
        score += 0.04;
      }

      return { candidate, score: Number(score.toFixed(3)) };
    })
    .sort((a, b) => b.score - a.score);

  const best = scored[0];

  return {
    best: best?.candidate,
    confidence: best?.score || 0,
    confident: Boolean(best && best.score >= 0.72),
    scored,
  };
}

export function appleArtwork1000(candidate) {
  return candidate?.artworkUrl100
    ?.replace("100x100bb.jpg", "1000x1000bb.jpg")
    ?.replace("100x100bb.png", "1000x1000bb.png");
}

export function uniqueSongId({ title, creator, existingIds }) {
  const base = `song-${slugify(title)}-${slugify(creator || "unknown")}`;
  let id = base;
  let suffix = 2;

  while (existingIds.has(id)) {
    id = `${base}-${suffix}`;
    suffix += 1;
  }

  existingIds.add(id);
  return id;
}

export function loadExistingSongKeys(items) {
  const keys = new Set();

  for (const item of items) {
    keys.add(`${compactTitle(item.title)}::${normalizeText(item.creator)}`);
    const spotifyId =
      extractSpotifyId(item.links?.primary, "track") ||
      extractSpotifyId(item.links?.source, "track");

    if (spotifyId) {
      keys.add(`spotify:${spotifyId}`);
    }
  }

  return keys;
}

export function printJsonPreview(value) {
  console.log(JSON.stringify(value, null, 2));
}
