---
name: hamdy-star-portrait
description: "بورتريه النجوم الذهبية في هيرو موقع حمدي الديب. Use when changing the WebGL particle portrait (old look → current look morph, head turning), its tuned settings, or regenerating the portrait images with scripts/prepare_portraits.py."
---

# بورتريه النجوم

آلاف النجوم الذهبية بترسم شكل حمدي القديم (شعر طويل مربوط) من زاويتين (بروفايل باصص لفوق، بعدين في وشنا)،
وبتتجمع من جديد في شكله الحالي (شعر قصير ودقن) مع الهوفر (ديسكتوب) أو السكرول (موبايل).
الشكل الحالي بيلف راسه شمال/قدام/يمين ناحية الماوس.

## الملفات
- `components/hero/Hero.tsx`: اكتشاف الجهاز، عدد النجوم (`50000` ديسكتوب، `22000` موبايل، أقل للأجهزة الضعيفة)، الهوفر/السكرول، والـ fallback.
- `components/hero/ParticleScene.tsx`: مشهد R3F، اللون `GOLD #e0a54a` و`LIGHT #fff1d0`.
- `components/hero/shaders.ts`: GLSL.
- `lib/samplePortrait.ts`: صورة → أماكن النجوم (equalisation، local contrast، Sobel edges، importance sampling، ترتيب Hilbert للمزاوجة).

## الإعدادات اللي حمدي ظبطها في المعمل (متغيرهاش من غير ما يطلب)
- مسطح: `DEPTH = 0` (مفيش عمق).
- مفيش نجوم زيادة على الحواف: `EDGE_WEIGHT = 0`.
- 50 ألف نجمة على الديسكتوب، ومفيش تمايل أوتوماتيك.
- الصورة الخلفية `before-0` مش مستخدمة.

## الصور
`public/portraits/{before,after}-{0,1,2}.webp`: متشالة الخلفية، 720×900، ونفس مكان الراس في الست صور.
لإعادة توليدها من الصورتين المجمعتين (3 لوحات كل واحدة):
```bash
pip install "rembg[cpu]" pillow scipy
python scripts/prepare_portraits.py BEFORE.jpg AFTER.jpg
```
مكان الراس ومربعات المسح لكل زاوية في `VIEWS` جوه السكريبت. لو الراس اتحرك بين الصور، النجوم بتسافر في الكادر بدل ما تعيد بناء الراس.

## قاعدة
صور حمدي اللي بعتها بس (فيوز معمولة بمساعدة AI من صوره هو). ممنوع أي وش تاني.
