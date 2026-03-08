import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft, Zap, Users, Download, Mail,
  Search, UserCheck, Clock, QrCode, CalendarDays, ScanLine
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEvents } from "@/context/EventContext";
import { useToast } from "@/hooks/use-toast";

const EventDetails = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { getEventById, getEventRegistrations } = useEvents();
  const [search, setSearch] = useState("");

  const event = getEventById(id || "");
  const registrations = getEventRegistrations(id || "");
  const attended = registrations.filter((r) => r.scans.length > 0);

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Event not found</p>
      </div>
    );
  }

  const filtered = registrations.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportCSV = () => {
    const headers = "Name,Email,Phone,College,Department,Year,Payment,Registered At,Total Scans,Attended\n";
    const rows = registrations.map((r) =>
      `${r.name},${r.email},${r.phone},${r.college || ""},${r.department || ""},${r.year || ""},${r.paymentStatus},${r.registeredAt},${r.scans.length},${r.scans.length > 0 ? "Yes" : "No"}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.slug}-registrations.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported!", description: "CSV downloaded successfully." });
  };

  const handleEmailReport = () => {
    toast({ title: "Report sent!", description: "Attendance report emailed to admin." });
  };

  const regLink = `${window.location.origin}/event/${event.slug}`;

  const scanModeLabel = {
    single: "Single scan only",
    multiple: `Multiple scans/day (max ${event.maxScansPerDay || "∞"})`,
    daily: `Daily scan (max ${event.maxScansPerDay || 1}/day, ${event.totalDays || "∞"} days)`,
  }[event.scanMode];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border glass sticky top-0 z-50">
        <div className="container mx-auto flex h-14 items-center gap-3 px-4">
          <Link to="/admin">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Zap className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold truncate">{event.title}</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Event Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Registered", value: event.registeredCount, icon: Users, color: "text-primary", bg: "bg-primary/10" },
            { label: "Capacity", value: event.maxCapacity, icon: Users, color: "text-accent", bg: "bg-accent/10" },
            { label: "Attended", value: attended.length, icon: UserCheck, color: "text-success", bg: "bg-success/10" },
            { label: "Not Attended", value: registrations.length - attended.length, icon: Clock, color: "text-warning", bg: "bg-warning/10" },
            { label: "Scan Mode", value: event.scanMode, icon: ScanLine, color: "text-primary", bg: "bg-primary/10" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4">
              <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${s.bg} mb-2`}>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Scan Config Info */}
        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <QrCode className="h-4.5 w-4.5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Attendance Configuration</p>
            <p className="text-xs text-muted-foreground">{scanModeLabel}</p>
          </div>
        </div>

        {/* Registration Link */}
        <div className="rounded-xl border border-border bg-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Registration Link</p>
            <p className="text-xs text-muted-foreground font-mono break-all">{regLink}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(regLink);
              toast({ title: "Copied!" });
            }}
          >
            Copy Link
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="registrations">
          <TabsList>
            <TabsTrigger value="registrations">
              Registrations ({registrations.length})
            </TabsTrigger>
            <TabsTrigger value="attendance">
              Attendance ({attended.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="registrations" className="space-y-4 mt-4">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExportCSV}>
                  <Download className="h-4 w-4 mr-1" />
                  Export CSV
                </Button>
                <Button variant="outline" size="sm" onClick={handleEmailReport}>
                  <Mail className="h-4 w-4 mr-1" />
                  Email Report
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Email</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Phone</th>
                      <th className="px-4 py-3 text-center font-medium text-muted-foreground">Payment</th>
                      <th className="px-4 py-3 text-center font-medium text-muted-foreground">Scans</th>
                      <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((reg) => {
                      const today = new Date().toDateString();
                      const todayScans = reg.scans.filter((s) => new Date(s.scannedAt).toDateString() === today);
                      return (
                        <tr key={reg.id} className="border-b border-border/50 hover:bg-muted/20">
                          <td className="px-4 py-3">
                            <p className="font-medium">{reg.name}</p>
                            <p className="text-xs text-muted-foreground md:hidden">{reg.email}</p>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{reg.email}</td>
                          <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{reg.phone}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                              reg.paymentStatus === "paid" ? "bg-success/20 text-success border-success/30" :
                              reg.paymentStatus === "free" ? "bg-primary/20 text-primary border-primary/30" :
                              "bg-warning/20 text-warning border-warning/30"
                            }`}>
                              {reg.paymentStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="font-mono text-xs">
                              {reg.scans.length} total
                              {todayScans.length > 0 && (
                                <span className="text-primary ml-1">({todayScans.length} today)</span>
                              )}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {reg.scans.length > 0 ? (
                              <span className="inline-flex items-center rounded-full border bg-success/20 text-success border-success/30 px-2 py-0.5 text-xs font-medium">Attended</span>
                            ) : (
                              <span className="inline-flex items-center rounded-full border bg-muted text-muted-foreground border-border px-2 py-0.5 text-xs font-medium">Pending</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                          No registrations yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="attendance" className="mt-4 space-y-4">
            {attended.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
                <UserCheck className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="font-medium">No attendees scanned yet</p>
                <p className="text-sm">Scan QR codes using the Scanner portal to track attendance.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {attended.map((reg) => {
                  const today = new Date().toDateString();
                  const todayScans = reg.scans.filter((s) => new Date(s.scannedAt).toDateString() === today);
                  const maxAllowed = event.scanMode === "single" ? 1 : (event.maxScansPerDay || "∞");

                  return (
                    <div key={reg.id} className="rounded-xl border border-border bg-card p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-success/10 flex items-center justify-center text-success text-sm font-bold shrink-0">
                            {reg.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{reg.name}</p>
                            <p className="text-xs text-muted-foreground">{reg.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-primary">{reg.scans.length} scan{reg.scans.length !== 1 ? "s" : ""}</p>
                          <p className="text-xs text-muted-foreground">
                            Today: {todayScans.length}/{maxAllowed}
                          </p>
                        </div>
                      </div>

                      {/* Scan History */}
                      <div className="space-y-1.5">
                        {reg.scans.map((scan, i) => (
                          <div key={scan.id} className="flex items-center gap-2 rounded-lg bg-muted/30 px-3 py-1.5 text-xs">
                            <ScanLine className="h-3 w-3 text-success shrink-0" />
                            <span className="text-muted-foreground">Scan #{i + 1}</span>
                            <span className="text-foreground font-medium">
                              {new Date(scan.scannedAt).toLocaleString("en-IN", {
                                day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                              })}
                            </span>
                            <span className="text-muted-foreground ml-auto">by {scan.scannedBy}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default EventDetails;
