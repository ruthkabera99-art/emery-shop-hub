import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, MapPin, Phone } from "lucide-react";

const Contact = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Message Sent!", description: "We'll get back to you soon." });
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-display text-4xl font-bold mb-8 text-center">Get in Touch</h1>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <p className="text-muted-foreground mb-8">Have a question or feedback? We'd love to hear from you.</p>
              <div className="space-y-4">
                <div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-accent" /><span>123 Style Ave, New York, NY 10001</span></div>
                <div className="flex items-center gap-3"><Phone className="h-5 w-5 text-accent" /><span>(555) 123-4567</span></div>
                <div className="flex items-center gap-3"><Mail className="h-5 w-5 text-accent" /><span>hello@emerycollection.com</span></div>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input placeholder="Your Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input type="email" placeholder="Your Email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Textarea placeholder="Your Message" required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90 w-full">Send Message</Button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
