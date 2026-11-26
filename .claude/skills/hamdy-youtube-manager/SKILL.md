---
name: hamdy-youtube-manager
description: "إدارة قناة يوتيوب حمدي الديب (@hamdyeldee) ببلاش: رفع الفيديوهات، العناوين والوصف والتاجز والتامبنيل، الرد على الكومنتات، التحليلات، الجدول الأسبوعي، والتحكم في YouTube Studio من جهاز حمدي (computer use أو Chrome). Use for any YouTube channel task: upload, publish, edit a video, reply to comments, analytics, weekly report, channel growth, or 'open the channel on my computer'."
---

# إدارة القناة

القناة: https://www.youtube.com/@hamdyeldee — ID `UCbmQG5ZloQge0MkvPRsVxRw`.
للمحتوى والخوارزميات: سكل `hamdy-lesa-fi-rogoo` و`social-algorithms-playbook`.

## الطرق المجانية للتحكم (من الأسهل للأصعب)
1. **أدوات vidIQ المتوصلة** (مجانية بحدود الرصيد): حمّلها بـ ToolSearch أول (`+vidiq`).
   - تحليلات: `vidiq_channel_analytics`, `vidiq_channel_performance_trends`, `vidiq_video_stats`, `vidiq_user_videos`
   - تعديل: `vidiq_update_video` (عنوان/وصف/تاجز)، `vidiq_update_video_thumbnail`، `vidiq_video_upload`
   - كومنتات: `vidiq_video_comments`, `vidiq_comment_insights`, `vidiq_generate_comment_replies`, `vidiq_reply_to_comment`
   - أفكار: `vidiq_keyword_research`, `vidiq_outliers`, `vidiq_generate_titles`, `vidiq_score_title`, `vidiq_score_thumbnail`
   - اتأكد من الرصيد بـ `vidiq_balance` قبل الأدوات الغالية (توليد فيديو/صور).
2. **YouTube Studio على جهاز حمدي** (مجاني 100%): لما الجهاز متوصل.
   - في تطبيق Claude على الكمبيوتر: حمّل سكل `computer-use` (التحكم في الشاشة) أو `chrome-browser` (Claude in Chrome، بيستخدم تسجيل دخول حمدي).
   - من جلسة كلاود: لازم حمدي يوصّل الجهاز (Remote Control في تطبيق Claude على الكمبيوتر). لو مش متوصل، قوله كده بدل ما تحاول.
   - افتح `https://studio.youtube.com` في تابة جديدة، ومتقفلش حاجة حمدي فاتحها.
3. **الفيد العام** (من غير تسجيل): `https://www.youtube.com/feeds/videos.xml?channel_id=UCbmQG5ZloQge0MkvPRsVxRw` لآخر 15 فيديو.

## قاعدة الموافقة (إلزامية)
أي حاجة **بتتنشر أو بتتغير على القناة** (رفع، نشر، تعديل عنوان، تامبنيل، رد على كومنت، حذف، تغيير خصوصية): جهّزها واعرضها، واستنى «تمام» أو «انشر» من حمدي. القراية والتحليل من غير إذن.
ممنوع: حذف فيديوهات أو كومنتات، تغيير إعدادات القناة أو الحساب، أو أي حاجة فيها فلوس، من غير طلب صريح.

## الروتين
**بعد نشر حلقة (أول 24 ساعة)**: شوف المشاهدات وCTR ونسبة الاحتفاظ كل كام ساعة لو حمدي طلب؛ جهّز ردود على أول الكومنتات؛ اتأكد إن الحلقة في البلاي ليست وإن الشورتس بتشاور عليها (Related video).
**أسبوعيًا**: تقرير قصير:
| الفيديو | مشاهدات | CTR | متوسط المشاهدة | الاحتفاظ | مشتركين |
وبعده 3 نقط: اللي نجح، اللي منجحش، تجربة الأسبوع الجاي (عنوان، تامبنيل، أول ثانيتين).
**الكومنتات**: ردود قصيرة بالمصري، بنفس روح السلسلة (هادية، من غير وعظ). الكومنتات اللي فيها حد بيحكي حاجة صعبة: رد بحنية ومتدّيش فتاوى. السبام والإساءة: اقترح الإخفاء، متحذفش.

## صيغة العنوان
`<العنوان> | لسه في رجوع ح<رقم>` — عشان الحلقة تظهر على الموقع لوحدها (سكل `hamdy-youtube-sync`). الشورت فيه `#shorts`.
