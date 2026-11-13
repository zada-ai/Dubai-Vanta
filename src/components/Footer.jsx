import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, MotionConfig } from 'framer-motion';
import { useApp } from '../context/AppContext';
import {
  RiGithubFill,
  RiTwitterFill,
  RiLinkedinBoxFill,
  RiMailSendLine,
  RiArrowRightSLine,
  RiArrowUpLine
} from 'react-icons/ri';

const MotionLink = motion.create(Link);

const companyLinks = [
  { label: 'About Us', to: '/about' },
  { label: 'Shop All', to: '/shop' },
  { label: 'Contact', to: '/contact' },
  { label: 'FAQs', to: '/faq' }
];

const categoryLinks = [
  { label: 'Electronics', to: '/shop?category=electronics' },
  { label: 'Fashion', to: '/shop?category=fashion' },
  { label: 'Home & Living', to: '/shop?category=home-decor' },
  { label: 'Wellness', to: '/shop?category=wellness' }
];

const socials = [
  { label: 'Twitter', href: 'https://twitter.com', Icon: RiTwitterFill },
  { label: 'LinkedIn', href: 'https://linkedin.com', Icon: RiLinkedinBoxFill },
  { label: 'GitHub', href: 'https://github.com', Icon: RiGithubFill }
];

// Columns reveal one after another when the footer scrolls into view
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } }
};

const column = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.06, delayChildren: 0.15 }
  }
};

const item = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

const pop = {
  hidden: { opacity: 0, scale: 0.4 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 380, damping: 16 } }
};

