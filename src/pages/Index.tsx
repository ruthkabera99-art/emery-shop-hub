import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import TrustBadges from "@/components/TrustBadges";
import CategoryGrid from "@/components/CategoryGrid";
import FeaturedProducts from "@/components/FeaturedProducts";
import Testimonials from "@/components/Testimonials";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";

const Index = () => (
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
  </div>
);

export default Index;
