import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  RiArrowLeftLine, 
  RiCalendarLine, 
  RiTimeLine, 
  RiUser3Line, 
  RiShareLine, 
  RiFileCopyLine,
  RiWhatsappFill,
  RiTwitterXFill,
  RiCheckLine,
  RiPriceTag3Line,
  RiArrowRightLine
} from 'react-icons/ri';
import { useApp } from '../context/AppContext';
import { DEFAULT_BLOGS } from '../data/defaultBlogs';

const BlogDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { triggerToast } = useApp();

  const [blog, setBlog] = useState(() => {
    // Immediate fallback search
    try {
      const cached = localStorage.getItem('cached_blogs');
      const list = cached ? JSON.parse(cached) : DEFAULT_BLOGS;
      if (Array.isArray(list)) {
        return list.find((b) => String(b.id) === String(id) || String(b.slug) === String(id)) || null;
      }
    } catch (_) {}
    return null;
  });
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchArticle() {
      try {
        setError(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        const res = await fetch(`/api/blogs/${encodeURIComponent(id)}`, { credentials: 'include' });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const text = await res.text();
        if (!text || !text.trim()) {
          throw new Error('Empty response');
        }
        let data;
        try {
          data = JSON.parse(text);
        } catch (_) {
          throw new Error('Invalid JSON');
        }

        if (data.success && data.blog && isMounted) {
          setBlog(data.blog);

          // Fetch all blogs to get related articles in the same category
          try {
            const allRes = await fetch('/api/blogs', { credentials: 'include' });
            if (allRes.ok) {
              const allText = await allRes.text();
              const allData = JSON.parse(allText);
              if (allData.success && allData.blogs && isMounted) {
                const others = allData.blogs
                  .filter((b) => b.id !== data.blog.id)
                  .slice(0, 3);
                setRelatedBlogs(others);
              }
            }
          } catch (_) {}
        } else if (isMounted) {
          // Check cached / default blogs fallback
          const fallbackList = (() => {
            try {
              const cached = localStorage.getItem('cached_blogs');
              if (cached) {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
              }
            } catch (_) {}
            return DEFAULT_BLOGS;
          })();

          const found = fallbackList.find((b) => String(b.id) === String(id) || String(b.slug) === String(id));
          if (found) {
            setBlog(found);
            const others = fallbackList.filter((b) => b.id !== found.id).slice(0, 3);
            setRelatedBlogs(others);
            setLoading(false);
            return;
          }
          setError(data?.message || 'Article not found');
        }
      } catch (err) {
        if (isMounted) {
          const fallbackList = (() => {
            try {
              const cached = localStorage.getItem('cached_blogs');
              if (cached) {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
              }
            } catch (_) {}
            return DEFAULT_BLOGS;
          })();

          const found = fallbackList.find((b) => String(b.id) === String(id) || String(b.slug) === String(id));
          if (found) {
            setBlog(found);
            const others = fallbackList.filter((b) => b.id !== found.id).slice(0, 3);
            setRelatedBlogs(others);
            setLoading(false);
            return;
          }
          setError(err.message || 'Failed to load article');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (id) {
      fetchArticle();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    triggerToast('Article link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`${blog?.title || 'Check out this article'} - ${window.location.href}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`${blog?.title || 'Check out this article'}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  // Content formatter: splits into paragraphs and formats headers
  const renderFormattedContent = (content) => {
    if (!content) return null;
    const blocks = content.split(/\n\s*\n/);

    return blocks.map((block, idx) => {
      const trimmed = block.trim();

      // Heading 3: ### Heading
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-8 mb-3 tracking-tight">
            {trimmed.replace(/^###\s+/, '')}
          </h3>
        );
      }

      // Heading 2: ## Heading
      if (trimmed.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-10 mb-4 tracking-tight">
            {trimmed.replace(/^##\s+/, '')}
          </h2>
        );
      }

      // Bullet lists
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const items = trimmed.split('\n').filter(Boolean);
        return (
          <ul key={idx} className="my-4 space-y-2 list-disc list-inside text-slate-700 dark:text-slate-300">
            {items.map((it, i) => (
              <li key={i} className="text-sm sm:text-base leading-relaxed">
                {it.replace(/^[-*]\s+/, '')}
              </li>
            ))}
          </ul>
        );
      }

      // Blockquotes
      if (trimmed.startsWith('> ')) {
        return (
          <blockquote key={idx} className="my-6 pl-4 border-l-4 border-primary-500 italic text-slate-600 dark:text-slate-400 text-base sm:text-lg">
            {trimmed.replace(/^>\s+/, '')}
          </blockquote>
        );
      }

      // Standard Paragraph
      return (
        <p key={idx} className="text-sm sm:text-base lg:text-lg text-slate-700 dark:text-slate-300 leading-relaxed sm:leading-loose mb-6 font-normal">
          {trimmed}
        </p>
      );
    });
  };

  // Tags array
  const tagsList = blog?.tags ? blog.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center py-24">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-semibold text-slate-500">Loading story...</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4 py-24">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center shadow-lg">
          <h1 className="text-xl font-black text-slate-900 dark:text-white mb-2">Article Not Found</h1>
          <p className="text-xs sm:text-sm text-slate-500 mb-6">{error || 'This article may have been moved or removed.'}</p>
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary-600 text-white font-bold text-xs hover:bg-primary-700 transition"
          >
            <RiArrowLeftLine className="w-4 h-4" /> Back to Journal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 pb-20">
      
      {/* Top Header / Breadcrumbs */}
      <div className="border-b border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md sticky top-16 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link
            to="/blogs"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition"
          >
            <RiArrowLeftLine className="w-4 h-4" /> All Journal Articles
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              title="Copy Link"
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer text-xs flex items-center gap-1"
            >
              {copied ? <RiCheckLine className="w-3.5 h-3.5 text-emerald-500" /> : <RiFileCopyLine className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline font-semibold">{copied ? 'Copied' : 'Share'}</span>
            </button>
            <button
              onClick={handleShareWhatsApp}
              title="Share on WhatsApp"
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition cursor-pointer"
            >
              <RiWhatsappFill className="w-4 h-4" />
            </button>
            <button
              onClick={handleShareTwitter}
              title="Share on Twitter"
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <RiTwitterXFill className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Reading Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14">
        
        {/* Meta badges & Category */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
            {blog.category || 'General'}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <RiTimeLine className="w-3.5 h-3.5" />
            {blog.read_time || '5 min read'}
          </span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <RiCalendarLine className="w-3.5 h-3.5" />
            {new Date(blog.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        {/* Article Title */}
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-950 dark:text-white leading-tight mb-6">
          {blog.title}
        </h1>

        {/* Excerpt Lead Paragraph */}
        {blog.excerpt && (
          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-8 border-l-4 border-slate-900 dark:border-white pl-4">
            {blog.excerpt}
          </p>
        )}

        {/* Author Card */}
        <div className="flex items-center justify-between py-4 border-y border-slate-200/80 dark:border-slate-800 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black text-sm flex items-center justify-center shadow-xs">
              {(blog.author || 'A').charAt(0)}
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                {blog.author || 'AeroStore Editorial'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Author & Contributor • Dubai Vanta
              </p>
            </div>
          </div>

          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            <RiShareLine className="w-3.5 h-3.5" /> Share
          </button>
        </div>

        {/* Cover Image */}
        {blog.image && (
          <div className="mb-12 rounded-3xl overflow-hidden bg-slate-900 shadow-xl border border-slate-200/60 dark:border-slate-800">
            <img
              src={blog.image}
              alt={blog.title}
              className="w-full max-h-[480px] object-cover"
            />
          </div>
        )}

        {/* Formatted Content Body */}
        <div className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200">
          {renderFormattedContent(blog.content)}
        </div>

        {/* Tags Section */}
        {tagsList.length > 0 && (
          <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <RiPriceTag3Line className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Related Tags</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {tagsList.map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Author Bio Footer Box */}
        <div className="mt-12 rounded-3xl p-6 sm:p-8 bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shrink-0 shadow-md">
            {(blog.author || 'A').charAt(0)}
          </div>
          <div className="text-center sm:text-left">
            <p className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Published by {blog.author || 'AeroStore Editorial'}
            </p>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal mb-3">
              Curating luxury essentials, state-of-the-art acoustic innovations, and modern lifestyle aesthetics from the heart of Dubai.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline"
            >
              Explore our curated products <RiArrowRightLine className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Related Articles Section */}
        {relatedBlogs.length > 0 && (
          <div className="mt-16 pt-12 border-t border-slate-200 dark:border-slate-800">
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white mb-6">
              More Stories from the Journal
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedBlogs.map((item) => (
                <Link
                  key={item.id}
                  to={`/blog/${item.slug || item.id}`}
                  className="group block rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 hover:shadow-md transition"
                >
                  <div className="h-32 rounded-xl overflow-hidden bg-slate-900 mb-3">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <span className="text-[10px] font-black uppercase text-primary-600 dark:text-primary-400">
                    {item.category}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition line-clamp-2 mt-1 mb-2">
                    {item.title}
                  </h3>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 font-semibold">
                    <RiTimeLine className="w-3 h-3" /> {item.read_time || '5 min read'}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>

    </article>
  );
};

export default BlogDetails;
