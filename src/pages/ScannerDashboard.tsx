import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { QrCode, Zap, LogOut, CheckCircle2, XCircle, Camera, ScanLine, Video, VideoOff } from "lucide-react";
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
import QRScanner from "@/components/QRScanner";
import { useEvents } from "@/context/EventContext";
import { useToast } from "@/hooks/use-toast";

const ScannerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { events, registrations, addScan } = useEvents();
  const [selectedEvent, setSelectedEvent] = useState("");
  const [qrInput, setQrInput] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [scanResult, setScanResult] = useState<null | { success: boolean; name: string; message: string }>(null);
  const [scanHistory, setScanHistory] = useState<{ name: string; success: boolean; time: string }[]>([]);

  const user = JSON.parse(localStorage.getItem("adc_user") || "{}");

  const eventRegs = registrations.filter((r) => r.eventId === selectedEvent);

  const processScan = useCallback(async (code: string) => {
    if (!selectedEvent) {
      toast({ title: "Select an event first", variant: "destructive" });
      return;
    }

    const reg = registrations.find((r) => r.qrCode === code.trim() && r.eventId === selectedEvent);
    let result;
    if (reg) {
      result = await addScan(reg.id, user.username || "scanner");
    } else {
      result = { success: false, name: "Unknown", message: "Invalid QR code — not found for this event" };
    }
    setScanResult(result);
    setScanHistory((prev) => [
      { name: result.name, success: result.success, time: new Date().toLocaleTimeString() },
      ...prev.slice(0, 19),
    ]);
  }, [selectedEvent, registrations, addScan, user.username, toast]);

  if (user.role !== "scanner" && user.role !== "admin") {
    navigate("/login");
    return null;
  }


  const handleManualScan = () => {
    if (!qrInput.trim()) {
      toast({ title: "Enter a QR code", variant: "destructive" });
      return;
    }
    processScan(qrInput.trim());
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

      <main className="container mx-auto px-4 py-6 max-w-lg space-y-5">
        {/* Event Selector */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="space-y-2">
            <Label>Select Event</Label>
            <Select value={selectedEvent} onValueChange={(v) => { setSelectedEvent(v); setScanResult(null); }}>
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
        </div>

        {/* Camera Scanner */}
        {selectedEvent && (
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                <Camera className="h-4 w-4 text-primary" />
                Camera Scanner
              </h2>
              <Button
                variant={cameraActive ? "destructive" : "outline"}
                size="sm"
                onClick={() => setCameraActive(!cameraActive)}
              >
                {cameraActive ? (
                  <><VideoOff className="h-3.5 w-3.5 mr-1.5" />Stop</>
                ) : (
                  <><Video className="h-3.5 w-3.5 mr-1.5" />Start Camera</>
                )}
              </Button>
            </div>

            <QRScanner onScan={processScan} active={cameraActive} />

            {!cameraActive && (
              <p className="text-xs text-muted-foreground text-center">
                Tap "Start Camera" to scan QR codes with your device camera
              </p>
            )}
          </div>
        )}

        {/* Manual Input & Search */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3 relative">
          <h2 className="font-semibold text-sm flex items-center gap-2">
            <QrCode className="h-4 w-4 text-primary" />
            Manual Search & Entry
          </h2>
          <div className="flex gap-2">
            <Input
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              placeholder="Search by name, email, or scan QR..."
              onKeyDown={(e) => e.key === "Enter" && handleManualScan()}
              className="flex-1"
            />
            <Button onClick={handleManualScan} disabled={!selectedEvent || !qrInput.trim()}>
              Submit
            </Button>
          </div>

          {/* Search Results Dropdown */}
          {qrInput.length > 1 && selectedEvent && (
            <div className="absolute left-0 right-0 top-[85%] mt-2 z-20 bg-card border border-border rounded-xl shadow-lg max-h-[300px] overflow-y-auto">
              {eventRegs
                .filter(r => r.name.toLowerCase().includes(qrInput.toLowerCase()) || r.email.toLowerCase().includes(qrInput.toLowerCase()) || r.qrCode.toLowerCase() === qrInput.toLowerCase())
                .slice(0, 15)
                .map(r => (
                  <div key={r.id} className="flex items-center justify-between p-3 border-b border-border/50 hover:bg-muted/30 last:border-0 transition-colors">
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="font-medium text-sm truncate">{r.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{r.email}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        processScan(r.qrCode);
                        setQrInput(""); // clear search after check in
                      }}
                    >
                      Check In
                    </Button>
                  </div>
                ))}
              {eventRegs.filter(r => r.name.toLowerCase().includes(qrInput.toLowerCase()) || r.email.toLowerCase().includes(qrInput.toLowerCase()) || r.qrCode.toLowerCase() === qrInput.toLowerCase()).length === 0 && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No participants found matching "{qrInput}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Scan Result */}
        {scanResult && (
          <div
            className={`animate-in rounded-xl border p-5 text-center ${scanResult.success
              ? "border-success/30 bg-success/10"
              : "border-destructive/30 bg-destructive/10"
              }`}
          >
            {scanResult.success ? (
              <CheckCircle2 className="h-10 w-10 text-success mx-auto mb-2" />
            ) : (
              <XCircle className="h-10 w-10 text-destructive mx-auto mb-2" />
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
            <div className="space-y-1 max-h-60 overflow-y-auto">
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

        {/* Attendees List */}
        {selectedEvent && (
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm font-medium mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              Recently Checked In
            </p>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {eventRegs
                .filter((r) => r.scans.length > 0)
                .sort((a, b) => {
                  const aTime = new Date(a.scans[a.scans.length - 1].scannedAt).getTime();
                  const bTime = new Date(b.scans[b.scans.length - 1].scannedAt).getTime();
                  return bTime - aTime;
                })
                .slice(0, 50)
                .map((r) => (
                  <div key={r.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 rounded-lg bg-muted/30 px-3 py-2 text-sm">
                    <div>
                      <span className="font-medium mr-2">{r.name}</span>
                      <span className="text-xs text-muted-foreground">{r.department}</span>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 sm:ml-auto">
                      <Zap className="h-3 w-3 text-success shrink-0" />
                      {new Date(r.scans[r.scans.length - 1].scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              {eventRegs.filter((r) => r.scans.length > 0).length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4 bg-muted/10 rounded-lg border border-dashed border-border">
                  No attendees checked in yet.
                </p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ScannerDashboard;
