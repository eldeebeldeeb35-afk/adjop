# ريل اليقين بالله: «البذرة» (موشن جرافك 3D ← أنيميشن AI)

## الطلب كان إيه
- حمدي طلب ريل موشن جرافك 3D، مدته 30 ثانية، والكلام فيه بالعربي.
- الموضوع: اليقين بالله. شباب كتير عايشين للدنيا وبس، ولما يفوقوا لحظة ويدعوا وربنا ميستجبش بسرعة، يدخل قلبهم الشك. وده بلوة واحنا مش واخدين بالنا إننا كده داخلين في دايرة آخرتها النار.
- أول الفيديو يبقى اللوجو موشن بنفس شكل الفيديو اللي فات (جلسة «موشن جرافك اللوجو»).

## القرارات (بكلام حمدي)
- طريقة التنفيذ في الأول: «أبرمجه وأطلّعه MP4».
- المدة 30 ثانية، والنص عربي.
- وافق على السكريبت: «تمام».
- بعد ما شاف أول نسخة 3D (كلام ومجسمات بتتحرك) غيّر الاتجاه: «انا عوز الفيديو احترافي، شخصيات و شباب ai مش صور و كلام بيتحرك بس». وبعت فيديو مرجع بستايل أنيميشن بيكسار (`Cada pedra que jogaram virou degrau`).
- اختار الطريقة الأولى: هو يولّد اللقطات، وأنا أعمل المونتاج.
- بعدها طلب إن Claude يولّدها بنفسه من على الكمبيوتر. ده متنفذش، لأن الجلسة دي شغالة في الكلاود ومش متوصلة بالجهاز.

## اللي اتعمل
1. كتبت السكريبت (تحت) واتوافق عليه.
2. عملت مشهد موشن جرافك 3D بـ Three.js مدته 28.5 ثانية، مكان اللوجو في أول 1.5 ثانية سايبه فاضي. فيه 7 محطات: نور الدعاء، والموبايلات، والساعة الرملية، والحديث، وتلات أبواب، وجمر الشك، وفي الآخر النور. اتعملت منه صور تجريبية بس، ومتطلعش منه فيديو نهائي. الاتجاه ده اتلغى، فالكود متحفظش.
3. لما حمدي طلب أسلوب أنيميشن AI، حوّلت السكريبت لحكاية رمزية اسمها «البذرة» وكتبت شوت ليست كاملة بالبرومبتات (تحت).
4. رصيد vidIQ كان 3 كريدت بس، والفيديو كله محتاج حوالي 900. علشان كده **متولّدش أي لقطة AI**.

## النواتج
| الحاجة | المكان |
|---|---|
| السكريبت والشوت ليست والبرومبتات | الملف ده |
| اللوجو الشفاف | في جلسة «موشن جرافك اللوجو» (session_01BnB3Mbx3CjPzC1FL1XLTEB)، **ومش هنا** |

## اللي لسه مخلصش والخطوة الجاية
1. حمدي يفتح **محادثة جديدة من تطبيق Claude على الكمبيوتر**، ويكون Computer use شغال، ويلصق البرومبت الجاهز اللي تحت، علشان Claude يولّد اللقطات من حسابه في Kling أو Hailuo.
   - **أو** يولّدها بنفسه ويبعت الكليبات `2.mp4` لحد `11.mp4`.
   - **أو** يزوّد رصيد vidIQ (حوالي 900 كريدت).
2. يسجّل التعليق الصوتي بصوته.
3. يجيب ملف اللوجو الشفاف (MOV) من جلسة اللوجو.
4. المونتاج: اللوجو، وبعده اللقطات على الصوت، وترجمة للحديث والآية، وموسيقى هادية. وبعدها مسودة نشر، **ومفيش نشر غير بعد موافقة حمدي**.

---

