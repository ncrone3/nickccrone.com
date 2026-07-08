# nickccrone.com

Personal portfolio site for Nick Crone, built with Next.js, React, and Tailwind CSS. The site is deployed on Vercel and connected to the custom domain `nickccrone.com`.

## Current Status

- GitHub repo: `https://github.com/ncrone3/nickccrone.com.git`
- Main branch: `main`
- Hosting: Vercel
- Domain registrar: Porkbun
- Live domain: `https://nickccrone.com`
- Local project path: `/Users/nickccrone/Documents/nickccrone.com`
- Last known repo state: clean and synced with `origin/main`

## What We Built

- Full-screen hero section with forest background and large name treatment.
- Top photo carousel with personal photos.
- About section with a short personal intro.
- Highlights section for work, projects, school roles, and other meaningful experiences.
- Highlights currently show the first row by default, then reveal the rest with a `More` button.
- Highlight cards use images, `Learn more` text, and hover shadows.
- Contact section with email, LinkedIn, and GitHub links.
- Bottom carousel for inspiration / personality photos.
- Carousel animations pause on hover.
- Site has been deployed to Vercel and connected to `nickccrone.com`.

## Current Highlights Order

1. AWS Internship
2. Amway Internship
3. ChatGPT Feature Design
4. Georgia Tech VIP
5. Pop the Balloon Dating Show
6. Teaching Assistant
7. Lead Resident Assistant
8. Senior Class President

## Important Files

- `src/app/page.tsx`: main page content, highlight data, links, carousel image lists, and page layout.
- `src/app/globals.css`: global styles and carousel animation timing.
- `public/photos/`: portfolio images used by the carousels and highlight cards.
- `public/forest-hero.png`: hero background image.
- `.gitignore`: intentionally ignores raw photo uploads while allow-listing final website assets.

## Common Commands

Run the local dev server:

```bash
pnpm dev
```

Open:

```text
http://localhost:3000
```

Build before pushing:

```bash
pnpm build
```

Check Git status:

```bash
git status -sb
```

Commit and push:

```bash
git add .
git commit -m "Describe the change"
git push origin main
```

## Photo Workflow

When adding new photos:

1. Put source photos in `public/photos/`.
2. Rename them to clean lowercase kebab-case names, for example `aws-first-day.jpg`.
3. Prefer web-friendly formats like `.jpg`, `.png`, `.webp`, or `.avif`.
4. Update the matching image list or highlight image in `src/app/page.tsx`.
5. If the image should deploy to Vercel, make sure it is allow-listed in `.gitignore`.
6. Delete unused/raw uploads after conversion so the folder stays clean.
7. Run `pnpm build`.
8. Commit and push.

## Deployment Notes

Vercel should use the standard Next.js settings:

- Framework Preset: Next.js
- Build Command: default or `pnpm build`
- Output Directory: blank
- Root Directory: blank, because this repo is the app root

For Porkbun DNS:

- Root domain `nickccrone.com` should use an `A` record:
  - Host: `@`
  - Value: `216.198.79.1`
- `www.nickccrone.com` should use a `CNAME` record:
  - Host: `www`
  - Value: the CNAME Vercel recommends, commonly `cname.vercel-dns.com`

Avoid conflicting `A`, `AAAA`, or extra `CNAME` records for `@` and `www`.

## Next Session Ideas

- Clean up the final `www.nickccrone.com` DNS recommendation in Vercel.
- Add real images for remaining highlight cards.
- Add detail pages or modals for `Learn more`.
- Improve mobile spacing and visual polish after testing on a phone.
- Add SEO metadata, favicon, and social preview image.
- Review `public/photos/` and `.gitignore` together to make sure every referenced image is tracked.

## Notes For Codex

- This project lives outside the default Codex workspace, so file edits and commands usually need approval/escalation.
- Use the existing design language: soft neutral background, black/white photo-card feel, clean section dividers, and restrained UI.
- Before any push, run `pnpm build`.
- Do not delete user-uploaded images unless they are clearly raw/unused replacements and the user has asked for cleanup.
