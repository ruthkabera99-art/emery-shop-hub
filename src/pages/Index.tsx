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

const Index = () => {
  useVisitorTracker();
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroBanner />
        <TrustBadges />
        <CategoryGrid />
        <FeaturedProducts title="Featured Collection" filter={(p) => !!p.badge} />
        <FeaturedProducts title="New Arrivals" filter={(p) => p.badge === "New"} />
        <Testimonials />
        <Newsletter />
      </main>
      <Footer />
      <LiveChat />
    </div>
  );
};

export default Index;
