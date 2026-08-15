import { useEffect } from "react";

interface JsonLdProps {
  id: string;
  data: Record<string, unknown> | Record<string, unknown>[];
}

/** Injects a JSON-LD structured data script into <head> for the lifetime of the component. */
const JsonLd = ({ id, data }: JsonLdProps) => {
  useEffect(() => {
    const elId = `jsonld-${id}`;
    let el = document.getElementById(elId) as HTMLScriptElement | null;
    if (!el) {
      el = document.createElement("script");
      el.type = "application/ld+json";
      el.id = elId;
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);

    return () => {
      document.getElementById(elId)?.remove();
    };
  }, [id, data]);

  return null;
};

export default JsonLd;
