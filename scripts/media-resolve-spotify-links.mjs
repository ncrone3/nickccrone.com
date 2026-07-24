#!/usr/bin/env node

import {
  chooseBestSpotifyCandidate,
  isSpotifySearchUrl,
  parseArgs,
  printJsonPreview,
  readCatalog,
  searchSpotify,
  writeCatalog,
} from "./media-lib.mjs";

const help = `
Resolve Spotify search URLs in media JSON files to direct Spotify URLs.

Usage:
  pnpm media:resolve-spotify-links -- --type songs --dry-run
  pnpm media:resolve-spotify-links -- --type albums --apply
  pnpm media:resolve-spotify-links -- --type all --apply

Options:
  --type songs|albums|all   Catalog to resolve. Default: all
  --apply                   Write confident matches back to JSON
  --dry-run                 Preview only. This is the default
  --overwrite               Re-resolve direct Spotify URLs too
  --use-first-match         Use Spotify's first result for ambiguous matches
  --limit <number>          Resolve at most this many candidates
  --help                    Show this help

Auth:
  Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET for Spotify Search API access.
`;

const args = parseArgs(process.argv.slice(2));
const allowedArgs = new Set([
  "_",
  "apply",
  "dryRun",
  "help",
  "limit",
  "overwrite",
  "type",
  "useFirstMatch",
]);
const unknownArgs = Object.keys(args).filter((key) => !allowedArgs.has(key));

if (args.help) {
  console.log(help.trim());
  process.exit(0);
}

if (unknownArgs.length) {
  console.error(`Unknown option${unknownArgs.length === 1 ? "" : "s"}: ${unknownArgs
    .map((key) => `--${key.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`)}`)
    .join(", ")}`);
  console.error("Run with --help to see supported options.");
  process.exit(1);
}

const apply = Boolean(args.apply);
const overwrite = Boolean(args.overwrite);
const useFirstMatch = Boolean(args.useFirstMatch);
const limit = args.limit ? Number(args.limit) : Infinity;
const requestedType = args.type || "all";
const catalogTypes =
  requestedType === "all"
    ? ["songs", "albums"]
    : requestedType === "songs" || requestedType === "albums"
      ? [requestedType]
      : undefined;

if (!catalogTypes) {
  console.error("--type must be songs, albums, or all.");
  process.exit(1);
}

let checked = 0;
let updated = 0;
let skipped = 0;
let forced = 0;
const ambiguous = [];
const changes = [];

for (const catalogType of catalogTypes) {
  const mediaType = catalogType === "albums" ? "album" : "track";
  const { catalog, filePath } = readCatalog(catalogType);
  let changed = false;

  for (const item of catalog.items) {
    if (checked >= limit) {
      break;
    }

    const primary = item.links?.primary || "";
    const source = item.links?.source || "";
    const shouldResolve =
      overwrite || isSpotifySearchUrl(primary) || isSpotifySearchUrl(source);

    if (!shouldResolve) {
      skipped += 1;
      continue;
    }

    checked += 1;

    const candidates = await searchSpotify({
      title: item.title,
      creator: item.creator,
      type: catalogType === "albums" ? "album" : "song",
    });
    const match = chooseBestSpotifyCandidate({
      item,
      candidates,
      type: mediaType,
    });

    const forcedMatch = !match.confident && useFirstMatch;
    const selectedCandidate = forcedMatch
      ? match.scored[0]?.candidate
      : match.best;
    const selectedUrl = selectedCandidate?.external_urls?.spotify;

    if (!selectedUrl) {
      ambiguous.push({
        id: item.id,
        title: item.title,
        creator: item.creator,
        confidence: match.confidence,
        candidates: match.scored.slice(0, 3).map(({ candidate, score }) => ({
          score,
          name: candidate.name,
          artists: candidate.artists?.map((artist) => artist.name).join(", "),
          url: candidate.external_urls?.spotify,
        })),
      });
      continue;
    }

    if (!match.confident && !forcedMatch) {
      ambiguous.push({
        id: item.id,
        title: item.title,
        creator: item.creator,
        confidence: match.confidence,
        candidates: match.scored.slice(0, 3).map(({ candidate, score }) => ({
          score,
          name: candidate.name,
          artists: candidate.artists?.map((artist) => artist.name).join(", "),
          url: candidate.external_urls?.spotify,
        })),
      });
      continue;
    }

    const nextUrl = selectedUrl;
    changes.push({
      id: item.id,
      title: item.title,
      creator: item.creator,
      from: primary,
      to: nextUrl,
      confidence: match.confidence,
      mode: forcedMatch ? "forced-first-match" : "confident",
      selected: forcedMatch
        ? {
            name: selectedCandidate.name,
            artists: selectedCandidate.artists
              ?.map((artist) => artist.name)
              .join(", "),
          }
        : undefined,
    });

    item.links.primary = nextUrl;
    item.links.source = nextUrl;
    changed = true;
    updated += 1;
    if (forcedMatch) {
      forced += 1;
    }
  }

  if (apply && changed) {
    writeCatalog(filePath, catalog);
  }
}

console.log(
  `${apply ? "Applied" : "Dry run"}: ${updated} direct Spotify link${
    updated === 1 ? "" : "s"
  } resolved (${forced} forced first-match), ${ambiguous.length} ambiguous, ${skipped} skipped.`
);

const confidentChanges = changes.filter((change) => change.mode === "confident");
const forcedChanges = changes.filter(
  (change) => change.mode === "forced-first-match"
);

if (confidentChanges.length) {
  console.log("\nConfident changes:");
  printJsonPreview(confidentChanges);
}

if (forcedChanges.length) {
  console.log("\nForced first-match changes:");
  printJsonPreview(forcedChanges);
}

if (ambiguous.length) {
  console.log("\nNeeds manual review:");
  printJsonPreview(ambiguous);
}

if (!apply) {
  console.log("\nRun again with --apply to write resolved changes.");
}
