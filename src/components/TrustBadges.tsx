import { Shield, Truck, RotateCcw, CreditCard } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { icon: Truck, title: "Free Shipping", desc: "On orders over $100" },
  { icon: Shield, title: "Secure Payment", desc: "256-bit SSL encryption" },
  { icon: RotateCcw, title: "Easy Returns", desc: "30-day return policy" },
  { icon: CreditCard, title: "Flexible Payment", desc: "Multiple payment options" },
];

const TrustBadges = () => (
  <section className="py-8 sm:py-14 -mt-8 sm:-mt-12 relative z-10">
    <div className="container mx-auto px-4 lg:px-8">
      <div className="glass-card rounded-2xl p-6 sm:p-8 shadow-elevated">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3 sm:gap-4"
            >
              <div className="p-2.5 sm:p-3 rounded-2xl bg-accent/10 shrink-0">
                <f.icon className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
              </div>
              <div>
                <p className="font-semibold text-xs sm:text-sm">{f.title}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default TrustBadges;
