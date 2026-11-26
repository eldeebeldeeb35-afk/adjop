---
name: hamdy-font-finder
description: "يعرف الخط من صورة تصميم وينزّله أوتوماتيك: يقارن حروف التصميم بحوالي 2000 خط مجاني من Google Fonts (من GitHub)، ويرتّبهم بالأقرب، ويطلع لوحة مقارنة، وينزّل الخط المختار بالتقل المطلوب. Use whenever a design, logo or print contains text and the font is unknown, before redrawing it as vector, or when Hamdy asks 'what font is this' or for a font that looks like X. Also for Arabic fonts (--subset arabic)."
---

# معرفة الخط وتنزيله

حمدي غالبًا مش هيعرف اسم الخط. **أول ما تشوف كتابة في تصميم**: اعرف الخط ونزّله قبل ما ترسم.

## الخطوات
```bash
S=<مسار السكل>/scripts
python $S/fontlib.py catalog        # مرة واحدة: فهرس ~2000 خط من github.com/google/fonts (3 ثواني)
```
1. **سطّح** الصورة لو مايلة (`hamdy-vector-design/scripts/flatten.py`)، وكبّرها ×2 لو صغيرة.
2. **قص 2–4 حروف نضيفة** كل حرف لوحده، من غير أجزاء من الحروف اللي جنبه (أي حتة زيادة بتبوّظ المقارنة).
   اختار حروف شكلها مميز: S, C, G, R, a, e, g (أو في العربي: ع، ه، ك، ي). اقرا القصّة وتأكد إنها نضيفة.
3. **قرّب النوع بعينك** وضيّق البحث:
   - تقيل جدًا/بلوك → `--category DISPLAY,SANS_SERIF --min-weight 800`
   - عادي → `--category SANS_SERIF`، بسيريف → `SERIF`، يدوي → `HANDWRITING`، عربي → `--subset arabic`
4. **قارن**:
   ```bash
   python $S/find_font.py --sample S.png:S --sample C.png:C --category DISPLAY,SANS_SERIF --min-weight 800 --top 12 --sheet cands.png
   ```
   أول مرة على 300+ خط بتاخد دقيقة أو اتنين (بينزّل الخطوط وبيحفظها). اقرا `cands.png`: الأحمر = الأصل، الأسود = الخط،
   الأحمر الغامق = متطابقين. **الرقم لوحده مش كفاية**: بص على الحاجات المميزة (أطراف الـ S، فتحة الـ C، زوايا الـ K).
5. **نزّل** الخط المختار بالتقل:
   ```bash
   python $S/fontlib.py get "Bungee" --weight 900 --out fonts/
   ```
   بيطلع ملف TTF ثابت (حتى لو الخط variable)، جاهز لـ `rebuild_example.py` ولـ Illustrator.
6. **مفيش خط قريب كفاية** (أعلى نتيجة < 0.55، أو الشكل مختلف بعينك)؟ يبقى الخط مدفوع أو مرسوم بالإيد:
   خد أقرب خط وعدّله في الرسم (`buffer` للتخانة، `scale` للعرض، تدوير الزوايا)، أو ارسم الحروف المميزة يدوي. قول لحمدي كده.

## ملاحظات
- كل الخطوط دي مجانية (OFL/Apache) وتنفع للطباعة والبيع.
- على جهاز حمدي: لو عايز الخط في Illustrator، ثبّت ملف الـ TTF (كليك يمين ← Install). ملفات المطبعة نفسها الكتابة فيها متحولة لأشكال، فمش محتاجة الخط.
- الكاش: `~/.cache/hamdy-fonts`.
