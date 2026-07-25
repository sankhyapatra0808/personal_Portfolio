# New Portfolio — Sankhya Patra

A personalized portfolio rebuilt from the uploaded Next.js reference using the
frontend foundation used for SplitVerse Website:

- React
- TypeScript
- Vite
- React Router DOM
- Handcrafted CSS

No Next.js, Tailwind CSS, Framer Motion, Spotify credentials, external chat
widget, database or backend server is used.

## Included projects

1. SplitVerse Website
2. SplitVerse Mobile
3. DevArena
4. New Portfolio

## Main features

- Full-screen snap-scrolling homepage on desktop
- Responsive mobile layout
- Animated fullscreen navigation
- About, projects, archive and project-detail routes
- Category-based project filtering
- Custom local SVG project artwork
- Typed profile and project data
- Dynamic page titles and descriptions
- Reduced-motion accessibility support
- Vercel and Netlify SPA route fallback files

## Run locally

```bash
npm install
npm run dev
```

Open the local URL shown by Vite, normally `http://localhost:5173`.

## Production build

```bash
npm run build
npm run preview
```

The production files are generated in `dist`.

## Personal details to update

Open `src/data/profile.ts` and replace:

- the empty `email` value
- the placeholder LinkedIn value
- any biography or education wording you want to refine
- `resumeUrl` after adding your final PDF resume

Add the final resume as:

```text
public/sankhya-patra-resume.pdf
```

Then change:

```ts
email: "your-real-email@example.com",
resumeUrl: "/sankhya-patra-resume.pdf"
```

## Project content

All case-study information is stored in:

```text
src/data/projects.ts
```

Project visuals are stored in:

```text
public/project-visuals
```

Replace the generated SVG mockups with real project screenshots later while
keeping the same filenames, or update each project's `visual` and `gallery`
paths.

## Deployment

### Vercel

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`

The included `vercel.json` keeps React Router routes working after refresh.

### Netlify

- Build command: `npm run build`
- Publish directory: `dist`

The included `public/_redirects` handles SPA routes.

## License and attribution

See `LICENSE` and `ATTRIBUTION.md`.
