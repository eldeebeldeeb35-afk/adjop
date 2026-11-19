#!/usr/bin/env python3
"""
AI Montage Builder — مونتاج تلقائي لفيديوهات الـ AI
=====================================================
بياخد:
  • فولدر فيه لقطات الـ AI (صور أو فيديوهات) — بيترتبوا بالاسم 01, 02, 03 ...
  • ملف صوت (فويس أوفر) — اختياري
  • ملف موسيقى — اختياري
  • نص السكريبت — اختياري (لو مفيش، بيطلّع الكلام من الفويس بـ Whisper)

وبيطلّع فيديو جاهز فيه:
  • حركة (Ken Burns: zoom in / zoom out / pan) على كل لقطة
  • انتقالات متنوعة بين اللقطات (fade, slide, zoom, circle ...)
  • كابشن متحرك كلمة بكلمة (الكلمة الحالية ملونة وبتكبر "pop")
  • موسيقى بتوطى تلقائي تحت الفويس (ducking) + Loudness -14 LUFS
  • تصدير 1080x1920 (ريلز/تيك توك/شورتس) أو 1920x1080 (يوتيوب)

الاستخدام:
  python montage.py --clips clips/ --voice voice.mp3 --music music.mp3 -o out.mp4
  python montage.py --clips clips/ --voice voice.mp3 --script script.txt
  python montage.py --clips clips/ --duration 30 --script script.txt   (من غير فويس)

المتطلبات: ffmpeg (مبني بـ libass) + Python 3.9+
اختياري للكابشن التلقائي من الصوت:  pip install faster-whisper
"""
from __future__ import annotations

import argparse
import json
import random
import re
import shutil
import subprocess
import sys
import tempfile
from dataclasses import dataclass
from pathlib import Path

IMAGE_EXT = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
VIDEO_EXT = {".mp4", ".mov", ".mkv", ".webm", ".m4v", ".avi"}

TRANSITIONS = [
    "fade", "smoothleft", "smoothright", "smoothup", "smoothdown",
    "zoomin", "circleopen", "slideleft", "slideup", "fadeblack",
    "radial", "diagtl", "wipeleft", "hblur",
]
MOTIONS = ["zoom_in", "zoom_out", "pan_left", "pan_right", "pan_up", "zoom_in_fast"]


# ----------------------------------------------------------------- helpers
def run(cmd: list[str], quiet: bool = True) -> None:
    if not quiet:
        print("  $", " ".join(cmd))
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0:
        sys.stderr.write(res.stderr[-3000:])
        raise SystemExit(f"ffmpeg فشل في: {' '.join(cmd[:6])} ...")


def probe_duration(path: Path) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=nw=1:nk=1", str(path)],
        capture_output=True, text=True).stdout.strip()
    try:
        return float(out)
    except ValueError:
        return 0.0


def has_audio(path: Path) -> bool:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "a", "-show_entries",
         "stream=index", "-of", "csv=p=0", str(path)],
        capture_output=True, text=True).stdout.strip()
    return bool(out)


def natural_key(p: Path):
    return [int(t) if t.isdigit() else t.lower() for t in re.split(r"(\d+)", p.name)]


def is_arabic(text: str) -> bool:
    return bool(re.search(r"[؀-ۿ]", text))


# ----------------------------------------------------------------- words / captions
@dataclass
class Word:
    text: str
    start: float
    end: float


def words_from_whisper(audio: Path, model_size: str, language: str | None) -> list[Word]:
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        raise SystemExit("لازم تنزّل faster-whisper:  pip install faster-whisper\n"
                         "أو ادّي السكريبت بـ --script عشان التوقيت يتحسب من غير Whisper.")
    print(f"• بطلّع الكلام من الصوت بـ Whisper ({model_size}) ...")
    model = WhisperModel(model_size, device="auto", compute_type="int8")
    segments, info = model.transcribe(str(audio), word_timestamps=True,
                                      language=language, vad_filter=True)
    words: list[Word] = []
    for seg in segments:
        for w in seg.words or []:
            t = w.word.strip()
            if t:
                words.append(Word(t, float(w.start), float(w.end)))
    print(f"  لقيت {len(words)} كلمة (اللغة: {info.language})")
    return words


