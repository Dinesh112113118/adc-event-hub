import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { QrCode, Zap, LogOut, CheckCircle2, XCircle, Camera, ScanLine } from "lucide-react";
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
import { useEvents } from "@/context/EventContext";
import { useToast } from "@/hooks/use-toast";

const ScannerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { events, registrations, addScan } = useEvents();
  const [selectedEvent, setSelectedEvent] = useState("");
  const [qrInput, setQrInput] = useState("");
  const [scanResult, setScanResult] = useState<null | { success: boolean; name: string; message: string }>(null);
  const [scanHistory, setScanHistory] = useState<{ name: string; success: boolean; time: string }[]>([]);

  const user = JSON.parse(localStorage.getItem("adc_user") || "{}");
  if (user.role !== "scanner" && user.role !== "admin") {
    navigate("/login");
    return null;
  }

  const eventRegs = registrations.filter((r) => r.eventId === selectedEvent);

  const handleScan = () => {
    if (!selectedEvent) {
      toast({ title: "Select an event first", variant: "destructive" });
      return;
    }
    if (!qrInput.trim()) {
      toast({ title: "Enter or scan a QR code", variant: "destructive" });
      return;
    }

    const reg = registrations.find((r) => r.qrCode === qrInput.trim() && r.eventId === selectedEvent);
    if (reg) {
      const result = addScan(reg.id, user.username || "scanner");
      setScanResult(result);
      setScanHistory((prev) => [
        { name: result.name, success: result.success, time: new Date().toLocaleTimeString() },
        ...prev.slice(0, 19),
      ]);
    } else {
      const result = { success: false, name: "Unknown", message: "Invalid QR code — not found for this event" };
      setScanResult(result);
      setScanHistory((prev) => [
        { name: "Unknown", success: false, time: new Date().toLocaleTimeString() },
        ...prev.slice(0, 19),
      ]);
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

      <main className="container mx-auto px-4 py-6 max-w-lg space-y-6">
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
                {events
                  .filter((e) => e.status === "published")
                  .map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.title}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {selectedEvent && (
            <div className="rounded-lg bg-muted/30 p-3 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Registered</span>
                <span className="font-medium">{eventRegs.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Scanned today</span>
                <span className="font-medium text-success">
                  {eventRegs.filter((r) => r.scans.some((s) => new Date(s.scannedAt).toDateString() === new Date().toDateString())).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Scan mode</span>
                <span className="font-medium">{events.find((e) => e.id === selectedEvent)?.scanMode}</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>QR Code</Label>
            <Input
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              placeholder="Enter or scan QR code..."
              onKeyDown={(e) => e.key === "Enter" && handleScan()}
              autoFocus
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

        {/* Scan History */}
        {scanHistory.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-4 space-y-2">
            <p className="text-sm font-medium flex items-center gap-2">
              <ScanLine className="h-4 w-4 text-primary" />
              Scan History ({scanHistory.length})
            </p>
            <div className="space-y-1">
              {scanHistory.map((entry, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg bg-muted/30 px-3 py-1.5 text-xs">
                  <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${entry.success ? "bg-success" : "bg-destructive"}`} />
                  <span className="font-medium">{entry.name}</span>
                  <span className="text-muted-foreground ml-auto">{entry.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Demo QR codes */}
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-2">Demo QR codes (for testing)</p>
          <div className="space-y-1">
            {registrations
              .filter((r) => r.eventId === selectedEvent || !selectedEvent)
              .slice(0, 5)
              .map((r) => (
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
