import { Shield, Truck, RotateCcw, CreditCard } from "lucide-react";

const features = [
  { icon: Truck, title: "Free Shipping", desc: "On orders over $100" },
  { icon: Shield, title: "Secure Payment", desc: "256-bit SSL encryption" },
  { icon: RotateCcw, title: "Easy Returns", desc: "30-day return policy" },
  { icon: CreditCard, title: "Flexible Payment", desc: "Multiple payment options" },
];

const TrustBadges = () => (
  <section className="py-6 sm:py-12 border-y border-border">
    <div className="container mx-auto px-4 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {features.map((f) => (
          <div key={f.title} className="flex items-center gap-2 sm:gap-3 justify-center md:justify-start">
            <div className="p-1.5 sm:p-2 rounded-full bg-accent/10 shrink-0">
              <f.icon className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
            </div>
            <div>
              <p className="font-semibold text-xs sm:text-sm">{f.title}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TrustBadges;
