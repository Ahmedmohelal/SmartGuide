/**
 * محتوى الصفحة الرئيسية — النصوص والصور المحلية من `assets/images/homeImages.js`.
 */
import { homeImages } from "../assets/images/homeImages";

const [feat1, feat2, feat3, feat4, feat5, feat6, feat7] = homeImages.featured;
const [newsImg1, newsImg2, newsImg3, newsImg4] = homeImages.news;

export const navLinks = [
  { label: "Home", href: "#hero" },
  { label: "About", href: "#about" },
  { label: "Featured Places", href: "#featured" },
  { label: "Our Guides", href: "#guides" },
  { label: "Tours", href: "#tours" },
  { label: "Contact", href: "#footer" },
  { label: "Places", href: "/places" },
];

export const hero = {
  title: "Nature's Wonders Are Waiting",
  subtitle:
    "Rediscover Egypt through timeless history, stunning beaches, and authentic hospitality in one unforgettable journey.",
  cta: "Start Your Journey",
  image: homeImages.hero,
};

export const services = [
  {
    title: "Trip Planning",
    description: "Flexible travel programs for families and groups at great prices.",
    icon: "plane",
  },
  {
    title: "Accommodation",
    description: "Carefully selected hotels and villas in top cities and resorts.",
    icon: "hotel",
  },
  {
    title: "Guided Tours",
    description: "Local guides who know Egypt's history and hidden gems.",
    icon: "map",
  },
  {
    title: "Photo Experiences",
    description: "Scenic spots and planning support to capture your best memories.",
    icon: "camera",
  },
];

export const featuredPlaces = {
  title: "Featured Places",
  items: [
    {
      id: 1,
      name: "The Pyramids",
      span: "sm",
      image: feat1,
    },
    {
      id: 2,
      name: "Abu Simbel",
      span: "sm",
      image: feat2,
    },
    {
      id: 3,
      name: "Alexandria",
      span: "sm",
      image: feat3,
    },
    {
      id: 4,
      name: "Luxor",
      span: "sm",
      image: feat4,
    },
    {
      id: 5,
      name: "Nile & Temples",
      span: "lg",
      image: feat5,
    },
    {
      id: 6,
      name: "Red Sea",
      span: "lg",
      image: feat6,
    },
    {
      id: 7,
      name: "Siwa Oasis",
      span: "lg",
      image: feat7,
    },
  ],
};

export const partners = [
  "EgyptAir",
  "Ministry of Tourism",
  "Nile Hotels",
  "Heritage Tours",
  "Desert Safari",
];

export const about = {
  title: "About Smart Guide Egypt",
  body:
    "We are an Egyptian travel platform connecting travelers with top destinations and services, with a focus on quality, safety, and a seamless experience.",
  bullets: [
    { text: "Continuous support throughout your trip", icon: "headphones" },
    { text: "Tailored programs for families and young travelers", icon: "users" },
  ],
  cta: "Read More",
  image: homeImages.about,
};



export const news = {
  title: "Latest News",
  items: [
    {
      title: "Luxor Winter Season",
      excerpt: "The best time to visit temples with fewer crowds, plus photography tips.",
      date: "March 2026",
      image: newsImg1,
    },
    {
      title: "Private Nile Cruises",
      excerpt: "Dinner on a traditional boat with views of Cairo's illuminated landmarks.",
      date: "February 2026",
      image: newsImg2,
    },
    {
      title: "Alexandria Beaches",
      excerpt: "A one-day tour across Alexandria Corniche and Qaitbay Citadel.",
      date: "January 2026",
      image: newsImg3,
    },
    {
      title: "Red Sea Diving",
      excerpt: "Safe diving spots for beginners and professionals with certified centers.",
      date: "December 2025",
      image: newsImg4,
    },
  ],
};

export const appBanner = {
  title: "Download Our App Now",
  subtitle: "Book, track your trip, and receive offer notifications on your phone.",
};


export const footer = {
  brand: "Smart Guide Egypt",
  links: [
    { label: "Home", href: "#hero" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms", href: "#" },
  ],
  copyright: "© 2026 Smart Guide Egypt. All rights reserved.",
};