## السكريبت (التعليق الصوتي)
| الوقت | الكلام |
|---|---|
| 0–1.5 | (اللوجو) |
| 1.5–4 | دعيت ربنا، ومحصلش اللي طلبته… فقلت في سرّك: هو ربنا سامعني أصلًا؟ |
| 4–9 | شباب كتير النهارده عايشين للدنيا وبس. شغل وموبايل وسهر… وربنا آخر حاجة في اليوم. |
| 9–14 | ولما يفوق لحظة ويرفع إيده ويدعي، ومايلاقيش الرد بسرعة… الشك يدخل قلبه. |
| 14–17 | والنبي ﷺ قال: «يُستجاب لأحدكم ما لم يعجل، يقول: دعوتُ فلم يُستجب لي» (رواه البخاري ومسلم). |
| 17–21 | الدعاء عمره ما بيضيع: يا يتحقق، يا يتشال لك في آخرتك، يا ربنا يبعد عنك شر قدّه (رواه أحمد). |
| 21–25 | المشكلة مش إن ربنا مااستجابش… المشكلة إن الشك بيدخل من غير ما ناخد بالنا، ولو سبناه يكبر بيدخّلنا في دايرة آخرتها النار. |
| 25–28 | ارجع وادعي وانت موقن… ربنا قريب. ﴿وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ﴾ |
| 28–30 | ابعتها لحد بطّل يدعي. |

## الشخصيات والستايل
```
YOUSSEF: 22-year-old Egyptian young man, short dark curly hair, light stubble, warm brown eyes, olive-green hoodie, dark jeans, white sneakers.
OMAR: 24-year-old Egyptian young man, neat short beard, calm kind smile, navy blue jacket over white t-shirt.
STYLE: Pixar-style 3D animated film, stylized characters, cinematic soft lighting, volumetric fog, shallow depth of field, rich warm color grade, vertical 9:16.
```
صورة الشخصيات (المرجع):
```
Character sheet, two characters standing side by side, full body, front view, plain light grey background. YOUSSEF: ... OMAR: ... Pixar-style 3D animated film, stylized characters, soft studio lighting, highly detailed.
```

## الشوت ليست (كل لقطة 5 ثواني، 9:16، و STYLE في آخر البرومبت)
2. Close-up of YOUSSEF on a Cairo rooftop at night, hands raised in prayer, a tear on his cheek, then slowly lowers his hands in disappointment, city lights bokeh behind
3. Wide shot of a crowded neon-lit Cairo street at night, dozens of young people frozen staring at glowing phones, faces lit blue, YOUSSEF among them, camera slowly pushes in
4. YOUSSEF lying in bed in a dark room at 3 AM scrolling his phone, tired red eyes, blue screen light on his face, wall clock showing 3:00
5. YOUSSEF kneels on the rooftop at night and gently plants a tiny glowing golden seed into a clay pot of dry soil, soft golden light from the seed
6. Morning, YOUSSEF stares at the empty clay pot, nothing has grown, his face turns frustrated, he starts digging into the soil with his fingers, a cold dark shadow creeps across the rooftop
7. OMAR's hand gently stops YOUSSEF's hand above the pot, OMAR smiles calmly and shakes his head, YOUSSEF looks up at him, warm sunrise light
8. Time-lapse: the golden seed sprouts and grows into a magnificent glowing tree on the rooftop, one golden fruit falls into YOUSSEF's open hands, another golden light floats up to the sky, the branches shield them from a dark storm
9. YOUSSEF walking alone on a circular path in thick fog, each loop gets darker, a faint red ember glow ahead, he suddenly stops at the edge, fear in his eyes
10. YOUSSEF turns back and prostrates in sujood on the rooftop at dawn, golden god-rays break through the clouds over Cairo, peaceful
11. YOUSSEF and OMAR standing beside the giant glowing tree at sunrise over the Cairo skyline, smiling, camera slowly pulls back

## إعدادات التوليد
- Kling أو Hailuo أو Veo، بطريقة Image to Video من صورة كل لقطة، ومدة اللقطة 5 ثواني، ومقاس 9:16، ومن غير صوت.
- لو اتعمل في vidIQ: سعر الـ 6 ثواني في MiniMax H3 حوالي 80 كريدت، وفي Veo 3.1 Lite حوالي 60، والصورة 22 كريدت.
