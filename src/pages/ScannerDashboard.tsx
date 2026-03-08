import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { QrCode, Zap, LogOut, CheckCircle2, XCircle, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockEvents, mockRegistrations } from "@/types/event";
import { useToast } from "@/hooks/use-toast";

const ScannerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedEvent, setSelectedEvent] = useState("");
  const [qrInput, setQrInput] = useState("");
  const [scanResult, setScanResult] = useState<null | { success: boolean; name: string; message: string }>(null);

  const user = JSON.parse(localStorage.getItem("adc_user") || "{}");
  if (user.role !== "scanner" && user.role !== "admin") {
    navigate("/login");
    return null;
  }

  const handleScan = () => {
    if (!selectedEvent) {
      toast({ title: "Select an event first", variant: "destructive" });
      return;
    }
    if (!qrInput.trim()) {
      toast({ title: "Enter or scan a QR code", variant: "destructive" });
      return;
    }

    const reg = mockRegistrations.find((r) => r.qrCode === qrInput.trim() && r.eventId === selectedEvent);
    if (reg) {
      if (reg.scans.length > 0) {
        setScanResult({ success: false, name: reg.name, message: "Already scanned!" });
      } else {
        setScanResult({ success: true, name: reg.name, message: "Entry confirmed ✓" });
      }
    } else {
      setScanResult({ success: false, name: "Unknown", message: "Invalid QR code" });
    }
    setQrInput("");
  };

  const handleLogout = () => {
    localStorage.removeItem("adc_user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border glass sticky top-0 z-50">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold">ADC Scanner</span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-md space-y-6">
        <div className="animate-in text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4 animate-pulse-glow">
            <Camera className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Scan Attendance</h1>
          <p className="text-sm text-muted-foreground mt-1">Select event and scan QR codes</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="space-y-2">
            <Label>Select Event</Label>
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger>
                <SelectValue placeholder="Choose event..." />
              </SelectTrigger>
              <SelectContent>
                {mockEvents
                  .filter((e) => e.status === "published")
                  .map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.title}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>QR Code</Label>
            <Input
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              placeholder="Enter or scan QR code..."
              onKeyDown={(e) => e.key === "Enter" && handleScan()}
            />
          </div>

          <Button onClick={handleScan} className="w-full" disabled={!selectedEvent}>
            <QrCode className="h-4 w-4 mr-2" />
            Verify Scan
          </Button>
        </div>

        {/* Scan Result */}
        {scanResult && (
          <div
            className={`animate-in rounded-xl border p-6 text-center ${
              scanResult.success
                ? "border-success/30 bg-success/10"
                : "border-destructive/30 bg-destructive/10"
            }`}
          >
            {scanResult.success ? (
              <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-3" />
            ) : (
              <XCircle className="h-12 w-12 text-destructive mx-auto mb-3" />
            )}
            <p className="text-lg font-bold">{scanResult.name}</p>
            <p className="text-sm text-muted-foreground">{scanResult.message}</p>
          </div>
        )}

        {/* Demo QR codes */}
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-2">Demo QR codes (for testing)</p>
          <div className="space-y-1">
            {mockRegistrations.map((r) => (
              <button
                key={r.id}
                onClick={() => setQrInput(r.qrCode)}
                className="block w-full text-left rounded-lg bg-muted px-3 py-2 text-xs font-mono hover:bg-muted/80 transition-colors"
              >
                {r.qrCode} — {r.name}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ScannerDashboard;
