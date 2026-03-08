import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ThemeConfig, defaultThemeConfig } from "@/hooks/useSiteSettings";

function applyTheme(config: ThemeConfig) {
  const root = document.documentElement;
  root.style.setProperty("--primary", config.primaryColor);
  root.style.setProperty("--foreground", config.primaryColor);
  root.style.setProperty("--card-foreground", config.primaryColor);
  root.style.setProperty("--popover-foreground", config.primaryColor);
  root.style.setProperty("--primary-foreground", config.backgroundColor);
  root.style.setProperty("--background", config.backgroundColor);
  root.style.setProperty("--accent", config.accentColor);
  root.style.setProperty("--ring", config.accentColor);
  root.style.setProperty("--radius", config.borderRadius);
  root.style.fontFamily = `'${config.fontBody}', sans-serif`;

  // Update heading font via a style tag
  let style = document.getElementById("theme-font-style");
  if (!style) {
    style = document.createElement("style");
    style.id = "theme-font-style";
    document.head.appendChild(style);
  }
  style.textContent = `
    h1, h2, h3, h4 { font-family: '${config.fontHeading}', serif !important; }
    body { font-family: '${config.fontBody}', sans-serif !important; }
  `;

  // Load Google Fonts dynamically
  const fonts = [config.fontHeading, config.fontBody].filter(Boolean);
  fonts.forEach((font) => {
    const id = `gfont-${font.replace(/\s+/g, "-")}`;
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}:wght@300;400;500;600;700&display=swap`;
      document.head.appendChild(link);
    }
  });
}

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Load initial theme
    supabase
      .from("store_settings")
      .select("value")
      .eq("key", "theme_config")
      .maybeSingle()
      .then(({ data }) => {
        try {
          const config = data?.value ? JSON.parse(data.value) as ThemeConfig : defaultThemeConfig;
          applyTheme(config);
        } catch {
          applyTheme(defaultThemeConfig);
        }
        setLoaded(true);
      });

    // Subscribe to realtime changes
    const channel = supabase
      .channel("theme-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "store_settings", filter: "key=eq.theme_config" },
        (payload) => {
          try {
            const newValue = (payload.new as { value: string })?.value;
            if (newValue) {
              applyTheme(JSON.parse(newValue) as ThemeConfig);
            }
          } catch {
            // ignore parse errors
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return <>{children}</>;
};

export default ThemeProvider;
