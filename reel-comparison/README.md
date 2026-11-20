# Reel — المتدين: في الأفلام 🆚 في الواقع (44s, 1080×1920, 60fps)

- `reel_comparison_9x16_60fps_music_sfx.mp4` — music + SFX
- `reel_comparison_9x16_60fps_sfx_only.mp4` — SFX only

Structure: logo intro (0–3.3) → VS title card → 3 split-screen comparisons (movies on top / reality below, hand-drawn) → balance circle + "عيشها!" + logo.

Render: `cd source && FPS=60 DUR=41.1 PAGE=comp.html node shoot.js full | ffmpeg -f image2pipe -c:v mjpeg -framerate 60 -i - -c:v libx264 -crf 17 -pix_fmt yuv420p comp.mp4`, then xfade with `logo_intro.mp4` at 3.25s.
