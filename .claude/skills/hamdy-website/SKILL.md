---
name: hamdy-website
description: "موقع حمدي الديب الشخصي (adjop). Use when editing, building, verifying or deploying Hamdy Eldeeb's Next.js site: copy and links in content/site.ts, the story page, the D.I.P work page, Nav/MobileBar, or the gh-pages deployment."
---

# موقع حمدي الديب

الموقع: https://eldeebeldeeb35-afk.github.io/adjop/ — الريبو `eldeebeldeeb35-afk/adjop`.

## الصفحات
- **صفحة القصة** `app/page.tsx`: البطل (بورتريه النجوم، شوف سكل `hamdy-star-portrait`)، بطاقة «مين أنا» `components/sections/About.tsx`، مسار «لسه في رجوع» `Journey.tsx`، التواصل `Contact.tsx`. مفيش كلام عن فصل الألوان هنا غير رابط لصفحة الشغل.
- **صفحة الشغل** `app/work/page.tsx` + `components/work/WorkPage.tsx`: D.I.P (تصميم، فصل ألوان، سلك سكرين) ورابط صفحة D.I.P على فيسبوك.
- `Nav` و`MobileBar` (للموبايل بس) بياخدوا روابط لكل صفحة.

## تعديل الكلام والروابط
كل الكلام في `content/site.ts` (person, links, work, journey, series). أي رابط فاضي `""` زرّاره بيختفي. الحلقات والشورتس في `content/videos.json` (شوف `hamdy-youtube-sync`).

## الأوامر
```bash
npm ci
npm run dev     # http://localhost:3000
npm run lint    # tsc --noEmit
npm run build   # static export -> out/
```

## التحقق
مفيش تستات. افتح الموقع على عرض ديسكتوب (1440) وموبايل (390). كروميوم headless محتاج
`--use-angle=swiftshader --enable-unsafe-swiftshader` عشان WebGL. سكل `webapp-testing` بيساعد في السكرين شوت.
اتأكد إن `StaticPortrait` شغال لو مفيش WebGL أو مع `prefers-reduced-motion`.

## النشر
`.github/workflows/deploy.yml`: مع كل push على الفرع الافتراضي (`claude/claude-md-setup-r52p5e`، مفيش main) وكل ساعة،
بيسحب الفيديوهات الجديدة، يبني بـ `NEXT_PUBLIC_BASE_PATH=/adjop`، ويعمل force-push لـ `out/` على `gh-pages`.

## قواعد
- اتجاه الصفحة `rtl`، والكلام بالمصري.
- الألوان والخطوط من سكل `hamdy-brand` بس.
- صور حمدي اللي هو بعتها بس؛ ممنوع وشوش تانية أو مولّدة.
- مفيش أسرار في الكود. رسايل الكوميت بصيغة الأمر وقصيرة.
- لسه ناقص: الإيميل، صور شغل D.I.P للجاليري، قايمة الخبرات.
