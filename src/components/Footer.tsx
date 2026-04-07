import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const Footer = () => {
  const { footer, loaded } = useSiteSettings();

  if (!loaded) {
    return (
      <footer className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 lg:px-8 py-10 sm:py-16" />
      </footer>
    );
  }

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 lg:px-8 py-12 sm:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12">
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-display text-xl font-bold mb-4">
              {footer.brandName.includes("EMERY") ? (
                <>EMERY <span className="text-gradient-warm">COLLECTION</span></>
              ) : (
                footer.brandName
              )}
            </h3>
            <p className="text-sm text-primary-foreground/50 leading-relaxed max-w-[280px]">{footer.brandTagline}</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold mb-5 uppercase tracking-[0.2em] text-primary-foreground/70">Quick Links</h4>
            <div className="flex flex-col gap-3">
              {footer.quickLinks.map((l) => (
                <Link key={l.label} to={l.url} className="text-sm text-primary-foreground/50 hover:text-accent transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold mb-5 uppercase tracking-[0.2em] text-primary-foreground/70">Categories</h4>
            <div className="flex flex-col gap-3">
              {footer.categories.map((c) => (
                <Link key={c.label} to={c.url} className="text-sm text-primary-foreground/50 hover:text-accent transition-colors">
                  {c.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold mb-5 uppercase tracking-[0.2em] text-primary-foreground/70">Contact</h4>
            <div className="flex flex-col gap-4 text-sm text-primary-foreground/50">
              <div className="flex items-start gap-3"><MapPin className="h-4 w-4 shrink-0 mt-0.5 text-accent/70" /> {footer.contactAddress}</div>
              <div className="flex items-center gap-3"><Phone className="h-4 w-4 shrink-0 text-accent/70" /> {footer.contactPhone}</div>
              <div className="flex items-center gap-3"><Mail className="h-4 w-4 shrink-0 text-accent/70" /> {footer.contactEmail}</div>
            </div>
          </div>
        </div>
        <div className="border-t border-primary-foreground/10 mt-14 pt-8 text-center text-xs text-primary-foreground/30">
          {footer.copyrightText}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
