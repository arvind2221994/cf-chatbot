import { useEffect } from 'react';

/**
 * A reusable Helmet component to dynamically update the document head elements
 * like title, favicon, and meta description from any route or component.
 * 
 * @param {Object} props
 * @param {string} props.title - Custom page title
 * @param {string} props.favicon - URL path to the custom favicon image
 * @param {string} props.description - Custom meta description content
 */
function Helmet({ title, favicon, description }) {
  useEffect(() => {
    // 1. Update Title
    if (title) {
      document.title = title;
    }

    // 2. Update Favicon
    if (favicon) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = favicon;
    }

    // 3. Update Meta Description
    if (description) {
      let meta = document.querySelector("meta[name='description']");
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.head.appendChild(meta);
      }
      meta.content = description;
    }
  }, [title, favicon, description]);

  // This component doesn't render any visible UI
  return null;
}

export default Helmet;