const FooterLink = ({ to, label }) => (
  <motion.li variants={item}>
    <MotionLink
      to={to}
      initial="rest"
      whileHover="hover"
      whileTap="hover"
      animate="rest"
      className="group relative inline-flex items-center py-0.5 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
    >
      <motion.span
        variants={{ rest: { width: 0, opacity: 0 }, hover: { width: 16, opacity: 1 } }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="inline-flex overflow-hidden text-primary-500"
      >
        <RiArrowRightSLine className="w-4 h-4 shrink-0" />
      </motion.span>
      <span className="relative">
        {label}
        <span className="absolute left-0 -bottom-0.5 h-0.5 w-full origin-left scale-x-0 rounded-full bg-primary-500 transition-transform duration-300 ease-out group-hover:scale-x-100" />
      </span>
    </MotionLink>
  </motion.li>
);

const ColumnTitle = ({ children }) => (
  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">
    {children}
  </h4>
);

const Footer = () => {
  const { triggerToast, storeLogo } = useApp();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      triggerToast('Thank you for subscribing to our newsletter!', 'success');
      setEmail('');
      setSent(true);
      setTimeout(() => setSent(false), 900);
    }
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <MotionConfig reducedMotion="user">
      <footer className="relative w-full overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-200 mt-auto">
        {/* Animated gradient top border */}
        <motion.div
          aria-hidden="true"
          className="absolute top-0 inset-x-0 h-0.5"
          style={{
            backgroundImage: 'linear-gradient(90deg, #7c3aed, #6366f1, #ec4899, #f59e0b, #7c3aed)',
            backgroundSize: '200% 100%'
          }}
          animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }}
          transition={{ duration: 6, ease: 'linear', repeat: Infinity }}
        />

        {/* Floating glow blobs */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-primary-500/15 dark:bg-primary-600/20 blur-3xl"
          animate={{ x: [0, 60, 0], y: [0, 30, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 14, ease: 'easeInOut', repeat: Infinity }}
        />
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -right-20 w-80 h-80 rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 blur-3xl"
          animate={{ x: [0, -50, 0], y: [0, -40, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 18, ease: 'easeInOut', repeat: Infinity }}
        />

        {/* Upper footer */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            className="grid grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-10 lg:gap-8"
          >
            {/* Brand Info */}
            <motion.div variants={column} className="col-span-2 flex flex-col items-start text-left">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="mb-4">
                <Link to="/" className="flex items-center">
                  {storeLogo ? (
                    <img
                      src={storeLogo}
                      alt="Store Logo"
                      className="h-8 max-h-8 w-auto max-w-[160px] object-contain"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <motion.span
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6, ease: 'easeInOut' }}
                        className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center font-black text-white dark:text-slate-950 text-base"
                      >
                        A
                      </motion.span>
                      <span className="text-lg font-black tracking-wider text-slate-900 dark:text-white uppercase">
                        AEROSTORE
                      </span>
                    </div>
                  )}
                </Link>
              </motion.div>
              <motion.p
                variants={item}
                className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed"
              >
                We design and curate premium everyday essentials that seamlessly blend aesthetics and functionality. Upgrade your lifestyle with AEROSTORE.
              </motion.p>

              {/* Social Links */}
              <div className="flex gap-2.5">
                {socials.map(({ label, href, Icon }) => (
                  <motion.a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    variants={pop}
                    whileHover={{ y: -5, scale: 1.12, rotate: 8 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2.5 rounded-full border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-white hover:bg-primary-600 hover:border-primary-600 hover:shadow-lg hover:shadow-primary-500/30 transition-colors cursor-pointer"
                  >
                    <Icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Quick links */}
            <motion.div variants={column} className="flex flex-col items-start text-left">
              <ColumnTitle>Company</ColumnTitle>
              <ul className="flex flex-col gap-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300">
                {companyLinks.map((link) => (
                  <FooterLink key={link.label} {...link} />
                ))}
              </ul>
            </motion.div>

            {/* Categories */}
            <motion.div variants={column} className="flex flex-col items-start text-left">
              <ColumnTitle>Categories</ColumnTitle>
              <ul className="flex flex-col gap-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300">
                {categoryLinks.map((link) => (
                  <FooterLink key={link.label} {...link} />
                ))}
              </ul>
            </motion.div>

            {/* Newsletter */}
            <motion.div variants={column} className="col-span-2 lg:col-span-1 flex flex-col items-start text-left">
              <ColumnTitle>Newsletter</ColumnTitle>
              <motion.p
                variants={item}
                className="text-sm text-slate-500 dark:text-slate-400 mb-4 leading-relaxed"
              >
                Subscribe to receive updates, access to exclusive deals, and more.
              </motion.p>
              <motion.form variants={item} onSubmit={handleSubscribe} className="w-full max-w-sm">
                <div className="relative w-full">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-4 pr-12 py-2.5 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary-500 focus:shadow-lg focus:shadow-primary-500/20 transition-shadow duration-300 text-slate-800 dark:text-slate-100 placeholder-slate-400"
                  />
                  <motion.button
                    type="submit"
                    aria-label="Subscribe"
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.88 }}
                    className="absolute right-1.5 top-1.5 p-1.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-primary-600 dark:hover:bg-primary-500 dark:hover:text-white transition-colors cursor-pointer overflow-hidden"
                  >
                    {/* Paper plane flies off on submit */}
                    <motion.span
                      className="block"
                      animate={sent ? { x: [0, 22, -22, 0], y: [0, -22, 22, 0], opacity: [1, 0, 0, 1] } : { x: 0, y: 0, opacity: 1 }}
                      transition={{ duration: 0.7, times: [0, 0.4, 0.45, 1], ease: 'easeInOut' }}
                    >
                      <RiMailSendLine className="w-4 h-4" />
                    </motion.span>
                  </motion.button>
                </div>
              </motion.form>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950/50 py-6 transition-colors duration-200"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              &copy; {new Date().getFullYear()} AEROSTORE. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 dark:text-slate-500">
              <Link to="/faq" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Privacy Policy</Link>
              <span>•</span>
              <Link to="/faq" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Terms of Service</Link>
              <motion.button
                type="button"
                onClick={scrollToTop}
                aria-label="Back to top"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="ml-1 p-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-primary-600 dark:hover:bg-primary-500 dark:hover:text-white shadow-md transition-colors cursor-pointer"
              >
                <motion.span
                  className="block"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 1.4, ease: 'easeInOut', repeat: Infinity }}
                >
                  <RiArrowUpLine className="w-4 h-4" />
                </motion.span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </footer>
    </MotionConfig>
  );
};

export default Footer;
