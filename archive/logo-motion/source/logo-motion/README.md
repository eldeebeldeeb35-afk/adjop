# Logo Motion Graphic — Elegant Reveal

| File | Use |
|---|---|
| `logo_intro_16x9_1080p60.mp4` | YouTube intro (1920×1080, 60fps, with sound) |
| `logo_intro_9x16_1080p60.mp4` | Shorts / Reels / TikTok (1080×1920, 60fps, with sound) |
| `logo_intro_16x9_transparent.webm` | Transparent overlay (VP9 alpha) — 16:9 |
| `logo_intro_9x16_transparent.webm` | Transparent overlay (VP9 alpha) — 9:16 |

Timeline (5s): frame draws in with a light spark → letters write right-to-left → gold dots pop → light flash + shine sweep → hold.

Re-render: `cd source && python3 render.py 1920 1080 720 h` (needs numpy, opencv-python-headless, ffmpeg).
Outputs also include a ProRes 4444 `.mov` with alpha (not committed — too large for git).
