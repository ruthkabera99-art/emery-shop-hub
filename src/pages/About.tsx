import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { AboutConfig, ABOUT_KEY, defaultAboutConfig } from "@/lib/aboutConfig";
import { Mail, MapPin, Phone } from "lucide-react";

const About = () => {
  const { footer } = useSiteSettings();
  const [about, setAbout] = useState<AboutConfig>(defaultAboutConfig);

  useEffect(() => {
    supabase.from("store_settings").select("value").eq("key", ABOUT_KEY).maybeSingle().then(({ data }) => {
      if (data?.value) {
        try { setAbout({ ...defaultAboutConfig, ...JSON.parse(data.value) }); } catch { /* defaults */ }
      }
    });
  }, []);

  return (
    <div className="min-h-screen">
      <SEOHead title={`${about.title} | Our Story`} description="Learn about Emery Collection — our story, our team and how to reach us." canonical="https://emerycollectionshop.store/about" />
      <Navbar />
      <main className="container mx-auto px-4 lg:px-8 py-16 space-y-16">
        <section className="max-w-3xl mx-auto text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">{about.title}</h1>
          {about.imageUrl && <img src={about.imageUrl} alt={about.title} className="w-full rounded-lg mb-8 object-cover max-h-[420px]" loading="lazy" />}
          {about.story ? (
            about.story.split(/\n\s*\n/).map((p, i) => (
              <p key={i} className="text-muted-foreground text-lg leading-relaxed mb-4 whitespace-pre-line">{p}</p>
            ))
          ) : (
            <p className="text-muted-foreground text-lg">Our story is coming soon.</p>
          )}
        </section>

        {about.team.length > 0 && (
          <section>
            <h2 className="font-display text-3xl font-bold text-center mb-8">Meet the team</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {about.team.map((m) => (
                <div key={m.name} className="bg-card rounded-lg p-6 shadow-soft text-center">
                  {m.photoUrl && <img src={m.photoUrl} alt={m.name} className="w-28 h-28 rounded-full object-cover mx-auto mb-4" loading="lazy" />}
                  <p className="font-display text-xl font-semibold">{m.name}</p>
                  <p className="text-sm text-primary">{m.role}</p>
                  {m.bio && <p className="text-sm text-muted-foreground mt-2">{m.bio}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {about.showContact && (
          <section className="max-w-3xl mx-auto bg-card rounded-lg p-8 shadow-soft">
            <h2 className="font-display text-2xl font-bold mb-4 text-center">Get in touch</h2>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              {footer.contactAddress && <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" />{footer.contactAddress}</p>}
              {footer.contactPhone && <a href={`tel:${footer.contactPhone}`} className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary" />{footer.contactPhone}</a>}
              {footer.contactEmail && <a href={`mailto:${footer.contactEmail}`} className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary" />{footer.contactEmail}</a>}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default About;
