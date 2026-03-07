import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import TrustBadges from "@/components/TrustBadges";
import CategoryGrid from "@/components/CategoryGrid";
import FeaturedProducts from "@/components/FeaturedProducts";
import Testimonials from "@/components/Testimonials";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import LiveChat from "@/components/LiveChat";
import { useVisitorTracker } from "@/hooks/useVisitorTracker";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useMemo } from "react";

const sectionComponents: Record<string, React.ReactNode> = {};

const Index = () => {
  useVisitorTracker();
  const { homepage, loaded } = useSiteSettings();

  const sections = useMemo(() => {
    if (!loaded) return null;
    const sorted = [...homepage.sections].sort((a, b) => a.order - b.order);
    return sorted.filter((s) => s.visible).map((s) => {
      switch (s.id) {
        case "hero": return <HeroBanner key={s.id} />;
        case "trust": return <TrustBadges key={s.id} />;
        case "categories": return <CategoryGrid key={s.id} />;
        case "featured": return <FeaturedProducts key={s.id} title="Featured Collection" filter={(p) => !!p.badge} />;
        case "arrivals": return <FeaturedProducts key={s.id} title="New Arrivals" filter={(p) => p.badge === "New"} />;
        case "testimonials": return <Testimonials key={s.id} />;
        case "newsletter": return <Newsletter key={s.id} />;
        default: return null;
      }
    });
  }, [homepage, loaded]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        {!loaded ? (
          <>
            <HeroBanner />
            <TrustBadges />
            <CategoryGrid />
            <FeaturedProducts title="Featured Collection" filter={(p) => !!p.badge} />
            <FeaturedProducts title="New Arrivals" filter={(p) => p.badge === "New"} />
            <Testimonials />
            <Newsletter />
          </>
        ) : (
          sections
        )}
      </main>
      <Footer />
      <LiveChat />
    </div>
  );
};

export default Index;
