---
name: hamdy-platforms-manager
description: "إدارة باقي منصات وصفحات حمدي الديب: صفحة فيسبوك الشخصية، صفحة D.I.P، إنستجرام، تيك توك، الموقع، وواتساب. جدولة البوستات، النسخ لكل منصة، الردود، التقارير، وتنسيق الشغل بين المنصات. Use for posting or scheduling on Facebook/Instagram/TikTok, cross-posting a reel, managing the D.I.P page, weekly multi-platform reports, or keeping links and bios consistent."
---

# إدارة المنصات

## الحسابات
| المنصة | الحساب | المحتوى |
|---|---|---|
| يوتيوب | @hamdyeldee | الحلقات والشورتس (سكل `hamdy-youtube-manager`) |
| فيسبوك (شخصي/صفحة) | facebook.com/share/1J6HRgC4Vg | ريلز السلسلة |
| تيك توك | @hamdyeldeeb9 | ريلز السلسلة |
| إنستجرام | @eldeebeldeeb23 | ريلز وبوستات |
| صفحة D.I.P | facebook.com/profile.php?id=100088481756405 | شغل التصميم والطباعة: صور شغل، قبل/بعد، عروض |
| الموقع | eldeebeldeeb35-afk.github.io/adjop | بيتحدث لوحده من يوتيوب (سكل `hamdy-website`) |

**متخلطش**: محتوى السلسلة (ديني، هادي) على حساباته الشخصية؛ شغل D.I.P (بيع وخدمات) على صفحة D.I.P بس.

## الأدوات المتوصلة (حمّلها بـ ToolSearch)
- **Metricool**: `getBrandSettings` (الحسابات)، `getBestTimeToPostByNetwork`، `createScheduledPostForReview` (مسودة للمراجعة)، `createScheduledPost`، `getScheduledPosts`، `getAnalyticsDataByMetrics`.
- **Windsor** (قراية تحليلات): `get_connectors` ← `get_fields` ← `get_data` مع connector `facebook_organic` / `instagram` / `tiktok_organic` / `youtube`.
- **vidIQ**: `vidiq_social_post_draft_create` ← حمدي يوافق ← `vidiq_social_post_publish`؛ وتحليلات إنستجرام وتيك توك.
- **جهاز حمدي** (computer use / Chrome) للحاجات اللي الأدوات مش بتعملها (Meta Business Suite، رسايل الصفحة).

## قاعدة الموافقة (إلزامية)
مسودة ← حمدي يشوفها ← «تمام/انشر» ← نشر أو جدولة. الأفضل `createScheduledPostForReview` أو `draft_create`. الرد على الرسايل الخاصة للعملاء: جهّز الرد ومتبعتوش إلا بموافقته.

## ريل واحد ← كل المنصات
| | تيك توك | ريلز إنستجرام | ريلز فيسبوك | يوتيوب شورتس |
|---|---|---|---|---|
| الكابشن | كلمات بحث + سؤال | قصير + دعوة للإرسال لحد | يفتح نقاش | العنوان + #shorts |
| الهاشتاجات | 3–5 | 3–5 | 1–3 | 2–3 |
| الملف | الأصلي من غير علامة مائية في كل منصة | | | |
- متنشرش نفس الريل على كل المنصات في نفس الدقيقة؛ فرّق حسب `getBestTimeToPostByNetwork`.

## صفحة D.I.P (بيع)
- بوستات: صورة شغل حقيقي + سعر أو «ابعت رسالة»، قبل/بعد فصل الألوان، فيديو قصير من المطبعة.
- كل بوست فيه طريقة تواصل واضحة (رسايل/واتساب).
- التصميمات من سكل `hamdy-vector-design`، والموكاب من سكريبت `mockup.py`.

## تقرير أسبوعي (كل المنصات في جدول واحد)
| المنصة | متابعين +/− | وصول | أحسن بوست | ملاحظة |
وبعده: أحسن 3 حاجات اشتغلت، وخطة الأسبوع الجاي. مصادر الأرقام: Windsor/Metricool/vidIQ؛ قول لو رقم مش متاح بدل ما تخمّنه.

## الروابط والبايو
لما رابط يتغير، حدّثه في `content/site.ts` وفي البايو على كل منصة (بموافقة حمدي)، وخلي الاسم والصورة والوصف موحّدين.