def words_from_script(text: str, total: float, lead_in: float = 0.15) -> list[Word]:
    """توزيع الكلمات على مدة الصوت حسب طول كل كلمة + وقفة بعد علامات الترقيم."""
    tokens = text.split()
    if not tokens:
        return []
    weights = []
    for t in tokens:
        w = max(len(re.sub(r"\W", "", t)), 2) + 2
        if re.search(r"[.!?؟،,:;…]$", t):
            w += 4  # وقفة
        weights.append(w)
    span = max(total - lead_in - 0.2, 0.5)
    unit = span / sum(weights)
    words, t0 = [], lead_in
    for tok, w in zip(tokens, weights):
        d = w * unit
        words.append(Word(tok, t0, t0 + d * 0.92))
        t0 += d
    return words


def group_words(words: list[Word], max_words: int, max_chars: int, max_gap: float = 0.6):
    groups, cur = [], []
    for w in words:
        if cur and (
            len(cur) >= max_words
            or sum(len(x.text) + 1 for x in cur) + len(w.text) > max_chars
            or w.start - cur[-1].end > max_gap
            or re.search(r"[.!?؟،,:;…]$", cur[-1].text)
        ):
            groups.append(cur)
            cur = []
        cur.append(w)
    if cur:
        groups.append(cur)
    return groups


def ass_time(t: float) -> str:
    t = max(t, 0)
    h, rem = divmod(t, 3600)
    m, s = divmod(rem, 60)
    return f"{int(h)}:{int(m):02d}:{s:05.2f}"


def ass_color(hex_rgb: str, alpha: int = 0) -> str:
    """#RRGGBB -> &HAABBGGRR"""
    h = hex_rgb.lstrip("#")
    r, g, b = h[0:2], h[2:4], h[4:6]
    return f"&H{alpha:02X}{b}{g}{r}".upper()


def ass_escape(t: str) -> str:
    return t.replace("\\", "\\\\").replace("{", "(").replace("}", ")")


