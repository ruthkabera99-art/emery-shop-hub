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
      <div className="container mx-auto px-4 lg:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-10">
          <div>
            <h3 className="font-display text-lg font-bold mb-4">{footer.brandName.includes("EMERY") ? <>EMERY <span className="text-gradient-warm">COLLECTION</span></> : footer.brandName}</h3>
            <p className="text-sm opacity-70 leading-relaxed">{footer.brandTagline}</p>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold mb-4 uppercase tracking-wider">Quick Links</h4>
            <div className="flex flex-col gap-2">
              {footer.quickLinks.map((l) => (
                <Link key={l.label} to={l.url} className="text-sm opacity-70 hover:opacity-100 transition-opacity">{l.label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold mb-4 uppercase tracking-wider">Categories</h4>
            <div className="flex flex-col gap-2">
              {footer.categories.map((c) => (
                <Link key={c.label} to={c.url} className="text-sm opacity-70 hover:opacity-100 transition-opacity">{c.label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold mb-4 uppercase tracking-wider">Contact</h4>
            <div className="flex flex-col gap-3 text-sm opacity-70">
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {footer.contactAddress}</div>
              <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> {footer.contactPhone}</div>
              <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> {footer.contactEmail}</div>
            </div>
          </div>
        </div>
        <div className="border-t border-primary-foreground/10 mt-12 pt-8 text-center text-sm opacity-50">
          {footer.copyrightText}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
