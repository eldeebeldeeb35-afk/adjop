// ============================================================
//  كل محتوى الموقع هنا — عدّل الملف ده بس عشان تغيّر الكلام أو الروابط.
//  أي رابط فاضي ("") الزرار بتاعه بيختفي تلقائيًا.
// ============================================================

export const person = {
  name: "حمدي الديب",
  latinName: "Hamdy Eldeeb",
  tagline: "كل نجمة كانت في مكان… لحد ما اتجمعت من جديد.",
  heroLine: "نفس الإنسان، اتبنى من جديد.",
};

export const links = {
  youtube: "https://www.youtube.com/@hamdyeldee",
  facebook: "https://www.facebook.com/share/1J6HRgC4Vg/",
  tiktok: "https://www.tiktok.com/@hamdyeldeeb9",
  instagram: "https://www.instagram.com/eldeebeldeeb23",
  work: "https://www.facebook.com/profile.php?id=100088481756405", // صفحة dip: فصل الألوان والتصميم
  printShop: "", // TODO: رابط صفحة المطبعة لما تتعمل
  email: "", // TODO: إيميل للتواصل
};

export const youtubeChannelId = "UCbmQG5ZloQge0MkvPRsVxRw";

// ---------- مسار الشغل: التصميم وفصل الألوان والمطبعة ----------
export const professional = {
  role: "تصميم وفصل ألوان لطباعة السلك سكرين",
  intro:
    "مصمم جرافيك متخصص في تجهيز التصميمات لطباعة الملابس بالسلك سكرين: بفصل كل تصميم لألوانه، لون لكل شاشة، عشان يطلع على القماش زي ما اتصمم بالظبط. وعندي مطبعة ملابس، فبتابع الشغل من التصميم لحد القطعة المطبوعة.",
  services: [
    { title: "تصميم للملابس", text: "تصميمات تيشيرتات وهوديز وشعارات، متجهّزة من الأول عشان تتطبع." },
    { title: "فصل الألوان", text: "تقسيم التصميم لشاشات، لون لكل شاشة، وتجهيز الدرجات عشان التفاصيل ما تضيعش في الطباعة." },
    { title: "الطباعة في المطبعة", text: "طباعة سلك سكرين على الملابس في مطبعتي، بنفس الألوان اللي اتفصلت." },
  ],
  workflow: ["التصميم", "فصل الألوان", "تجهيز الشاشات", "الطباعة", "التسليم"],
  // صفحات الشغل: صفحة dip بتعرض فصل الألوان، وصفحة المطبعة لوحدها
  pages: [
    { key: "work", name: "dip", role: "صفحة فصل الألوان والتصميم", text: "معرض شغل فصل الألوان والتصميمات." },
    { key: "printShop", name: "المطبعة", role: "طباعة سلك سكرين على الملابس", text: "صفحة المطبعة هتنزل قريب." },
  ] as { key: "work" | "printShop"; name: string; role: string; text: string }[],
  study: "فن صيانة أجهزة طبية",
  // خبرات عملية: ضيف هنا { period: "2024 — الآن", title: "...", place: "..." }
  experience: [] as { period: string; title: string; place: string }[],
};

// ---------- مسار المحتوى: «لسه في رجوع» ----------
export const journey = {
  title: "لسه في رجوع",
  intro:
    "مش محاضرات، ومش حد واقف فوق بيحكم على حد. دي حكايات ناس تاهت، وأجّلت، وقالت «بعدين»… وبعدين رجعت.",
  philosophy: [
    { title: "صادقة", text: "القصة بتتحكي زي ما هي، باللحظة الصعبة قبل الحلوة." },
    { title: "هادية", text: "من غير صريخ ولا تخويف. الهدوء بيوصل أبعد." },
    { title: "من غير وعظ", text: "مفيش «لازم» و«المفروض». فيه إنسان بيحكي لإنسان." },
    { title: "الباب مفتوح", text: "الرسالة كلها في جملة: مهما بعدت… لسه في رجوع." },
  ],
  // إزاي الحلقة بتتعمل: من الفكرة لحد ما تشوفها
  making: {
    title: "من الفكرة لحد ما تشوفها",
    intro: "كل حلقة بتعدّي على نفس الطريق: فكرة، وسيناريو، وإنتاج، ومونتاج، ونشر. شغل فرد واحد من أول سطر لآخر ثانية.",
    workflow: ["الفكرة", "السيناريو", "الإنتاج", "المونتاج", "النشر"],
    skills: [
      { title: "كتابة وحكي", text: "سيناريو قائم على قصة حقيقية، وبداية تشد من أول ثانيتين." },
      { title: "إنتاج بالذكاء الاصطناعي", text: "مشاهد وشخصيات ثابتة الملامح بأدوات الصور والفيديو." },
      { title: "مونتاج", text: "إيقاع وصوت وترجمة على الشاشة، ونسخة لكل منصة." },
      { title: "منصات ونمو", text: "ريلز من كل حلقة، ومتابعة الأرقام وتطوير اللي بينجح." },
    ],
    stats: [
      { value: "١٢", label: "حلقة في السلسلة" },
      { value: "٥–٧", label: "ريلز من كل حلقة" },
      { value: "٤", label: "منصات" },
    ],
  },
};

export const series = {
  firstEpisode: "2026-11-17",
  everyDays: 7,
  total: 12,
  // videoId بيتملى لكل حلقة لما تنزل
  episodes: [
    {
      n: 1,
      title: "هل ممكن ربنا يغفر لي بعد كل اللي عملته؟ قصتي",
      videoId: "aGR0PG2vDIg",
      duration: "17:58",
    },
  ] as { n: number; title: string; videoId?: string; duration?: string }[],
};

export const shorts = [
  { id: "OcB9K01lWqI", title: "كان بيني وبين الموت شعرة…" },
  { id: "upVKU-G-tNo", title: "دعيت ومحصلش حاجة؟ اسمع ده" },
  { id: "BtFr1TO5tMY", title: "المتدين في الأفلام vs في الواقع" },
  { id: "O1_iqc9FAzQ", title: "هل حد ضامن بكرة" },
];

export const siteUrl = "https://eldeebeldeeb35-afk.github.io/adjop/";
export const subscribeUrl = `${"https://www.youtube.com/@hamdyeldee"}?sub_confirmation=1`;

// WhatsApp share link: matches the "ابعتها لحد محتاج يسمعها" call to action
export const whatsappShare = (title: string, url: string) =>
  `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`;
