import { useEffect } from "react";

export const SITE_URL = "https://emerycollectionshop.store";
export const SITE_NAME = "Emery Collection Shop";
export const DEFAULT_OG_IMAGE =
  "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/6fb41999-0602-4c38-805d-d2257af39d65/id-preview-923f7b2d--16df33f3-2fad-493d-8bd2-fe16f2b95717.lovable.app-1771193583836.png";

/** Turn a relative path or absolute URL into an absolute https URL. */
export const absoluteUrl = (path?: string) => {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

interface SEOHeadProps {
  title: string;
  description: string;
  /** Absolute URL or path (e.g. "/shop"). Sets <link rel=canonical> and og:url. */
  canonical?: string;
  /** Previous page URL/path for rel="prev" (paginated lists). */
  prev?: string;
  /** Next page URL/path for rel="next" (paginated lists). */
  next?: string;
  type?: string;
  /** Absolute URL or path of the social preview image. */
  image?: string;
  imageAlt?: string;
  noindex?: boolean;
  /** Product-specific OpenGraph data. */
  product?: {
    price?: number;
    currency?: string;
    availability?: "in stock" | "out of stock";
    brand?: string;
    condition?: string;
  };
}

const setMeta = (name: string, content: string | undefined, property = false) => {
  const attr = property ? "property" : "name";
  const existing = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!content) {
    existing?.remove();
    return;
  }
  let el = existing;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.content = content;
};

const setLink = (rel: string, href?: string) => {
  const existing = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!href) {
    existing?.remove();
    return;
  }
  let el = existing;
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
};

const SEOHead = ({
  title,
  description,
  canonical,
  type = "website",
  image,
  imageAlt,
  noindex,
  product,
}: SEOHeadProps) => {
  const url = absoluteUrl(canonical);
  const img = absoluteUrl(image) || DEFAULT_OG_IMAGE;

  useEffect(() => {
    document.title = title;

    setMeta("description", description);
    setMeta("robots", noindex ? "noindex, follow" : "index, follow");

    // OpenGraph
    setMeta("og:site_name", SITE_NAME, true);
    setMeta("og:locale", "en_US", true);
    setMeta("og:title", title, true);
    setMeta("og:description", description, true);
    setMeta("og:type", type, true);
    setMeta("og:url", url, true);
    setMeta("og:image", img, true);
    setMeta("og:image:secure_url", img, true);
    setMeta("og:image:width", "1200", true);
    setMeta("og:image:height", "630", true);
    setMeta("og:image:alt", imageAlt || title, true);

    // Twitter
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    setMeta("twitter:image", img);
    setMeta("twitter:image:alt", imageAlt || title);

    // Product OG (used by Facebook/Pinterest rich product previews)
    setMeta("product:price:amount", product?.price?.toFixed(2), true);
    setMeta("product:price:currency", product ? product.currency || "EUR" : undefined, true);
    setMeta("product:availability", product?.availability, true);
    setMeta("product:brand", product?.brand, true);
    setMeta("product:condition", product ? product.condition || "new" : undefined, true);

    setLink("canonical", url);
  }, [title, description, url, type, img, imageAlt, noindex, product?.price, product?.currency, product?.availability, product?.brand, product?.condition]);

  return null;
};

export default SEOHead;
