import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const CreateEvent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [paymentRequired, setPaymentRequired] = useState(false);
  const [collectLater, setCollectLater] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast({ title: "Event created!", description: "Your event is now live." });
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border glass sticky top-0 z-50">
        <div className="container mx-auto flex h-14 items-center gap-3 px-4">
          <Link to="/admin">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold">Create Event</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6 animate-in">
          {/* Basic Info */}
          <section className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h2 className="font-semibold text-lg">Basic Information</h2>
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input id="title" placeholder="e.g. TechTalk: AI & Future" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea id="description" placeholder="Describe your event..." rows={4} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Start Date & Time *</Label>
                <Input id="date" type="datetime-local" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date & Time</Label>
                <Input id="endDate" type="datetime-local" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="venue">Venue *</Label>
              <Input id="venue" placeholder="e.g. Main Auditorium, Block A" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Max Capacity *</Label>
              <Input id="capacity" type="number" min={1} placeholder="200" required />
            </div>
          </section>

          {/* Payment */}
          <section className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h2 className="font-semibold text-lg">Payment Settings</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Require Payment</p>
                <p className="text-xs text-muted-foreground">Enable if this is a paid event</p>
              </div>
              <Switch checked={paymentRequired} onCheckedChange={setPaymentRequired} />
            </div>
            {paymentRequired && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input id="amount" type="number" min={1} placeholder="100" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Collect Later</p>
                    <p className="text-xs text-muted-foreground">Payment at the venue instead</p>
                  </div>
                  <Switch checked={collectLater} onCheckedChange={setCollectLater} />
                </div>
              </>
            )}
          </section>

          {/* Scan Config */}
          <section className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h2 className="font-semibold text-lg">Attendance Settings</h2>
            <div className="space-y-2">
              <Label>Scan Mode</Label>
              <Select defaultValue="single">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single scan (one-time entry)</SelectItem>
                  <SelectItem value="multiple">Multiple scans per day</SelectItem>
                  <SelectItem value="daily">Daily scan (multi-day events)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </section>

          <div className="flex gap-3 justify-end">
            <Link to="/admin">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button type="submit">Create Event</Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreateEvent;
