import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

function Landing({ onNavigate }) {
  const slides = useMemo(
    () => [
      {
        id: "01",
        titleLine1: "TRAVEL FAR,",
        titleLine2: "FIND YOURSELF",
        tagline: "Embark On The Journey Of A Lifetime",
        description:
          "Embark on a thrilling adventure across diverse landscapes with us. Explore pristine roads, scenic nature, and hidden gems while immersing yourself in local cultures.",
        src: "/images/car_on_road.jpg",
        location: "Open Road",
      },
      {
        id: "02",
        titleLine1: "DISCOVER THE",
        titleLine2: "UNEXPLORED",
        tagline: "Every Road Has A Story To Tell",
        description:
          "Plot intelligent routes, track daily quests, and navigate through interactive maps designed for effortless road trip planning.",
        src: "/images/map.jpg",
        location: "Journey Map",
      },
      {
        id: "03",
        titleLine1: "CHASE NEW",
        titleLine2: "HORIZONS",
        tagline: "Navigate With AI Precision",
        description:
          "Real-time route planning, weather forecasts, and custom travel agent recommendations tailored to your exact budget and group size.",
        src: "/images/road-map-551x367.jpg",
        location: "Routes",
      },
      {
        id: "04",
        titleLine1: "MEMORIES AT",
        titleLine2: "EVERY STOP",
        tagline: "Walk, Explore, And Conquer Quests",
        description:
          "Earn XP, unlock badges, and experience curated food spots and cultural landmarks along your road trip.",
        src: "/images/walking_people.jpg",
        location: "Culture & Walks",
      },
    ],
    []
  );

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="relative w-full min-h-screen h-[920px] lg:h-screen overflow-hidden bg-black text-white font-['Montserrat',sans-serif] text-[98%]">
      {/* Full Screen Background Image Canvas */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slides[activeIndex].src}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src={slides[activeIndex].src}
            alt={slides[activeIndex].titleLine1}
            className="w-full h-full object-cover object-center"
          />
          {/* Subtle Dark Gradients for optimal readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
        </motion.div>
      </AnimatePresence>

      {/* Main Overlay Content */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-8 sm:px-12 flex flex-col justify-end pb-12 pt-24">
        
        {/* Main Grid: Left Hero Section + Right Cards Queue */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end w-full">
          
          {/* Left Hero Section (Positioned Down, Matching Reference) */}
          <div className="lg:col-span-5 space-y-5 pb-2">
            
            {/* Horizontal Line Tagline Header */}
            <motion.div
              key={`tagline-${activeIndex}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3 text-white/90 text-[0.83rem] font-medium tracking-wide"
            >
              <div className="w-8 h-[2px] bg-white/80" />
              <span>{slides[activeIndex].tagline}</span>
            </motion.div>

            {/* Headline (Tall, Bold, Uppercase Multi-line, 2% Size Reduction) */}
            <motion.div
              key={`title-${activeIndex}`}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl sm:text-5xl lg:text-[4.1rem] font-black tracking-tight leading-[1.04] text-white uppercase drop-shadow-2xl"
            >
              <h1>{slides[activeIndex].titleLine1}</h1>
              <h1>{slides[activeIndex].titleLine2}</h1>
            </motion.div>

            {/* Description (2% Reduced) */}
            <motion.p
              key={`desc-${activeIndex}`}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-[0.83rem] sm:text-[0.93rem] text-white/75 leading-relaxed max-w-md drop-shadow"
            >
              {slides[activeIndex].description}
            </motion.p>

            {/* Action Button (Sleek Outline Pill matching Reference) */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="pt-2 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-[#ffd000] text-black flex items-center justify-center font-bold text-xs shadow-lg">
                ★
              </div>
              <button
                onClick={() => onNavigate && onNavigate("plan")}
                className="rounded-full border border-white/50 bg-black/30 backdrop-blur-md px-7 py-3 text-[0.78rem] sm:text-[0.83rem] font-bold uppercase tracking-widest text-white hover:bg-white hover:text-black transition duration-300 shadow-xl"
              >
                Start Your Adventure
              </button>
            </motion.div>
          </div>

          {/* Right Column: Thumbnail Queue + Workings Below */}
          <div className="lg:col-span-7 flex flex-col items-end space-y-4">
            
            {/* Thumbnail Cards Queue (Portrait Rounded Cards matching Reference Image 2) */}
            <div className="flex items-center gap-4 overflow-x-auto max-w-full pb-2 scrollbar-none z-20">
              {slides.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`relative flex-shrink-0 w-32 sm:w-40 h-44 sm:h-56 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                    idx === activeIndex
                      ? "border-white scale-105 shadow-2xl ring-2 ring-white/40"
                      : "border-white/20 opacity-70 hover:opacity-100 hover:scale-100"
                  }`}
                >
                  <img src={slide.src} alt={slide.location} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex flex-col justify-end text-left">
                    <span className="text-[9px] text-white/80 uppercase tracking-wider font-semibold">{slide.location}</span>
                    <span className="text-[0.73rem] font-bold text-white line-clamp-1">{slide.titleLine1} {slide.titleLine2}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Workings Row Below Image Queue: [<] [>] ------------------------ [01] */}
            <div className="flex items-center gap-4 w-full pt-3 z-20">
              
              {/* Circular Navigation Arrows (< >) */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length)}
                  className="w-10 h-10 rounded-full border border-white/40 bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-black transition text-sm"
                  aria-label="Previous Slide"
                >
                  ‹
                </button>
                <button
                  onClick={() => setActiveIndex((prev) => (prev + 1) % slides.length)}
                  className="w-10 h-10 rounded-full border border-white/40 bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-black transition text-sm"
                  aria-label="Next Slide"
                >
                  ›
                </button>
              </div>

              {/* Progress Line */}
              <div className="h-[1px] flex-1 bg-white/30 relative overflow-hidden rounded-full mx-2">
                <motion.div
                  key={activeIndex}
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 5, ease: "linear" }}
                  className="h-full bg-white"
                />
              </div>

              {/* Big Bold Slide Number Count (2% Reduced) */}
              <span className="text-2xl sm:text-[2.6rem] font-black tracking-widest text-white drop-shadow-lg">
                {slides[activeIndex].id}
              </span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default Landing;
