import { useEffect, useRef, useState } from "react";
import { HashLink } from "react-router-hash-link";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import {
  Award,
  Globe2,
  Heart,
  Map,
  MapPin,
  Navigation,
  Rocket,
  Shield,
  Sparkles,
  Target,
  UserRound,
  Users,
} from "lucide-react";
import heroImage from "../assets/images/herosection2.jpg";
import whoImage from "../assets/images/whoarewe.jpg";
import finalImage from "../assets/images/lastsection.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 42 },
  show: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.14,
    },
  },
};

const MotionArticle = motion.article;
const MotionDiv = motion.div;
const MotionSection = motion.section;

const stats = [
  { value: 500, suffix: "+", label: "Tours", icon: Map },
  { value: 100, suffix: "+", label: "Professional Guides", icon: Users },
  { value: 50, suffix: "+", label: "Destinations", icon: MapPin },
  { value: 10, suffix: "K+", label: "Travelers", icon: Globe2 },
];

const features = [
  {
    title: "Trusted Local Guides",
    description:
      "Expert guides with deep knowledge of Egyptian culture and history",
    icon: Users,
  },
  {
    title: "Personalized Experiences",
    description: "Tailored tours that match your interests and travel style",
    icon: Heart,
  },
  {
    title: "Secure Platform",
    description:
      "Safe and secure booking with verified guides and protected payments",
    icon: Shield,
  },
  {
    title: "Smart Tourism Technology",
    description: "AI-powered recommendations and real-time guidance",
    icon: Sparkles,
  },
  {
    title: "Hidden Destinations",
    description: "Discover secret spots and authentic local experiences",
    icon: MapPin,
  },
  {
    title: "Easy Navigation",
    description:
      "Seamless booking and intuitive platform for hassle-free travel",
    icon: Navigation,
  },
];

const team = [
  { name: "Ahmed Helal", role: "Frontend Developer" },
  { name: "Mariam Mahmoud", role: "Frontend Developer" },
  { name: "Sawsan Amer", role: "Backend Developer" },
  { name: "Ahmed Medhat", role: "Backend Developer" },
  { name: "Abdullah Elqisy", role: "Flutter" },
  { name: "Ebrahim Elhaw", role: "Flutter" },
  { name: "Abdullah Awadin", role: "UI/UX Designer" },
  { name: "Mostafa Heikal", role: "UI/UX Designer" },
  { name: "Hana Ashraf", role: "AI Trainer" },
  { name: "Lina Ashraf", role: "Data Analyst" },
];

function AnimatedSection({ children, className = "" }) {
  return (
    <MotionSection
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.22 }}
      className={className}
    >
      {children}
    </MotionSection>
  );
}

function CountUp({ value, suffix }) {
  const [current, setCurrent] = useState(0);
  const hasRunRef = useRef(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    if (!inView || hasRunRef.current) return undefined;

    hasRunRef.current = true;
    const duration = 1400;
    const startedAt = performance.now();
    let frameId;

    const tick = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(value * eased));

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [inView, value]);

  return (
    <span ref={ref}>
      {current}
      {suffix}
    </span>
  );
}

