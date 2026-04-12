import "../styles/home.css";
import {
  HomeNavbar,
  HeroSection,
  ServicesSection,
  FeaturedPlacesSection,
  PartnersSection,
  AboutSection,
  ExperiencesSection,
  NewsSection,
  FaqSection,
  AppDownloadSection,
  NileCtaSection,
  HomeFooter,
} from "../components/home";

export default function Home() {
  return (
    <div
      dir="rtl"
      lang="ar"
      className="min-h-screen bg-white font-sans antialiased"
    >
      <HomeNavbar />
      <HeroSection />
      <ServicesSection />
      <FeaturedPlacesSection />
      <PartnersSection />
      <AboutSection />
      <ExperiencesSection />
      <NewsSection />
      <FaqSection />
      <AppDownloadSection />
      <NileCtaSection />
      <HomeFooter />
    </div>
  );
}
