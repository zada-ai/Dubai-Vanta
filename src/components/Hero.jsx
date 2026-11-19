import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const Hero = () => {
  const { heroSlides } = useApp();
  const slides = heroSlides && heroSlides.length > 0 ? heroSlides : [
    {
      id: 1,
      title: 'AeroSound Max',
      subtitle: 'THE FUTURE OF ACOUSTICS',
      description: 'Experience pure acoustic bliss with active noise cancellation and up to 40 hours of battery life.',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      link: '/product/1',
      btnText: 'Shop Collection',
      bgColor: 'from-violet-600 to-indigo-900',
      textColor: 'text-white'
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (currentSlide >= slides.length) {
      setCurrentSlide(0);
    }
  }, [slides.length, currentSlide]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Touch swipe support for mobile
  const touchStartX = useRef(null);

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
    <div
      className="relative w-full h-[480px] md:h-[520px] rounded-2xl md:rounded-3xl overflow-hidden shadow-lg md:mb-8"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides Container */}
      <div className="relative w-full h-full">
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 w-full h-full flex flex-col md:flex-row items-center justify-between px-6 pt-7 pb-12 md:p-16 bg-gradient-to-br ${slide.bgColor || 'from-violet-600 to-indigo-900'} transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Slide Info */}
            <div className="w-full md:w-1/2 shrink-0 flex flex-col items-start text-left z-20">
              {slide.subtitle && (
                <span className="text-[11px] md:text-sm font-bold tracking-widest text-primary-200 uppercase mb-1.5 md:mb-2">
                  {slide.subtitle}
                </span>
              )}
              <h2 className="text-[26px] sm:text-[28px] md:text-5xl lg:text-6xl font-black leading-tight text-white mb-2 md:mb-4">
                {slide.title}
              </h2>
              <p className="text-[12px] sm:text-[13px] md:text-base text-slate-200 max-w-md mb-3 md:mb-8 font-medium leading-relaxed line-clamp-2 md:line-clamp-none">
                {slide.description}
              </p>
              {/* Desktop Button */}
              <div className="hidden md:block">
                <Link
                  to={slide.link || '/shop'}
                  className="px-6 py-2.5 md:px-8 md:py-3.5 text-sm md:text-base rounded-full bg-white text-slate-900 font-bold hover:bg-primary-100 shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer inline-block"
                >
                  {slide.btnText || 'Shop Collection'}
                </Link>
              </div>
            </div>

            {/* Slide Image + Mobile Button (Image placed ABOVE button on mobile) */}
            <div className="w-full md:w-1/2 flex-1 min-h-0 md:flex-none md:h-full flex flex-col items-center justify-center relative mt-2 md:mt-0">
              <div className="relative flex items-center justify-center w-full max-h-[170px] sm:max-h-[220px] md:max-h-none flex-1">
                <div className="absolute inset-0 bg-white/10 rounded-full filter blur-3xl" />
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="relative z-10 max-h-[150px] sm:max-h-[200px] md:max-h-[380px] max-w-full object-contain drop-shadow-2xl transform hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Mobile Button: Placed directly below image on mobile */}
              <div className="md:hidden mt-3 z-20">
                <Link
                  to={slide.link || '/shop'}
                  className="px-6 py-2 text-xs sm:text-sm rounded-full bg-white text-slate-900 font-bold hover:bg-primary-100 shadow-md transition-all duration-200 cursor-pointer inline-block"
                >
                  {slide.btnText || 'Shop Collection'}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Slider Indicator Dots (Arrows removed as requested) */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 md:bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentSlide ? 'bg-white w-6' : 'bg-white/40 w-2'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Hero;