export default function AboutUs() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  return (
    <main className="bg-slate-50 text-slate-800" dir="ltr">
      <section className="relative min-h-screen overflow-hidden bg-egypt-teal pt-32">
        <img
          src={heroImage}
          alt="Camels and pyramids in Egypt"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-egypt-teal/80" />

        <MotionDiv
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 mx-auto flex min-h-[calc(100vh-8rem)] max-w-5xl flex-col items-center justify-center px-4 text-center text-white"
        >
          <h1 className="text-4xl font-extrabold sm:text-6xl">
            About SmartGuideEgypt
          </h1>
          <p className="mt-8 max-w-3xl text-xl leading-relaxed sm:text-2xl">
            Discover Egypt through smart technology, local guides, and
            unforgettable experiences. Your journey to ancient wonders starts
            here.
          </p>
          <div className="mt-12 flex flex-col gap-4 sm:flex-row">
            <HashLink
              smooth
              to="/home#tours"
              className="rounded-xl bg-egypt-gold px-10 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-white hover:text-black"
            >
              Explore Tours
            </HashLink>
            <HashLink
              smooth
              to="/home#guides"
              className="rounded-xl bg-white px-10 py-4 text-lg font-bold text-egypt-teal shadow-lg transition hover:bg-egypt-gold hover:text-white"
            >
              Meet Our Guides
            </HashLink>
          </div>
        </MotionDiv>
      </section>

      <AnimatedSection className="bg-white py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <MotionDiv variants={fadeUp}>
            <div className="h-1 w-20 rounded-full bg-egypt-gold" />
            <h2 className="mt-10 text-4xl font-extrabold text-egypt-teal sm:text-5xl">
              Who We Are
            </h2>
            <div className="mt-10 space-y-7 text-xl leading-9 text-slate-700">
              <p>
                SmartGuideEgypt is a revolutionary tourism platform that bridges
                the gap between modern technology and authentic Egyptian
                experiences. We connect travelers with verified local guides who
                bring history to life.
              </p>
              <p>
                Our vision is to make Egypt&apos;s incredible heritage
                accessible to everyone through personalized, secure, and
                intelligent travel solutions. We believe that every journey
                should be transformative, memorable, and deeply connected to
                local culture.
              </p>
              <p>
                With cutting-edge AI recommendations and a community of
                passionate guides, we&apos;re redefining how the world discovers
                Egypt.
              </p>
            </div>
          </MotionDiv>

          <MotionDiv
            variants={fadeUp}
            className="overflow-hidden rounded-3xl shadow-2xl"
          >
            <img
              src={whoImage}
              alt="Pyramids and Sphinx"
              className="h-full max-h-[520px] w-full object-cover"
            />
          </MotionDiv>
        </div>
      </AnimatedSection>

      <AnimatedSection className="bg-gradient-to-r from-[#245f38] via-egypt-teal to-[#005144] py-24">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <MotionDiv
                variants={fadeUp}
                key={item.label}
                className="rounded-2xl bg-white/12 p-9 text-center text-white shadow-xl backdrop-blur"
              >
                <Icon
                  className="mx-auto h-12 w-12 text-egypt-gold"
                  strokeWidth={2.2}
                />
                <p className="mt-10 text-5xl font-extrabold">
                  <CountUp value={item.value} suffix={item.suffix} />
                </p>
                <p className="mt-6 text-lg font-semibold text-white/80">
                  {item.label}
                </p>
              </MotionDiv>
            );
          })}
        </div>
      </AnimatedSection>

      <AnimatedSection className="bg-slate-50 py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <MotionArticle
            variants={fadeUp}
            className="rounded-3xl bg-white p-10 shadow-xl"
          >
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-egypt-teal text-egypt-gold">
              <Target className="h-10 w-10" />
            </span>
            <h2 className="mt-12 text-4xl font-extrabold text-egypt-teal">
              Our Mission
            </h2>
            <p className="mt-8 text-xl leading-9 text-slate-700">
              To empower travelers with authentic Egyptian experiences through
              technology-driven solutions, trusted local expertise, and
              personalized journeys that celebrate the rich heritage of Egypt.
            </p>
          </MotionArticle>

          <MotionArticle
            variants={fadeUp}
            className="rounded-3xl bg-white p-10 shadow-xl"
          >
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-egypt-gold text-white">
              <Rocket className="h-10 w-10" />
            </span>
            <h2 className="mt-12 text-4xl font-extrabold text-egypt-teal">
              Our Vision
            </h2>
            <p className="mt-8 text-xl leading-9 text-slate-700">
              To become the world&apos;s leading smart tourism platform,
              transforming how people discover and experience Egypt&apos;s
              wonders, one personalized journey at a time.
            </p>
          </MotionArticle>
        </div>
      </AnimatedSection>

      <AnimatedSection className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <MotionDiv variants={fadeUp} className="text-center">
            <h2 className="text-4xl font-extrabold text-[#0b3b5c] sm:text-5xl">
              Why Choose Us
            </h2>
            <p className="mt-8 text-2xl text-slate-500">
              Experience the difference with SmartGuideEgypt
            </p>
          </MotionDiv>

          <div className="mt-20 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <MotionArticle
                  variants={fadeUp}
                  key={feature.title}
                  className="rounded-2xl bg-white p-10 shadow-xl"
                >
                  <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-egypt-teal text-egypt-gold">
                    <Icon className="h-8 w-8" />
                  </span>
                  <h3 className="mt-10 text-2xl font-extrabold text-egypt-teal">
                    {feature.title}
                  </h3>
                  <p className="mt-6 text-lg leading-8 text-slate-500">
                    {feature.description}
                  </p>
                </MotionArticle>
              );
            })}
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <MotionDiv variants={fadeUp}>
            <h2 className="text-4xl font-extrabold text-[#0b3b5c] sm:text-5xl">
              Meet Our Team
            </h2>
            <p className="mt-8 text-2xl text-slate-500">
              Passionate professionals dedicated to your perfect journey
            </p>
          </MotionDiv>

          <div className="mt-20 grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member) => (
              <MotionArticle variants={fadeUp} key={member.name}>
                <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-full bg-gradient-to-br from-teal-50 to-slate-200 text-egypt-teal shadow-xl">
                  <UserRound className="h-32 w-32" strokeWidth={1.4} />
                </div>
                <span className="-mt-10 mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-egypt-gold text-white shadow-lg">
                  <Award className="h-8 w-8" />
                </span>
                <h3 className="mt-5 text-2xl font-extrabold text-egypt-teal">
                  {member.name}
                </h3>
                <p className="mt-2 text-lg text-slate-500">{member.role}</p>
              </MotionArticle>
            ))}
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection className="relative overflow-hidden bg-egypt-teal py-28 text-white">
        <img
          src={finalImage}
          alt="Pyramids in the distance"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-egypt-teal/80" />
        <MotionDiv
          variants={fadeUp}
          className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8"
        >
          <h2 className="text-4xl font-extrabold sm:text-5xl">
            Ready To Explore Egypt?
          </h2>
          <p className="mx-auto mt-8 max-w-3xl text-2xl leading-relaxed text-white/85">
            Join thousands of travelers who have discovered the magic of Egypt
            with SmartGuideEgypt. Your adventure awaits.
          </p>
          <Link
            to="/home"
            className="mt-12 inline-flex rounded-xl bg-egypt-gold px-16 py-5 text-xl font-bold text-white shadow-lg transition hover:bg-[#b08c18]"
          >
            Start Your Journey
          </Link>
        </MotionDiv>
      </AnimatedSection>
    </main>
  );
}
