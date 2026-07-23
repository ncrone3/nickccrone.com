# Media Catalog Standards

## Songs And Albums

- Use Apple Music/iTunes CDN artwork for `image.url`, preferably from `is1-ssl.mzstatic.com` at `1000x1000bb.jpg`.
- Use Spotify links for both `links.primary` and `links.source`, because playback should open in Spotify.
- Prefer exact Spotify track or album URLs when available. Use a Spotify search URL as the fallback.
- Keep `image.alt` descriptive and human-readable, usually `{Title} by {Artist} cover art`.
