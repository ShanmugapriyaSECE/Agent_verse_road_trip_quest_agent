import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import slide1 from "../assets/landing1.png";
import slide2 from "../assets/landing2.png";
import slide3 from "../assets/landing3.png";

function Landing({ onNavigate }) {
  const slides = useMemo(
    () => [
      {
        title: "Ripple of the horizon",
        subtitle: "A vivid preview of your road trip adventure.",
        src: slide1,
      },
      {
        title: "Sunlit pathways",
        subtitle: "Every frame invites you closer to a new destination.",
        src: slide2,
      },
      {
        title: "Captured moments",
        subtitle: "Feel the journey with real scenes that change automatically.",
        src: slide3,
      },
    ],
    []
  );

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="landing-page flex min-h-[calc(100vh-96px)] items-center justify-center py-16">
      <div className="landing-slideshow mx-auto grid w-full max-w-6xl gap-10 px-4">
        <div className="space-y-6 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-[var(--spark-500)]">Road Trip Quest</p>
          <h1 className="text-5xl font-black tracking-tight sm:text-6xl">Your next adventure starts in every frame.</h1>
          <p className="mx-auto max-w-3xl text-lg text-[var(--muted-text)]">
            Enjoy a simple slideshow of the landing visuals while you plan, replan, book stays, and discover real place images.
          </p>
          <button
            onClick={() => onNavigate && onNavigate("plan")}
            className="inline-flex rounded-full bg-gradient-to-r from-[#d858ff] via-[#9b6cff] to-[#ff75c8] px-8 py-4 text-lg font-semibold text-white shadow-[0_20px_70px_rgba(155,108,255,0.24)] transition hover:-translate-y-0.5 hover:scale-[1.01]"
          >
            Plan Trip
          </button>
        </div>

        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[rgba(255,255,255,0.04)] shadow-[0_30px_90px_rgba(0,0,0,0.27)]">
          <AnimatePresence mode="wait">
            <motion.img
              key={slides[activeIndex].src}
              src={slides[activeIndex].src}
              alt={slides[activeIndex].title}
              className="h-[520px] w-full object-cover"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.75, ease: "easeOut" }}
            />
          </AnimatePresence>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-6 py-5 text-left">
            <p className="text-sm uppercase tracking-[0.35em] text-[var(--spark-500)]">Featured Scene</p>
            <h2 className="mt-2 text-3xl font-bold text-white">{slides[activeIndex].title}</h2>
            <p className="mt-1 max-w-2xl text-sm text-[rgba(255,255,255,0.82)]">{slides[activeIndex].subtitle}</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3">
          {slides.map((slide, index) => (
            <button
              key={slide.title}
              onClick={() => setActiveIndex(index)}
              className={`h-3 w-3 rounded-full transition ${
                index === activeIndex ? "bg-white shadow-[0_0_14px_rgba(255,255,255,0.45)]" : "bg-white/30"
              }`}
              aria-label={`Show slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Landing;
