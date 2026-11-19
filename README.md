# AI Montage — مونتاج تلقائي لفيديوهات الـ AI

سكريبت واحد (`montage.py`) بياخد لقطات الـ AI بتاعتك (صور أو فيديوهات) + الفويس + الموسيقى، ويطلّع فيديو جاهز للنشر فيه:

| الجزء | بيعمل إيه |
|---|---|
| **موشن** | Zoom in / Zoom out / Pan على كل لقطة بحركة ناعمة (ease-in-out)، من غير ما يكرر نفس الحركة ورا بعض |
| **انتقالات** | متنوعة بين اللقطات: fade, smooth, zoomin, circleopen, slide, radial, blur ... |
| **كابشن** | كلمة بكلمة على الصوت، الكلمة الحالية بتتلون وتعمل "pop". بيدعم العربي صح (ترتيب الكلام واتجاهه) |
| **ألوان** | لوك جاهز: cinematic / warm / cold / dark + vignette |
| **صوت** | الموسيقى بتوطى لوحدها تحت الفويس (ducking) + Loudness ‎-14 LUFS للسوشيال |
| **تصدير** | 1080×1920 ريلز/تيك توك/شورتس، أو 1920×1080 يوتيوب، أو مربع |

## التسطيب

```bash
# 1) ffmpeg
#   Windows:  winget install ffmpeg
#   Mac:      brew install ffmpeg
#   Linux:    sudo apt install ffmpeg

# 2) للكابشن التلقائي من الصوت (اختياري)
pip install faster-whisper
```

**الخط العربي:** نزّل خط زي **Cairo** أو **Tajawal** أو **Noto Kufi Arabic** من Google Fonts، وحط ملف الـ `.ttf` في فولدر اسمه `fonts` جنب السكريبت، واكتب اسمه في `--font "Cairo"`.

## الاستخدام

رتّب اللقطات في فولدر بأسماء بالترتيب: `01.png`, `02.mp4`, `03.jpg` ...

```bash
# الكابشن يطلع تلقائي من الصوت (Whisper)
python montage.py --clips clips --voice voice.mp3 --music music.mp3 -o final.mp4

# عندك السكريبت مكتوب؟ التوقيت بيتحسب منه (أسرع، والكلام مكتوب صح 100%)
python montage.py --clips clips --voice voice.mp3 --music music.mp3 --script script.txt -o final.mp4

# يوتيوب عرضي + لوك دافي + كابشن بخلفية
python montage.py --clips clips --voice voice.mp3 --format youtube --grade warm --caption-style box

# كلمة واحدة كبيرة في نص الشاشة
python montage.py --clips clips --voice voice.mp3 --caption-style word --caption-y 0.45 --font-size 130
```

## أهم الإعدادات

| الأمر | الافتراضي | المعنى |
|---|---|---|
| `--format` | `reels` | `reels` / `youtube` / `square` |
| `--caption-style` | `karaoke` | `karaoke` (السطر + الكلمة ملونة)، `box` (بخلفية)، `word` (كلمة كلمة)، `line`، `none` |
| `--highlight-color` | `#FFD400` | لون الكلمة الحالية |
| `--text-color` | `#FFFFFF` | لون باقي الكلام |
| `--font` | Noto Kufi Arabic / Inter | اسم الخط |
| `--font-size` | تلقائي | حجم الخط |
| `--caption-y` | `0.22` | مكان الكابشن من تحت (0.45 = نص الشاشة) |
| `--words-per-line` | `4` | عدد الكلمات في السطر |
| `--grade` | `cinematic` | `none` / `cinematic` / `warm` / `cold` / `dark` |
| `--motion` | `1.0` | قوة الحركة (0 = ثابت، 2 = قوي) |
| `--transition` | `mix` | `mix` متنوع، أو اسم انتقال واحد زي `fade` |
| `--transition-duration` | `0.45` | مدة الانتقال بالثواني |
| `--seconds-per-clip` | تلقائي | مدة كل لقطة (افتراضي: بيقسم طول الفويس على اللقطات) |
| `--music-volume` | `0.35` | صوت الموسيقى قبل الـ ducking |
| `--whisper-model` | `small` | `medium` أو `large-v3` أدق للعربي (أبطأ) |
| `--language` | تلقائي | `ar` / `en` |

بيطلع جنب الفيديو:
- `final.ass` ملف الكابشن، تقدر تعدّله أو تفتحه في Aegisub / CapCut / Premiere
- `final.json` الترتيب والمدد والانتقالات اللي اتعملت (غيّر `--seed` عشان تطلع تركيبة تانية)

## Workflow مقترح لفيديو AI كامل

1. **السكريبت** ← اكتبه (Claude / ChatGPT) واحفظه `script.txt`
2. **الصور / اللقطات** ← Midjourney / Flux / Kling / Veo / Runway، لقطة لكل جملة تقريباً
3. **الفويس** ← ElevenLabs أو أي TTS، واحفظه `voice.mp3`
4. **الموسيقى** ← Suno / Udio أو مكتبة royalty-free
5. **المونتاج** ← `python montage.py ...` وخلاص
