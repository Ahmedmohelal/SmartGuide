import { appBanner } from "../../data/homeContent";
import toast from "react-hot-toast";

export default function AppDownloadSection() {
  const handleAppStoreClick = () => {
    toast.success("will be available soon!");
  };

  const handleGooglePlayClick = () => {
    toast.success("will be available soon!");
  };

  return (
    <section className="home-app-pattern px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
          {appBanner.title}
        </h2>
        <p className="mt-3 text-white/85">{appBanner.subtitle}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href=""
            className="inline-flex min-w-[160px] items-center justify-center rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-black/90"
            onClick={handleAppStoreClick}
          >
            App Store
          </a>
          <a
            href=""
            className="inline-flex min-w-[160px] items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-bold text-egypt-teal transition hover:bg-white/95"
            onClick={handleGooglePlayClick}
          >
            Google Play
          </a>
        </div>
      </div>
    </section>
  );
}
