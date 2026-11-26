# تفعيل حسابات العملاء (Firebase)

الموقع static على GitHub Pages، فالحسابات والطلبات محفوظة في Firebase (مجاني للحجم ده).

1. ادخل https://console.firebase.google.com واعمل مشروع جديد (اسمه مثلاً `dip-orders`). Google Analytics مش لازم.
2. **Authentication → Get started → Sign-in method**: فعّل **Google** و **Email/Password**.
3. **Authentication → Settings → Authorized domains**: ضيف `eldeebeldeeb35-afk.github.io`.
4. **Firestore Database → Create database** (production mode، أقرب منطقة مثلاً `europe-west`).
5. **Firestore → Rules**: امسح اللي موجود والزق محتوى ملف `firestore.rules` اللي في المشروع، واضغط Publish.
6. **Project settings → Your apps → Web (</>)**: سجّل تطبيق ويب، وانسخ قيم `firebaseConfig` في `content/site.ts`.
7. ادخل على `/work/account/` واعمل حسابك عادي. بعدها من **Authentication → Users** انسخ الـ User UID بتاعك،
   وفي **Firestore → Start collection** اعمل collection اسمها `admins` وجواها document الـ ID بتاعه هو الـ UID ده (من غير حقول، أو حقل `name`).
   كده لوحة الإدارة `/work/admin/` هتفتح معاك انت بس.

رابط تسجيل العملاء اللي تبعته لأي عميل: https://eldeebeldeeb35-afk.github.io/adjop/work/account/
