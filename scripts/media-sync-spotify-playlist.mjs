#!/usr/bin/env node

import {
  appleArtwork1000,
  chooseBestITunesSong,
  compactTitle,
  loadExistingSongKeys,
  normalizeText,
  parseArgs,
  parsePlaylistId,
  printJsonPreview,
  readCatalog,
  searchITunesSong,
  spotifyGet,
  todayIso,
  uniqueSongId,
  writeCatalog,
} from "./media-lib.mjs";

const help = `
Sync new songs from a Spotify playlist into src/data/media/songs.json.

Usage:
  pnpm media:sync-songs -- --playlist "https://open.spotify.com/playlist/..." --dry-run
  pnpm media:sync-songs -- --playlist 37i9dQZF1DXcBWIGoYBM5M --apply

Options:
  --playlist <url|id>       Spotify playlist URL or ID. Can also use SPOTIFY_PLAYLIST_ID
  --apply                   Append validated new songs to songs.json
  --dry-run                 Preview only. This is the default
  --limit <number>          Read at most this many playlist tracks
  --featured                Mark added songs as featured
  --tag <tag>               Add one extra lowercase tag to every new song
  --why <description>       Description for every new song
  --added-at <YYYY-MM-DD>   Override addedAt. Defaults to today
  --help                    Show this help

Auth:
  Public playlist/search access can use SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET.
  Private playlists need SPOTIFY_ACCESS_TOKEN with playlist-read-private access.
`;

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  console.log(help.trim());
  process.exit(0);
}

const playlistId = parsePlaylistId(args.playlist || process.env.SPOTIFY_PLAYLIST_ID);
const apply = Boolean(args.apply);
const limit = args.limit ? Number(args.limit) : Infinity;
const addedAt = args.addedAt || todayIso();

if (!playlistId) {
  console.error("Missing --playlist <spotify playlist url/id>.");
  process.exit(1);
}

const { catalog, filePath } = readCatalog("songs");
const existingKeys = loadExistingSongKeys(catalog.items);
const existingIds = new Set(catalog.items.map((item) => item.id));
const playlistTracks = await getPlaylistTracks({ playlistId, limit });

const additions = [];
const skipped = [];

for (const playlistItem of playlistTracks) {
  const track = playlistItem.track;

  if (!track || track.type !== "track" || track.is_local) {
    skipped.push({
      reason: "not-a-spotify-track",
      name: track?.name || "Unknown local/unavailable item",
    });
    continue;
  }

  const title = track.name;
  const creator = track.artists.map((artist) => artist.name).join(", ");
  const primaryArtist = track.artists[0]?.name || creator;
  const spotifyUrl = track.external_urls?.spotify;
  const spotifyKey = `spotify:${track.id}`;
  const titleArtistKey = `${compactTitle(title)}::${normalizeText(creator)}`;
  const primaryTitleArtistKey = `${compactTitle(title)}::${normalizeText(
    primaryArtist
  )}`;

  if (
    existingKeys.has(spotifyKey) ||
    existingKeys.has(titleArtistKey) ||
    existingKeys.has(primaryTitleArtistKey)
  ) {
    skipped.push({
      reason: "already-exists",
      title,
      creator,
      spotifyUrl,
    });
    continue;
  }

  const iTunesCandidates = await searchITunesSong({
    title,
    creator: primaryArtist,
  });
  const iTunesMatch = chooseBestITunesSong({
    title,
    creator: primaryArtist,
    candidates: iTunesCandidates,
  });
  const artworkUrl = appleArtwork1000(iTunesMatch.best);

  if (!iTunesMatch.confident || !artworkUrl) {
    skipped.push({
      reason: "apple-artwork-needs-review",
      title,
      creator,
      confidence: iTunesMatch.confidence,
      spotifyUrl,
      candidates: iTunesMatch.scored.slice(0, 3).map(({ candidate, score }) => ({
        score,
        trackName: candidate.trackName,
        artistName: candidate.artistName,
        artworkUrl: appleArtwork1000(candidate),
      })),
    });
    continue;
  }

  const year = Number(String(track.album?.release_date || "").slice(0, 4));
  const lowerTag = normalizeText(primaryArtist);
  const tags = ["song", lowerTag, "music"];

  if (args.tag) {
    tags.push(normalizeText(String(args.tag)));
  }

  const item = {
    id: uniqueSongId({ title, creator: primaryArtist, existingIds }),
    type: "song",
    title,
    creator,
    ...(Number.isFinite(year) ? { year } : {}),
    image: {
      url: artworkUrl,
      alt: `${title} by ${creator} cover art`,
      width: 1000,
      height: 1000,
    },
    links: {
      primary: spotifyUrl,
      source: spotifyUrl,
    },
    description: args.why || `A track from ${creator} for the wall.`,
    tags: Array.from(new Set(tags.filter(Boolean))),
    addedAt,
    ...(args.featured ? { featured: true } : {}),
  };

  additions.push({
    item,
    spotifyAddedAt: playlistItem.added_at,
    appleConfidence: iTunesMatch.confidence,
    appleMatchedTitle: iTunesMatch.best.trackName,
    appleMatchedArtist: iTunesMatch.best.artistName,
  });

  existingKeys.add(spotifyKey);
  existingKeys.add(titleArtistKey);
  existingKeys.add(primaryTitleArtistKey);
}

if (apply && additions.length) {
  catalog.items.push(...additions.map(({ item }) => item));
  writeCatalog(filePath, catalog);
}

console.log(
  `${apply ? "Applied" : "Dry run"}: ${additions.length} new song${
    additions.length === 1 ? "" : "s"
  } ready, ${skipped.length} skipped/reviewed.`
);

if (additions.length) {
  console.log("\nValidated additions:");
  printJsonPreview(additions);
}

if (skipped.length) {
  console.log("\nSkipped or needs review:");
  printJsonPreview(skipped);
}

if (!apply) {
  console.log("\nRun again with --apply to append validated additions.");
}

async function getPlaylistTracks({ playlistId, limit }) {
  const tracks = [];
  let offset = 0;
  const pageSize = 50;

  while (tracks.length < limit) {
    const remaining = limit - tracks.length;
    const page = await spotifyGet(`/playlists/${playlistId}/items`, {
      market: "US",
      limit: Math.min(pageSize, remaining),
      offset,
      fields:
        "items(added_at,track(id,type,is_local,name,artists(name),album(release_date),external_urls)),next,total",
    });

    tracks.push(...(page.items || []));

    if (!page.next || !page.items?.length) {
      break;
    }

    offset += page.items.length;
  }

  return tracks.slice(0, limit);
}
