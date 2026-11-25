import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RiArrowRightLine } from 'react-icons/ri';
import { useApp } from '../context/AppContext';
import { brandGradient } from '../utils/brandGradient';

const FALLBACK_SLIDES = [
  {
    id: 1,
    title: 'AeroSound Max',
    subtitle: 'THE FUTURE OF ACOUSTICS',
    description: 'Experience pure acoustic bliss with active noise cancellation and up to 40 hours of battery life.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    link: '/product/1',
    btnText: 'Shop Collection',
    bgColor: 'from-primary-600 to-primary-900',
  },
];

const AUTOPLAY_MS = 6000;

const Hero = () => {
  const { heroSlides } = useApp();
  const slides = heroSlides && heroSlides.length > 0 ? heroSlides : FALLBACK_SLIDES;

  const [currentSlide, setCurrentSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef(null);

  const total = slides.length;
  const active = slides[currentSlide] || slides[0];

  useEffect(() => {
    if (currentSlide >= total) setCurrentSlide(0);
  }, [total, currentSlide]);

  useEffect(() => {
    if (total <= 1 || paused) return;
    const timer = setTimeout(() => setCurrentSlide((prev) => (prev + 1) % total), AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [total, paused, currentSlide]);

  const goTo = (idx) => setCurrentSlide(((idx % total) + total) % total);
  const nextSlide = () => goTo(currentSlide + 1);
  const prevSlide = () => goTo(currentSlide - 1);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(deltaX) > 50) {
      if (deltaX < 0) nextSlide();
      else prevSlide();
    }
    touchStartX.current = null;
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured offers"
      className="relative w-full overflow-hidden rounded-2xl md:rounded-3xl shadow-xl shadow-slate-900/10 h-[440px] sm:h-[460px] md:h-[500px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background gradients cross-fade */}
      {slides.map((slide, idx) => (
        <div
          key={`bg-${slide.id ?? idx}`}
          className={`absolute inset-0 bg-gradient-to-br ${brandGradient(slide.bgColor)} transition-opacity duration-1000 ease-in-out ${
            idx === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}

      {/* Decorative layers */}
      <div className="pointer-events-none absolute inset-0 bg-dots opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-black/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

      {/* Slide content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active.id ?? currentSlide}
          className="relative z-10 grid h-full grid-rows-[auto_1fr] md:grid-rows-1 md:grid-cols-2 items-center gap-2 px-6 pt-8 pb-14 sm:px-10 md:px-14 lg:px-16 md:py-12"
          initial="hidden"
          animate="show"
          exit="exit"
        >
          {/* Copy */}
          <motion.div
            className="flex flex-col items-start text-left"
            variants={{
              hidden: { opacity: 0, y: 16 },
              show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut', staggerChildren: 0.07 } },
              exit: { opacity: 0, y: -10, transition: { duration: 0.25 } },
            }}
          >
            {active.subtitle && (
              <motion.span
                variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                className="mb-3 md:mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                {active.subtitle}
              </motion.span>
            )}
            <motion.h2
              variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
              className="text-[28px] sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight text-white text-balance"
            >
              {active.title}
            </motion.h2>
            {active.description && (
              <motion.p
                variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                className="mt-3 md:mt-5 max-w-md text-[13px] md:text-base leading-relaxed text-white/80 line-clamp-2 md:line-clamp-3"
              >
                {active.description}
              </motion.p>
            )}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
              className="mt-5 md:mt-8 flex items-center gap-3"
            >
              <Link
                to={active.link || '/shop'}
                className="group inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 md:px-7 md:py-3.5 text-sm md:text-base font-bold text-slate-900 shadow-lg shadow-black/10 hover:bg-slate-100 transition-colors"
              >
                {active.btnText || 'Shop Collection'}
                <RiArrowRightLine className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/shop"
                className="hidden sm:inline-flex items-center rounded-full border border-white/30 px-5 py-2.5 md:px-6 md:py-3.5 text-sm md:text-base font-semibold text-white hover:bg-white/10 transition-colors"
              >
                Browse All
              </Link>
            </motion.div>
          </motion.div>

          {/* Image */}
          <motion.div
            className="relative flex h-full min-h-0 items-center justify-center"
            variants={{
              hidden: { opacity: 0, scale: 0.92, x: 20 },
              show: { opacity: 1, scale: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } },
              exit: { opacity: 0, scale: 0.96, transition: { duration: 0.25 } },
            }}
          >
            <div className="absolute aspect-square h-[70%] max-h-[340px] rounded-full bg-white/15 blur-2xl" />
            <div className="absolute aspect-square h-[78%] max-h-[380px] rounded-full border border-white/15" />
            {active.image && (
              <img
                src={active.image}
                alt={active.title}
                className="relative z-10 max-h-[150px] sm:max-h-[190px] md:max-h-[380px] max-w-full object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.35)]"
              />
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      {total > 1 && (
        <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-between gap-4 px-6 pb-4 sm:px-10 md:px-14 lg:px-16 md:pb-7">
          <div className="flex items-center gap-2">
            {slides.map((slide, idx) => (
              <button
                key={`dot-${slide.id ?? idx}`}
                type="button"
                onClick={() => goTo(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                aria-current={idx === currentSlide}
                className={`relative h-1.5 overflow-hidden rounded-full bg-white/30 transition-all duration-300 cursor-pointer ${
                  idx === currentSlide ? 'w-10' : 'w-4 hover:bg-white/50'
                }`}
              >
                {idx === currentSlide && (
                  <span
                    key={`p-${currentSlide}-${paused}`}
                    className={`absolute inset-0 rounded-full bg-white ${paused ? '' : 'animate-hero-progress'}`}
                  />
                )}
              </button>
            ))}
          </div>

          <span className="hidden md:block text-xs font-semibold tabular-nums tracking-wider text-white/70">
            {String(currentSlide + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
        </div>
      )}
    </section>
  );
};

export default Hero;
