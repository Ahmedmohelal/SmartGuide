/**
 * ربط صور `src/assets/images` بالصفحة الرئيسية.
 * الهيرو: صورة أفقية (هنا img14)؛ img1 غالبًا ما تناسبش قص الهيرو — غيّر الـ import لو حابب صورة تانية.
 */
import heroImg from "./img14.png";
import feat1 from "./img2.png";
import feat2 from "./img3.png";
import feat3 from "./img4.png";
import feat4 from "./img5.png";
import feat5 from "./img6.png";
import feat6 from "./img7.png";
import feat7 from "./img8.png";
import aboutImg from "./img9.png";
import exp1 from "./img10.png";
import exp2 from "./img11.png";
import exp3 from "./img12.png";
import exp4 from "./img13.png";
import news1 from "./img1.png";
import news2 from "./img15.png";
import news3 from "./img16.png";

/** صورة رابعة لبطاقات الأخبار (إعادة استخدام من المعرض) */
import news4 from "./img4.png";

export const homeImages = {
  hero: heroImg,
  nileCta: feat5,
  featured: [feat1, feat2, feat3, feat4, feat5, feat6, feat7],
  about: aboutImg,
  experiences: [exp1, exp2, exp3, exp4],
  news: [news1, news2, news3, news4],
};
