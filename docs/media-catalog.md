# Media Catalog Standards

## File Layout

- Store catalog data in `src/data/media/*.json`, split by media type.
- Each file keeps the same top-level shape: `{ "schemaVersion": 1, "items": [...] }`.
- Add new media to the matching type file instead of recreating `src/data/media.json`.

## Songs And Albums

- Use Apple Music/iTunes CDN artwork for `image.url`, preferably from `is1-ssl.mzstatic.com` at `1000x1000bb.jpg`.
- Use Spotify links for both `links.primary` and `links.source`, because playback should open in Spotify.
- Prefer exact Spotify track or album URLs when available. Use a Spotify search URL as the fallback.
- Keep `image.alt` descriptive and human-readable, usually `{Title} by {Artist} cover art`.

## Instagram Media

- Store local thumbnails or placeholders in `public/media/instagram/`.
- Fetch thumbnails from `https://www.instagram.com/p/<shortcode>/media/?size=l` and save the redirected JPEG locally.
- Do not use Instagram `og:image` for reels; it can include a generated play-button overlay.
- Use `reel` for Instagram reel URLs and `post` for standard Instagram post URLs.
- Keep `links.source` as the original Instagram `/p/<shortcode>/` URL.
