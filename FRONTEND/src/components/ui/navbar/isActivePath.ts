const normalize = (path: string) => path.toLowerCase().replace(/\/+$/, '') || '/';

// Home only matches exactly; every other entry also matches its child routes so a
// blog post keeps "Blogs" lit. Case-insensitive because hrefs mix "/Blogs" and "/blogs".
export const isActivePath = (pathname: string, href: string): boolean => {
  const current = normalize(pathname);
  const target = normalize(href);
  if (target === '/') return current === '/';
  return current === target || current.startsWith(`${target}/`);
};
