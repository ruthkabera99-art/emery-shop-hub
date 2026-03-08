import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ThemeConfig {
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  fontHeading: string;
  fontBody: string;
  borderRadius: string;
}

export interface FooterConfig {
  brandName: string;
  brandTagline: string;
  quickLinks: { label: string; url: string }[];
  categories: { label: string; url: string }[];
  contactAddress: string;
  contactPhone: string;
  contactEmail: string;
  copyrightText: string;
}

export interface MenuConfig {
  items: { label: string; url: string; visible: boolean }[];
}

export interface HomepageSection {
  id: string;
  label: string;
  visible: boolean;
  order: number;
}

export interface HomepageConfig {
  sections: HomepageSection[];
}

export const defaultThemeConfig: ThemeConfig = {
  primaryColor: "30 10% 15%",
  accentColor: "38 60% 55%",
  backgroundColor: "36 33% 97%",
  fontHeading: "Playfair Display",
  fontBody: "DM Sans",
  borderRadius: "0.5rem",
};

export const defaultFooterConfig: FooterConfig = {
  brandName: "EMERY COLLECTION",
  brandTagline: "Premium footwear for every occasion. Crafted with care, designed for comfort.",
  quickLinks: [
    { label: "Home", url: "/" },
    { label: "Shop", url: "/shop" },
    { label: "About Us", url: "/about" },
    { label: "Contact", url: "/contact" },
  ],
  categories: [
    { label: "Men's", url: "/shop" },
    { label: "Women's", url: "/shop" },
    { label: "Kids", url: "/shop" },
    { label: "Sports", url: "/shop" },
    { label: "Sale", url: "/shop" },
  ],
  contactAddress: "123 Style Ave, New York, NY",
  contactPhone: "(555) 123-4567",
  contactEmail: "hello@emerycollection.com",
  copyrightText: "© 2026 Emery Collection Shop. All rights reserved.",
};

export const defaultMenuConfig: MenuConfig = {
  items: [
    { label: "Home", url: "/", visible: true },
    { label: "Shop", url: "/shop", visible: true },
    { label: "Categories", url: "/shop", visible: true },
    { label: "About Us", url: "/about", visible: true },
    { label: "Contact", url: "/contact", visible: true },
  ],
};

export const defaultHomepageConfig: HomepageConfig = {
  sections: [
    { id: "hero", label: "Hero Banner", visible: true, order: 0 },
    { id: "trust", label: "Trust Badges", visible: true, order: 1 },
    { id: "categories", label: "Category Grid", visible: true, order: 2 },
    { id: "featured", label: "Featured Collection", visible: true, order: 3 },
    { id: "arrivals", label: "New Arrivals", visible: true, order: 4 },
    { id: "testimonials", label: "Testimonials", visible: true, order: 5 },
    { id: "newsletter", label: "Newsletter", visible: true, order: 6 },
  ],
};

async function loadSetting<T>(key: string, fallback: T): Promise<T> {
  const { data } = await supabase
    .from("store_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  if (data?.value) {
    try {
      return JSON.parse(data.value) as T;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

async function saveSetting(key: string, value: unknown) {
  await supabase.from("store_settings").upsert(
    { key, value: JSON.stringify(value), updated_at: new Date().toISOString() },
    { onConflict: "key" }
  );
}

export function useSiteSettings() {
  const [theme, setTheme] = useState<ThemeConfig>(defaultThemeConfig);
  const [footer, setFooter] = useState<FooterConfig>(defaultFooterConfig);
  const [menu, setMenu] = useState<MenuConfig>(defaultMenuConfig);
  const [homepage, setHomepage] = useState<HomepageConfig>(defaultHomepageConfig);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      loadSetting("theme_config", defaultThemeConfig),
      loadSetting("footer_config", defaultFooterConfig),
      loadSetting("menu_config", defaultMenuConfig),
      loadSetting("homepage_config", defaultHomepageConfig),
    ]).then(([t, f, m, h]) => {
      setTheme(t);
      setFooter(f);
      setMenu(m);
      setHomepage(h);
      setLoaded(true);
    });
  }, []);

  return { theme, footer, menu, homepage, loaded };
}

export function useAdminTheme() {
  const [config, setConfig] = useState<ThemeConfig>(defaultThemeConfig);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSetting("theme_config", defaultThemeConfig).then((c) => {
      setConfig(c);
      setLoading(false);
    });
  }, []);

  const save = async (c: ThemeConfig) => {
    await saveSetting("theme_config", c);
    setConfig(c);
  };

  return { config, setConfig, loading, save };
}

export function useAdminFooter() {
  const [config, setConfig] = useState<FooterConfig>(defaultFooterConfig);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSetting("footer_config", defaultFooterConfig).then((c) => {
      setConfig(c);
      setLoading(false);
    });
  }, []);

  const save = async (c: FooterConfig) => {
    await saveSetting("footer_config", c);
    setConfig(c);
  };

  return { config, setConfig, loading, save };
}

export function useAdminMenu() {
  const [config, setConfig] = useState<MenuConfig>(defaultMenuConfig);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSetting("menu_config", defaultMenuConfig).then((c) => {
      setConfig(c);
      setLoading(false);
    });
  }, []);

  const save = async (c: MenuConfig) => {
    await saveSetting("menu_config", c);
    setConfig(c);
  };

  return { config, setConfig, loading, save };
}

export function useAdminHomepage() {
  const [config, setConfig] = useState<HomepageConfig>(defaultHomepageConfig);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSetting("homepage_config", defaultHomepageConfig).then((c) => {
      setConfig(c);
      setLoading(false);
    });
  }, []);

  const save = async (c: HomepageConfig) => {
    await saveSetting("homepage_config", c);
    setConfig(c);
  };

  return { config, setConfig, loading, save };
}
