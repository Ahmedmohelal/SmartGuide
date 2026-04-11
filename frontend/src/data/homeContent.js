/**
 * محتوى الصفحة الرئيسية — النصوص والصور المحلية من `assets/images/homeImages.js`.
 */
import { homeImages } from "../assets/images/homeImages";

const [feat1, feat2, feat3, feat4, feat5, feat6, feat7] = homeImages.featured;
const [ex1, ex2, ex3, ex4] = homeImages.experiences;
const [newsImg1, newsImg2, newsImg3, newsImg4] = homeImages.news;

export const navLinks = [
  { label: "الرئيسية", href: "#hero" },
  { label: "من نحن", href: "#about" },
  { label: "الوجهات", href: "#featured" },
  { label: "المدونة", href: "#news" },
  { label: "اتصل بنا", href: "#footer" },
];

export const hero = {
  title: "عجائب الطبيعة في انتظارك",
  subtitle:
    "اكتشف مصر من جديد: تاريخ عريق، شواطئ ساحرة، وضيافة أصيلة في رحلة واحدة لا تُنسى.",
  cta: "ابدأ رحلتك",
  image: homeImages.hero,
};

export const services = [
  {
    title: "تنظيم الرحلات",
    description: "برامج سياحية مرنة تناسب عائلتك أو مجموعتك بأفضل الأسعار.",
    icon: "plane",
  },
  {
    title: "الإقامة",
    description: "فنادق وفيلات مختارة بعناية في أهم المدن والمنتجعات.",
    icon: "hotel",
  },
  {
    title: "جولات مرشدة",
    description: "مرشدون محليون يعرفون تاريخ مصر وأسرارها الحقيقية.",
    icon: "map",
  },
  {
    title: "تجارب فوتوغرافية",
    description: "أماكن تصوير مميزة وتنسيق لالتقاط ذكرياتك الأجمل.",
    icon: "camera",
  },
];

export const featuredPlaces = {
  title: "الأماكن المتميزة",
  items: [
    {
      id: 1,
      name: "الأهرامات",
      span: "sm",
      image: feat1,
    },
    {
      id: 2,
      name: "أبو سمبل",
      span: "sm",
      image: feat2,
    },
    {
      id: 3,
      name: "الإسكندرية",
      span: "sm",
      image: feat3,
    },
    {
      id: 4,
      name: "الأقصر",
      span: "sm",
      image: feat4,
    },
    {
      id: 5,
      name: "النيل والمعابد",
      span: "lg",
      image: feat5,
    },
    {
      id: 6,
      name: "البحر الأحمر",
      span: "lg",
      image: feat6,
    },
    {
      id: 7,
      name: "واحة سيوة",
      span: "lg",
      image: feat7,
    },
  ],
};

export const partners = [
  "مصر للطيران",
  "وزارة السياحة",
  "فنادق النيل",
  "رحلات أثرية",
  "سفاري الصحراء",
];

export const about = {
  title: "عن Smart Guide Egypt",
  body:
    "نحن منصة سياحية مصرية تربط المسافر بأفضل الوجهات والخدمات، مع التركيز على الجودة والأمان وتجربة مستخدم عربية بالكامل.",
  bullets: [
    { text: "دعم متواصل أثناء الرحلة", icon: "headphones" },
    { text: "برامج مخصصة للعائلات والشباب", icon: "users" },
  ],
  cta: "اقرأ المزيد",
  image: homeImages.about,
};

export const experiences = {
  title: "اختبر مصر بأسلوبك",
  body:
    "من الصحراء الذهبية إلى مياه البحر الأحمر، صمّمنا لك مسارات متنوعة تجمع بين التاريخ والطبيعة والرفاهية.",
  cta: "استكشف البرامج",
  cards: [
    {
      title: "أبو الهول",
      image: ex1,
    },
    {
      title: "الأقصر",
      image: ex2,
    },
    {
      title: "القاهرة",
      image: ex3,
    },
    {
      title: "شرم الشيخ",
      image: ex4,
    },
  ],
};

export const news = {
  title: "أخر الأخبار",
  items: [
    {
      title: "موسم الشتاء في الأقصر",
      excerpt: "أفضل الأوقات لزيارة المعابد دون ازدحام، مع نصائح للتصوير.",
      date: "مارس 2026",
      image: newsImg1,
    },
    {
      title: "رحلات نيلية بأجواء خاصة",
      excerpt: "عشاء على متن مركب تقليدي مع إطلالة على معالم القاهرة المضيئة.",
      date: "فبراير 2026",
      image: newsImg2,
    },
    {
      title: "شواطئ الإسكندرية",
      excerpt: "جولة في كورنيش الإسكندرية وقلعة قايتباي في يوم واحد.",
      date: "يناير 2026",
      image: newsImg3,
    },
    {
      title: "غوص في البحر الأحمر",
      excerpt: "مواقع غوص آمنة للمبتدئين والمحترفين مع مراكز معتمدة.",
      date: "ديسمبر 2025",
      image: newsImg4,
    },
  ],
};

export const appBanner = {
  title: "حمّل تطبيقنا الآن",
  subtitle: "احجز، تتبع رحلتك، واستلم إشعارات العروض من هاتفك.",
};

export const nileCta = {
  title: "جاهز لرحلة العمر؟",
  subtitle: "تواصل معنا لبرنامج مخصص يناسب ميزانيتك ووقتك.",
  cta: "احجز استشارة مجانية",
  image: homeImages.nileCta,
};

export const footer = {
  brand: "Smart Guide Egypt",
  links: [
    { label: "الرئيسية", href: "#hero" },
    { label: "الوجهات", href: "#featured" },
    { label: "المدونة", href: "#news" },
    { label: "سياسة الخصوصية", href: "#" },
    { label: "الشروط", href: "#" },
  ],
  copyright: "© 2026 Smart Guide Egypt. جميع الحقوق محفوظة.",
};
