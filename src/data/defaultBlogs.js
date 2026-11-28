/**
 * Default Blogs Data & Image Extraction Utilities
 * Initialized as empty so only authentic editorial / SEO blogs published from Admin are rendered.
 */
export const DEFAULT_BLOGS = [];

/**
 * Intelligent helper to extract the primary/featured image for blog cards & thumbnails:
 * 1. Checks blog.image (first URL if multiple are comma/newline separated)
 * 2. Scans blog.content for markdown image: ![alt](url)
 * 3. Scans blog.content for HTML <img> tag: <img src="url" />
 * 4. Scans blog.excerpt for images
 */
export function getBlogFirstImage(blog) {
  if (!blog) return null;

  // 1. Direct cover image property
  if (blog.image && typeof blog.image === 'string' && blog.image.trim()) {
    const candidate = blog.image.split(/[\n,]/)[0].trim();
    if (candidate && !candidate.startsWith('data:image/svg+xml')) {
      return candidate;
    }
  }

  // 2. Scan content for markdown image: ![alt](url)
  if (blog.content && typeof blog.content === 'string') {
    const mdMatch = blog.content.match(/!\[.*?\]\((https?:\/\/[^\s\)]+|\/uploads\/[^\s\)]+)\)/i);
    if (mdMatch && mdMatch[1]) {
      return mdMatch[1];
    }

    // 3. Scan content for HTML <img> tag
    const htmlMatch = blog.content.match(/<img[^>]+src=["'](https?:\/\/[^"']+|\/uploads\/[^"']+)["']/i);
    if (htmlMatch && htmlMatch[1]) {
      return htmlMatch[1];
    }
  }

  // 4. Check excerpt for markdown image
  if (blog.excerpt && typeof blog.excerpt === 'string') {
    const mdMatch = blog.excerpt.match(/!\[.*?\]\((https?:\/\/[^\s\)]+|\/uploads\/[^\s\)]+)\)/i);
    if (mdMatch && mdMatch[1]) {
      return mdMatch[1];
    }
  }

  return null;
}
