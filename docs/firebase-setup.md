# حسابات العملاء (Firebase)

الموقع static على GitHub Pages، فالحسابات والطلبات محفوظة في Firebase، على الخطة المجانية (Spark).

## اللي اتعمل
- المشروع: `hamdy-eldeeb` (مربوط في `.firebaserc`، والإعدادات في `content/site.ts`).
- تسجيل الدخول: Google و Email/Password، والدومين `eldeebeldeeb35-afk.github.io` مسموح.
- قاعدة البيانات: Firestore في `eur3`، وقواعد الحماية من `firestore.rules`.
  لو اتعدّلت القواعد: `firebase deploy --only firestore:rules`.

## تسجيل الأدمن (مرة واحدة)
1. اعمل حسابك عادي من https://eldeebeldeeb35-afk.github.io/adjop/work/account/
2. من Firebase Console → Authentication → Users انسخ الـ User UID بتاعك.
3. Firestore Database → Start collection → اسمها `admins` → Document ID = الـ UID → ضيف حقل `name` (string) واحفظ.
4. افتح https://eldeebeldeeb35-afk.github.io/adjop/work/admin/

## رابط تسجيل العملاء
https://eldeebeldeeb35-afk.github.io/adjop/work/account/
