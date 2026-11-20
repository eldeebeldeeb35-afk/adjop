# Reel — المتدين: الفكرة الغلط vs الصح (50s, 1080×1920, 60fps)

| File | Contents |
|---|---|
| `reel_50s_9x16_60fps_music_sfx.mp4` | Video + background music + SFX (add voiceover on top) |
| `reel_50s_9x16_60fps_sfx_only.mp4` | Video + SFX only (use with trending audio) |

Timings: 0–4.6 hook + red X, 4.6–13 worship, 13–22 life & friends, 22–32 ambition & health, 32–42 family & kindness + hadith, 42–50 balance circle + "عيشها!" + logo.
Captions are timed to the script lines — record the voiceover to these timings.

Re-render: `cd source && FPS=60 DUR=50 node shoot.js full | ffmpeg -f image2pipe -c:v mjpeg -framerate 60 -i - -c:v libx264 -crf 17 -pix_fmt yuv420p out.mp4`
3D icons: Microsoft Fluent Emoji (MIT). Fonts: Cairo, Lalezar, Marhey (OFL).