def build_ass(words: list[Word], cfg: dict, W: int, H: int, out: Path) -> None:
    font = cfg["font"]
    size = cfg["font_size"] or int(H * (0.06 if H > W else 0.07))
    base, hl = ass_color(cfg["text_color"]), ass_color(cfg["highlight_color"])
    outline_c = ass_color(cfg["outline_color"])
    margin_v = int(H * cfg["caption_y"])
    style = cfg["caption_style"]
    upper = cfg["uppercase"]

    border_style, back = 1, ass_color("#000000", 0x60)
    if style == "box":
        border_style, back = 3, ass_color(cfg["box_color"], 0x30)

    header = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,{font},{size},{base},{base},{outline_c},{back},-1,0,0,0,100,100,0,0,{border_style},{max(3, size // 12)},{2 if style != 'box' else 0},2,{int(W*0.08)},{int(W*0.08)},{margin_v},-1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    lines = []
    groups = group_words(words, cfg["words_per_line"], cfg["max_chars"])
    for gi, g in enumerate(groups):
        g_start = g[0].start
        nxt = groups[gi + 1][0].start if gi + 1 < len(groups) else g[-1].end + 0.6
        g_end = min(g[-1].end + 0.35, nxt)
        texts = [ass_escape(w.text.upper() if upper else w.text) for w in g]

        # pop-in للسطر كله أول ما يظهر
        intro = r"{\fscx80\fscy80\alpha&HFF&\t(0,120,\fscx100\fscy100\alpha&H00&)}"

        if style == "line":  # السطر كله مرة واحدة من غير هايلايت
            lines.append(f"Dialogue: 0,{ass_time(g_start)},{ass_time(g_end)},Cap,,0,0,0,,"
                         f"{intro}{' '.join(texts)}")
            continue

        if style == "word":  # كلمة واحدة بس على الشاشة (Hormozi style)
            for i, w in enumerate(g):
                end = g[i + 1].start if i + 1 < len(g) else g_end
                lines.append(
                    f"Dialogue: 0,{ass_time(w.start)},{ass_time(end)},Cap,,0,0,0,,"
                    r"{\fscx70\fscy70\t(0,90,\fscx112\fscy112)\t(90,160,\fscx100\fscy100)"
                    f"\\c{hl}}}{texts[i]}")
            continue

        # karaoke / box : السطر ظاهر والكلمة الحالية ملونة وبتعمل pop
        for i, w in enumerate(g):
            s = g_start if i == 0 else w.start
            e = g[i + 1].start if i + 1 < len(g) else g_end
            if e <= s:
                continue
            parts = []
            for j, t in enumerate(texts):
                if j == i:
                    parts.append(r"{\c" + hl + r"\fscx85\fscy85\t(0,80,\fscx115\fscy115)"
                                 r"\t(80,150,\fscx108\fscy108)}" + t + r"{\c" + base +
                                 r"\fscx100\fscy100}")
                else:
                    parts.append(t)
            pre = intro if i == 0 else ""
            lines.append(f"Dialogue: 0,{ass_time(s)},{ass_time(e)},Cap,,0,0,0,,{pre}"
                         + " ".join(parts))

    out.write_text(header + "\n".join(lines) + "\n", encoding="utf-8")


# ----------------------------------------------------------------- video segments
def motion_filter(kind: str, dur: float, fps: int, W: int, H: int, intensity: float) -> str:
    """Ken Burns: بنكبّر الصورة frame-by-frame (scale eval=frame) وبعدين crop بمقاس الفيديو."""
    n = max(int(dur * fps), 1)
    z = 1 + 0.14 * intensity               # أقصى زووم
    if kind == "zoom_in_fast":
        z = 1 + 0.25 * intensity
    p = f"(0.5-0.5*cos(PI*min(n/{n},1)))"   # progress 0..1 مع ease-in-out
    if kind in ("zoom_in", "zoom_in_fast"):
        zexpr = f"(1+{z - 1:.4f}*{p})"
        x, y = "(iw-ow)/2", "(ih-oh)/2"
    elif kind == "zoom_out":
        zexpr = f"({z:.4f}-{z - 1:.4f}*{p})"
        x, y = "(iw-ow)/2", "(ih-oh)/2"
    else:                                   # pan بزووم ثابت
        zexpr = f"{1 + 0.12 * intensity:.4f}"
        if kind == "pan_left":
            x, y = f"(iw-ow)*(1-{p})", "(ih-oh)/2"
        elif kind == "pan_right":
            x, y = f"(iw-ow)*{p}", "(ih-oh)/2"
        else:  # pan_up
            x, y = "(iw-ow)/2", f"(ih-oh)*(1-{p})"
    return (f"scale={W}:{H}:force_original_aspect_ratio=increase:flags=lanczos,"
            f"crop={W}:{H},setsar=1,"
            f"scale=w='trunc({W}*{zexpr}/2)*2':h='trunc({H}*{zexpr}/2)*2':"
            f"eval=frame:flags=bicubic,"
            f"crop={W}:{H}:x='{x}':y='{y}'")


def render_segment(src: Path, dur: float, kind: str, cfg: dict, out: Path) -> None:
    W, H, fps = cfg["W"], cfg["H"], cfg["fps"]
    grade = cfg["grade_filter"]
    vf = motion_filter(kind, dur, fps, W, H, cfg["motion"])
    if grade:
        vf += "," + grade
    vf += f",fps={fps},format=yuv420p"
    if src.suffix.lower() in IMAGE_EXT:
        cmd = ["ffmpeg", "-y", "-loop", "1", "-framerate", str(fps), "-t", f"{dur:.3f}",
               "-i", str(src), "-vf", vf]
    else:
        src_dur = probe_duration(src)
        speed = ""
        if src_dur and src_dur < dur:  # الكليب أقصر من المطلوب: بطّأه شوية، وبعدين loop
            factor = min(dur / src_dur, 1.6)
            speed = f"setpts={factor:.4f}*PTS,"
        cmd = ["ffmpeg", "-y", "-stream_loop", "-1", "-i", str(src), "-t", f"{dur:.3f}",
               "-vf", speed + vf]
    cmd += ["-an", "-c:v", "libx264", "-preset", "veryfast", "-crf", "16",
            "-r", str(fps), str(out)]
    run(cmd)


def xfade_chain(segs: list[Path], durs: list[float], trans: list[str], td: float,
                out: Path, cfg: dict) -> None:
    if len(segs) == 1:
        shutil.copy(segs[0], out)
        return
    inputs = []
    for s in segs:
        inputs += ["-i", str(s)]
    parts, last, offset = [], "[0:v]", 0.0
    for i in range(1, len(segs)):
        offset += durs[i - 1] - td
        lbl = f"[v{i}]"
        parts.append(f"{last}[{i}:v]xfade=transition={trans[i-1]}:duration={td}:"
                     f"offset={offset:.3f}{lbl}")
        last = lbl
    run(["ffmpeg", "-y", *inputs, "-filter_complex", ";".join(parts), "-map", last,
         "-c:v", "libx264", "-preset", "veryfast", "-crf", "16", "-pix_fmt", "yuv420p",
         str(out)])


# ----------------------------------------------------------------- audio
def build_audio(voice: Path | None, music: Path | None, total: float, cfg: dict,
                out: Path) -> bool:
    if not voice and not music:
        return False
    fade_out = min(2.0, total / 4)
    cmd = ["ffmpeg", "-y"]
    if voice:
        cmd += ["-i", str(voice)]
    if music:
        cmd += ["-stream_loop", "-1", "-i", str(music)]
    mv = cfg["music_volume"]
    if voice and music:
        fc = (f"[0:a]aresample=48000,highpass=f=80,acompressor=threshold=-18dB:ratio=3:"
              f"attack=5:release=80,apad,asplit=2[vo][sc];"
              f"[1:a]aresample=48000,volume={mv}[mu];"
              f"[mu][sc]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=400[duck];"
              f"[vo][duck]amix=inputs=2:duration=first:normalize=0,"
              f"atrim=0:{total:.3f},afade=t=out:st={total-fade_out:.3f}:d={fade_out:.3f},"
              f"loudnorm=I=-14:TP=-1.5:LRA=11[a]")
    elif voice:
        fc = (f"[0:a]aresample=48000,highpass=f=80,apad,atrim=0:{total:.3f},"
              f"loudnorm=I=-14:TP=-1.5:LRA=11[a]")
    else:
        fc = (f"[0:a]aresample=48000,atrim=0:{total:.3f},afade=t=in:d=0.5,"
              f"afade=t=out:st={total-fade_out:.3f}:d={fade_out:.3f},"
              f"loudnorm=I=-14:TP=-1.5:LRA=11[a]")
    run(cmd + ["-filter_complex", fc, "-map", "[a]", "-c:a", "aac", "-b:a", "192k",
               "-ar", "48000", str(out)])
    return True


# ----------------------------------------------------------------- main
PRESETS = {
    "reels":   (1080, 1920),
    "youtube": (1920, 1080),
    "square":  (1080, 1080),
}

GRADES = {
    "none": "",
    "cinematic": "eq=contrast=1.08:saturation=1.12:gamma=0.98,vignette=PI/5",
    "warm": "eq=contrast=1.05:saturation=1.15,colorbalance=rs=0.05:bs=-0.05,vignette=PI/5",
    "cold": "eq=contrast=1.07:saturation=1.05,colorbalance=rs=-0.04:bs=0.06,vignette=PI/5",
    "dark": "eq=contrast=1.15:brightness=-0.03:saturation=0.95,vignette=PI/4",
}


def main() -> None:
    ap = argparse.ArgumentParser(description="مونتاج تلقائي لفيديوهات الـ AI: كابشن + موشن + انتقالات + موسيقى")
    ap.add_argument("--clips", required=True, type=Path, help="فولدر الصور/الفيديوهات (بالترتيب بالاسم)")
    ap.add_argument("--voice", type=Path, help="الفويس أوفر (mp3/wav)")
    ap.add_argument("--music", type=Path, help="موسيقى الخلفية")
    ap.add_argument("--script", type=Path, help="ملف نص السكريبت (لو موجود مش هيستخدم Whisper)")
    ap.add_argument("--duration", type=float, help="مدة الفيديو لو مفيش فويس (ثواني)")
    ap.add_argument("-o", "--out", type=Path, default=Path("montage.mp4"))
    ap.add_argument("--format", choices=PRESETS, default="reels")
    ap.add_argument("--fps", type=int, default=30)
    ap.add_argument("--grade", choices=GRADES, default="cinematic", help="لوك الألوان")
    ap.add_argument("--motion", type=float, default=1.0, help="قوة الحركة (0 = ثابت, 1 = عادي, 2 = قوي)")
    ap.add_argument("--transition", default="mix",
                    help="mix (متنوع) أو اسم انتقال واحد: " + ", ".join(TRANSITIONS))
    ap.add_argument("--transition-duration", type=float, default=0.45)
    ap.add_argument("--seconds-per-clip", type=float, default=0,
                    help="مدة كل لقطة (0 = تتقسم تلقائي على طول الفويس)")
    ap.add_argument("--caption-style", choices=["karaoke", "box", "word", "line", "none"],
                    default="karaoke")
    ap.add_argument("--font", default=None, help="اسم الخط (افتراضي: Noto Kufi Arabic للعربي / Inter للإنجليزي)")
    ap.add_argument("--fonts-dir", type=Path, default=Path(__file__).parent / "fonts",
                    help="فولدر خطوط إضافية (حط فيه Cairo.ttf مثلاً)")
    ap.add_argument("--font-size", type=int, default=0)
    ap.add_argument("--text-color", default="#FFFFFF")
    ap.add_argument("--highlight-color", default="#FFD400")
    ap.add_argument("--outline-color", default="#000000")
    ap.add_argument("--box-color", default="#000000")
    ap.add_argument("--caption-y", type=float, default=0.22, help="بُعد الكابشن من تحت (نسبة من الطول)")
    ap.add_argument("--words-per-line", type=int, default=4)
    ap.add_argument("--max-chars", type=int, default=26)
    ap.add_argument("--uppercase", action="store_true")
    ap.add_argument("--music-volume", type=float, default=0.35)
    ap.add_argument("--whisper-model", default="small", help="tiny/base/small/medium/large-v3")
    ap.add_argument("--language", default=None, help="ar / en ... (افتراضي: تلقائي)")
    ap.add_argument("--seed", type=int, default=7)
    ap.add_argument("--keep-temp", action="store_true")
    a = ap.parse_args()

    random.seed(a.seed)
    if not shutil.which("ffmpeg"):
        raise SystemExit("ffmpeg مش متسطب.")

    clips = sorted([p for p in a.clips.iterdir()
                    if p.suffix.lower() in IMAGE_EXT | VIDEO_EXT], key=natural_key)
    if not clips:
        raise SystemExit(f"مفيش صور أو فيديوهات في {a.clips}")

    W, H = PRESETS[a.format]
    total = probe_duration(a.voice) + 0.6 if a.voice else 0
    if not total:
        total = a.duration or (a.seconds_per_clip or 3.0) * len(clips)

    script_text = a.script.read_text(encoding="utf-8").strip() if a.script else ""
    arabic = is_arabic(script_text) or (a.language == "ar")

    # ---- words for captions
    words: list[Word] = []
    if a.caption_style != "none":
        if script_text:
            words = words_from_script(script_text, total - 0.6 if a.voice else total)
        elif a.voice:
            words = words_from_whisper(a.voice, a.whisper_model, a.language)
            arabic = arabic or any(is_arabic(w.text) for w in words)

    font = a.font or ("Noto Kufi Arabic" if arabic else "Inter ExtraBold")
    if arabic and a.uppercase:
        a.uppercase = False

    # ---- per-clip durations
    td = a.transition_duration
    n = len(clips)
    if a.seconds_per_clip:
        per = a.seconds_per_clip
        n = max(1, min(n, int((total - td) // (per - td)) + 1)) if a.voice else n
        clips = clips[:n] if a.voice else clips
        if not a.voice:
            total = per * n - td * (n - 1)
    else:
        per = (total + td * (n - 1)) / n
    durs = [per] * n
    durs[-1] += max(0.0, total - (sum(durs) - td * (n - 1)))  # آخر لقطة تكمّل للآخر

    cfg = dict(W=W, H=H, fps=a.fps, motion=a.motion, grade_filter=GRADES[a.grade],
               font=font, font_size=a.font_size, text_color=a.text_color,
               highlight_color=a.highlight_color, outline_color=a.outline_color,
               box_color=a.box_color, caption_y=a.caption_y, caption_style=a.caption_style,
               words_per_line=a.words_per_line, max_chars=a.max_chars,
               uppercase=a.uppercase, music_volume=a.music_volume)

    tmp = Path(tempfile.mkdtemp(prefix="montage_"))
    print(f"• {n} لقطة × {per:.2f}ث ≈ {total:.1f}ث  |  {W}x{H}@{a.fps}  |  خط: {font}")

    # ---- motion per clip (من غير ما نكرر نفس الحركة ورا بعض)
    segs, last_m = [], None
    for i, (c, d) in enumerate(zip(clips, durs)):
        m = random.choice([x for x in MOTIONS if x != last_m])
        last_m = m
        out = tmp / f"seg_{i:03d}.mp4"
        print(f"  [{i+1}/{n}] {c.name}  →  {m}  ({d:.2f}s)")
        render_segment(c, d, m, cfg, out)
        segs.append(out)

    if a.transition == "mix":
        trans, prev = [], None
        for _ in range(n - 1):
            t = random.choice([x for x in TRANSITIONS if x != prev])
            trans.append(t)
            prev = t
    else:
        trans = [a.transition] * (n - 1)

    print("• بركّب الانتقالات:", ", ".join(trans) if trans else "-")
    body = tmp / "body.mp4"
    xfade_chain(segs, durs, trans, td, body, cfg)

    print("• بظبط الصوت (ducking + loudness) ...")
    audio = tmp / "audio.m4a"
    have_audio = build_audio(a.voice, a.music, total, cfg, audio)

    vf = "null"
    if words:
        ass = tmp / "captions.ass"
        build_ass(words, cfg, W, H, ass)
        shutil.copy(ass, a.out.with_suffix(".ass"))
        fonts_dir = f":fontsdir='{a.fonts_dir}'" if a.fonts_dir.exists() else ""
        vf = f"ass='{ass}'{fonts_dir}"
        print(f"• الكابشن: {len(words)} كلمة — ستايل {a.caption_style}")

    print("• التصدير النهائي ...")
    cmd = ["ffmpeg", "-y", "-i", str(body)]
    if have_audio:
        cmd += ["-i", str(audio)]
    cmd += ["-vf", vf, "-map", "0:v"]
    if have_audio:
        cmd += ["-map", "1:a", "-c:a", "copy"]
    cmd += ["-t", f"{total:.3f}", "-c:v", "libx264", "-preset", "medium", "-crf", "18",
            "-maxrate", "16M", "-bufsize", "32M", "-pix_fmt", "yuv420p", "-r", str(a.fps),
            "-movflags", "+faststart", str(a.out)]
    run(cmd)

    (a.out.with_suffix(".json")).write_text(json.dumps({
        "clips": [c.name for c in clips], "durations": durs, "transitions": trans,
        "format": a.format, "font": font, "total": total}, ensure_ascii=False, indent=2),
        encoding="utf-8")
    if not a.keep_temp:
        shutil.rmtree(tmp, ignore_errors=True)
    print(f"✔ خلص: {a.out}  ({probe_duration(a.out):.1f}ث)")


if __name__ == "__main__":
    main()
