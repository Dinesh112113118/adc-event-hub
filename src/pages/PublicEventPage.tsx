import { useState } from "react";
import { useParams } from "react-router-dom";
import { Calendar, MapPin, Users, Zap, Clock, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEvents } from "@/context/EventContext";
import { useToast } from "@/hooks/use-toast";

const PublicEventPage = () => {
  const { slug } = useParams();
  const { toast } = useToast();
  const { getEventBySlug, addRegistration } = useEvents();
  const [submitted, setSubmitted] = useState(false);

  const event = getEventBySlug(slug || "");

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Event Not Found</h1>
          <p className="text-muted-foreground">This event link is invalid or has expired.</p>
        </div>
      </div>
    );
  }

  const isFull = event.registeredCount >= event.maxCapacity;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    addRegistration({
      eventId: event.id,
      name: data.get("name") as string,
      email: data.get("email") as string,
      phone: data.get("phone") as string,
      college: (data.get("college") as string) || undefined,
      department: (data.get("dept") as string) || undefined,
      year: (data.get("year") as string) || undefined,
      paymentStatus: event.paymentRequired ? (event.paymentCollectLater ? "collect_later" : "pending") : "free",
      emailStatus: "pending" as const,
    });

    setSubmitted(true);
    toast({ title: "Registration successful!", description: "Your ticket and QR code have been sent to your email." });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4" style={{ backgroundImage: "var(--gradient-hero)" }}>
        <div className="animate-in max-w-md w-full text-center">
          <div className="rounded-xl border border-success/30 bg-success/10 p-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-success/20 mb-4">
              <Zap className="h-8 w-8 text-success" />
            </div>
            <h1 className="text-2xl font-bold mb-2">You're Registered!</h1>
            <p className="text-muted-foreground mb-4">
              A confirmation email with your QR code ticket has been sent to your email address.
            </p>
            <p className="text-sm text-muted-foreground">
              Please bring your QR code for attendance scanning on the event day.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" style={{ backgroundImage: "var(--gradient-hero)" }}>
      <nav className="border-b border-border/50 glass">
        <div className="container mx-auto flex h-14 items-center px-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold">ADC Events</span>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="animate-in space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold">{event.title}</h1>
                <p className="text-sm text-muted-foreground mt-1">by Aliet Techpreneur Club</p>
              </div>
              {event.paymentRequired ? (
                <span className="inline-flex items-center rounded-full border bg-primary/20 text-primary border-primary/30 px-2.5 py-0.5 text-xs font-medium">
                  <CreditCard className="h-3 w-3 mr-1" />₹{event.paymentAmount}
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full border bg-success/20 text-success border-success/30 px-2.5 py-0.5 text-xs font-medium">Free</span>
              )}
            </div>

            <p className="text-muted-foreground text-sm">{event.description}</p>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4 text-primary" />
                {new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4 text-primary" />
                {new Date(event.date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                {event.venue}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4 text-primary" />
                {event.registeredCount}/{event.maxCapacity} registered
              </div>
            </div>
          </div>

          {isFull ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-center">
              <p className="font-semibold text-destructive">Registrations Full</p>
              <p className="text-sm text-muted-foreground mt-1">This event has reached maximum capacity.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h2 className="font-semibold text-lg">Register Now</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" name="name" placeholder="John Doe" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" name="email" type="email" placeholder="john@email.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input id="phone" name="phone" type="tel" placeholder="9876543210" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="college">College / Institution</Label>
                  <Input id="college" name="college" placeholder="Your college" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dept">Department</Label>
                  <Input id="dept" name="dept" placeholder="e.g. CSE" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input id="year" name="year" placeholder="e.g. 3rd" />
                </div>
              </div>
              <Button type="submit" className="w-full">
                {event.paymentRequired && !event.paymentCollectLater
                  ? `Register & Pay ₹${event.paymentAmount}`
                  : "Register"}
              </Button>
              {event.paymentRequired && event.paymentCollectLater && (
                <p className="text-xs text-muted-foreground text-center">
                  Payment of ₹{event.paymentAmount} will be collected at the venue.
                </p>
              )}
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default PublicEventPage;
