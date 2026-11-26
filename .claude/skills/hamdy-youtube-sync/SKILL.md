---
name: hamdy-youtube-sync
description: "ربط حلقات وشورتس قناة حمدي الديب بالموقع. Use when episodes or shorts are missing or wrong on the site, when fixing a title or duration in content/videos.json, or when changing scripts/fetch-videos.mjs."
---

# ربط يوتيوب بالموقع

- القناة: `@hamdyeldee`، الـ ID `UCbmQG5ZloQge0MkvPRsVxRw`.
- `scripts/fetch-videos.mjs` بيقرا الفيد العام
  `https://www.youtube.com/feeds/videos.xml?channel_id=UCbmQG5ZloQge0MkvPRsVxRw`
  ويدمج الجديد في `content/videos.json` قبل البيلد، كل ساعة من الـ workflow.
- **حلقة** = عنوان فيه «لسه في رجوع» + رقم «ح<n>» أو «الحلقة <n>» ومن غير #shorts.
- **شورت** = عنوان فيه `#shorts`.
- العنوان بيتنضف: الجزء قبل `|` بس، من غير هاشتاجات أو إيموجي.
- الفيد فيه آخر ~15 فيديو بس، فالقديم بيفضل في الملف.
- الملف المدموج **مش بيتعمله commit**. عشان تصلح عنوان أو تضيف مدة (`duration`)، عدّل `content/videos.json` نفسه واعمل commit.
- السلسلة: 12 حلقة، أول حلقة 2026-11-17، حلقة كل 7 أيام (`series` في `content/site.ts`). الصفحة بتعرض آخر 4 شورتس.

## نصيحة للعناوين على يوتيوب
عشان الحلقة تظهر لوحدها على الموقع، اكتب في العنوان: `<العنوان> | لسه في رجوع ح<رقم>`، والشورت لازم يبقى فيه `#shorts`.
