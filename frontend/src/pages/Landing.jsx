import { motion } from "framer-motion";

function Landing({ onNavigate }) {
  const sections = [
    {
      title: "A layered voyage",
      description: "Scroll through multiple frames and feel the journey unfold in calm waves and soft skies.",
    },
    {
      title: "Frame by frame",
      description: "Each panel is a chapter in your trip story. The hero art changes with every scroll, giving depth to your adventure.",
    },
    {
      title: "Start with a plan",
      description: "Tap into the planner once you're ready — your trip begins from the first scroll.",
    },
  ];

  return (
    <div className="landing-page space-y-20 pb-24">
      <section className="landing-hero">
        <div className="landing-scene">
          <div className="landing-layer landing-layer-4"></div>
          <div className="landing-layer landing-layer-3"></div>
          <div className="landing-layer landing-layer-2"></div>
          <div className="landing-layer landing-layer-1"></div>
          <div className="landing-cloud cloud-1"></div>
          <div className="landing-cloud cloud-2"></div>
          <div className="landing-cloud cloud-3"></div>
          <div className="landing-sun" />
          <div className="landing-waves">
            <div className="landing-wave wave-1"></div>
            <div className="landing-wave wave-2"></div>
            <div className="landing-wave wave-3"></div>
            <div className="landing-wave wave-4"></div>
          </div>
          <div className="landing-copy">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center"
            >
              <p className="mb-4 inline-flex rounded-full bg-[rgba(255,255,255,0.12)] px-4 py-2 text-sm uppercase tracking-[0.32em] text-[var(--blush-400)]">Scroll to reveal the story</p>
              <h1 className="text-[4.4rem] leading-none font-black tracking-[-0.06em] text-[var(--text-on-dark)]">Stay Calm</h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--muted-text)]">A soothing landing page that splits the art into layered frames and lets the scroll connect the visuals to your trip journey.</p>
              <button
                onClick={() => onNavigate && onNavigate("plan")}
                className="mt-10 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff9f5e] to-[#f46d3b] px-8 py-4 text-lg font-semibold text-black shadow-2xl shadow-[rgba(255,149,94,0.24)] transition hover:scale-[1.02]"
              >
                Start Planning
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="landing-stack">
        {sections.map((item, index) => (
          <div key={item.title} className="landing-card rounded-[32px] border border-white/10 bg-[rgba(255,255,255,0.05)] p-8 shadow-2xl backdrop-blur-md">
            <p className="text-sm uppercase tracking-[0.24em] text-[var(--blush-400)]">Frame {index + 1}</p>
            <h2 className="mt-4 text-4xl font-semibold text-[var(--text-on-dark)]">{item.title}</h2>
            <p className="mt-3 text-[var(--muted-text)] max-w-2xl">{item.description}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

export default Landing;
