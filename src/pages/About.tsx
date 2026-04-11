import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

const About = () => (
  <div className="min-h-screen">
    <SEOHead title="About Emery Collection | Our Story" description="Learn about Emery Collection — our passion for premium footwear, exceptional craftsmanship, and commitment to quality since day one." canonical="https://emerycollectionshop.store/about" />
    <Navbar />
    <main className="container mx-auto px-4 lg:px-8 py-16">
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">About Emery Collection</h1>
        <p className="text-muted-foreground text-lg leading-relaxed mb-8">
          Founded with a passion for exceptional footwear, Emery Collection brings together premium materials, timeless designs, and modern comfort. Every pair tells a story of craftsmanship and dedication to quality.
        </p>
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {[
            { num: "10K+", label: "Happy Customers" },
            { num: "500+", label: "Styles Available" },
            { num: "50+", label: "Countries Shipped" },
          ].map((s) => (
            <div key={s.label} className="bg-card rounded-lg p-6 shadow-soft">
              <p className="font-display text-3xl font-bold text-gradient-warm">{s.num}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default About;
