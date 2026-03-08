import { Link } from "react-router-dom";
import { Calendar, Users, QrCode, BarChart3, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-background" style={{ backgroundImage: "var(--gradient-hero)" }}>
      {/* Nav */}
      <nav className="border-b border-border/50 glass sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">ADC Events</span>
          </div>
          <Link to="/login">
            <Button variant="outline" size="sm" className="glow-border">
              Login
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="animate-in max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary mb-8">
            <Zap className="h-3.5 w-3.5" />
            Aliet Techpreneur Club
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Events that
            <span className="text-gradient"> inspire.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
            Seamless event management — from registration to attendance tracking.
            Built for ADC, powered by technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" className="animate-pulse-glow">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 pb-24">
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            {
              icon: Calendar,
              title: "Event Management",
              desc: "Create, configure, and manage events with custom registration forms and unique shareable links.",
            },
            {
              icon: QrCode,
              title: "QR Attendance",
              desc: "Generate QR codes for each participant. Scan for attendance with configurable scan modes.",
            },
            {
              icon: BarChart3,
              title: "Analytics & Reports",
              desc: "Track registrations, attendance, and export data. Get email reports on demand.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-border bg-card p-6 transition-all hover:glow-border"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026 Aliet Techpreneur Club. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Index;
