# Reel — المتدين: الفكرة الغلط vs الصح (30s, 1080×1920, 30fps)

| File | Contents |
|---|---|
| `reel_9x16_music_sfx.mp4` | Video + background music + SFX (add voiceover on top) |
| `reel_9x16_sfx_only.mp4` | Video + SFX only (use with trending audio) |
| `reel_9x16_silent.mp4` | No audio |

Timings follow the script: 0–5 whiteboard + red X, 5–13 worship icons, 13–22 colour morph / friends / PlayStation, 22–30 balance circle + "عيشها!".
Captions are timed to the script lines — record the voiceover to these timings.

Re-render: `cd source && node shoot.js full | ffmpeg -f image2pipe -c:v mjpeg -framerate 30 -i - -c:v libx264 -crf 17 -pix_fmt yuv420p out.mp4`
3D icons: Microsoft Fluent Emoji (MIT). Fonts: Cairo, Lalezar, Marhey (OFL).
