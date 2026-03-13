import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft, Zap, Users, Download, Mail, Send, SendHorizontal,
  Search, UserCheck, Clock, QrCode, ScanLine, CheckCircle2,
  XCircle, AlertCircle, Pencil, Filter, Check, X, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useEvents } from "@/context/EventContext";
import { useToast } from "@/hooks/use-toast";
import { defaultTicketTemplate, TicketTemplate } from "@/types/event";
import TicketPreview from "@/components/TicketPreview";
import TicketEditor from "@/components/TicketEditor";
import QRCode from "qrcode";

const EventDetails = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { getEventById, getEventRegistrations, updateEmailStatus, addRegistration } = useEvents();
  const [search, setSearch] = useState("");
  const [template, setTemplate] = useState<TicketTemplate>(defaultTicketTemplate);
  const [showEditor, setShowEditor] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [emailFilter, setEmailFilter] = useState<"all" | "pending" | "sent" | "failed" | "invalid">("all");
  const [sending, setSending] = useState(false);
  const [openAddUser, setOpenAddUser] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPhone, setNewUserPhone] = useState("");
  const [newUserDept, setNewUserDept] = useState("");

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

  const filtered = registrations.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter = emailFilter === "all" || r.emailStatus === emailFilter;
    return matchSearch && matchFilter;
  });

  const emailStats = {
    total: registrations.length,
    pending: registrations.filter((r) => r.emailStatus === "pending").length,
    sent: registrations.filter((r) => r.emailStatus === "sent").length,
    failed: registrations.filter((r) => r.emailStatus === "failed").length,
    invalid: registrations.filter((r) => r.emailStatus === "invalid").length,
  };

  const validForEmail = registrations.filter(
    (r) => r.emailStatus !== "invalid" && r.email.includes("@")
  );

  const handleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((r) => r.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleAddUser = () => {
    if (!newUserName.trim() || !newUserEmail.trim()) {
      toast({ title: "Validation Error", description: "Name and Email are required.", variant: "destructive" });
      return;
    }
    if (event) {
      addRegistration({
        eventId: event.id,
        name: newUserName,
        email: newUserEmail,
        phone: newUserPhone,
        department: newUserDept,
        year: "",
        emailStatus: "pending",
      });
      toast({ title: "User Added", description: `${newUserName} has been successfully registered.` });
      setOpenAddUser(false);
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPhone("");
      setNewUserDept("");
    }
  };

  const handleSendEmails = async () => {
    const toSend = Array.from(selectedIds)
      .map(id => registrations.find(r => r.id === id))
      .filter((reg): reg is NonNullable<typeof reg> => !!reg && reg.email.includes("@") && reg.emailStatus !== "invalid");

    if (toSend.length === 0) {
      toast({ title: "No valid recipients", description: "Select participants with valid emails.", variant: "destructive" });
      return;
    }

    setSending(true);
    let successCount = 0;

    for (const reg of toSend) {
      try {
        const qrCodeDataUrl = await QRCode.toDataURL(reg.qrCode, { width: 400, margin: 2 });

        const response = await fetch("https://jwedwyvcazykbpgwsxsq.supabase.co/functions/v1/send-ticket-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: reg.email,
            name: reg.name,
            eventTitle: event?.title || "ATC Event",
            qrCodeDataUrl,
            template,
            department: reg.department,
            year: reg.year,
          }),
        });

        if (response.ok) {
          updateEmailStatus([reg.id], "sent");
          successCount++;
        } else {
          updateEmailStatus([reg.id], "failed");
        }
      } catch (error) {
        console.error("Failed to send email to", reg.email, error);
        updateEmailStatus([reg.id], "failed");
      }
    }

    setSending(false);
    setSelectedIds(new Set());

    if (successCount > 0) {
      toast({
        title: `${successCount} ticket(s) sent!`,
        description: "QR tickets have been emailed to selected participants.",
      });
    } else {
      toast({
        title: "Sending Failed",
        description: "Failed to send tickets. Check console for details.",
        variant: "destructive"
      });
    }
  };

  const handleSelectPending = () => {
    const pending = registrations
      .filter((r) => r.emailStatus === "pending" && r.email.includes("@"))
      .map((r) => r.id);
    setSelectedIds(new Set(pending));
  };

  const handleExportCSV = () => {
    const headers = "Name,Email,Phone,Department,Year,QR Code,Email Status,Scans,Attended\n";
    const rows = registrations.map((r) =>
      `"${r.name}",${r.email},${r.phone},${r.department || ""},${r.year || ""},${r.qrCode},${r.emailStatus},${r.scans.length},${r.scans.length > 0 ? "Yes" : "No"}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.slug}-registrations.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported!", description: "CSV downloaded." });
  };

  const regLink = `${window.location.origin}/event/${event.slug}`;

  const scanModeLabel = {
    single: "Single scan only",
    multiple: `Multiple scans/day (max ${event.maxScansPerDay || "∞"})`,
    daily: `Daily scan (max ${event.maxScansPerDay || 1}/day, ${event.totalDays || "∞"} days)`,
  }[event.scanMode];

  const emailStatusIcon = (status: string) => {
    switch (status) {
      case "sent": return <CheckCircle2 className="h-3.5 w-3.5 text-success" />;
      case "failed": return <XCircle className="h-3.5 w-3.5 text-destructive" />;
      case "invalid": return <AlertCircle className="h-3.5 w-3.5 text-warning" />;
      default: return <Clock className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

  const emailStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-muted text-muted-foreground border-border",
      sent: "bg-success/20 text-success border-success/30",
      failed: "bg-destructive/20 text-destructive border-destructive/30",
      invalid: "bg-warning/20 text-warning border-warning/30",
    };
    return `inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${styles[status] || styles.pending}`;
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
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Zap className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold truncate">{event.title}</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Registered", value: registrations.length, icon: Users, color: "text-primary", bg: "bg-primary/10" },
            { label: "Emails Sent", value: emailStats.sent, icon: Send, color: "text-success", bg: "bg-success/10" },
            { label: "Pending", value: emailStats.pending, icon: Clock, color: "text-warning", bg: "bg-warning/10" },
            { label: "Attended", value: attended.length, icon: UserCheck, color: "text-accent", bg: "bg-accent/10" },
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

        {/* Scan Config */}
        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <QrCode className="h-4.5 w-4.5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Attendance Configuration</p>
            <p className="text-xs text-muted-foreground">{scanModeLabel}</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="tickets">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="tickets">
              <Mail className="h-3.5 w-3.5 mr-1.5" />
              Tickets & Email
            </TabsTrigger>
            <TabsTrigger value="registrations">
              Registrations
            </TabsTrigger>
            <TabsTrigger value="attendance">
              Attendance
            </TabsTrigger>
          </TabsList>

          {/* ===== TICKETS & EMAIL TAB ===== */}
          <TabsContent value="tickets" className="space-y-6 mt-4">
            {/* Ticket Template */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Editor */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Pencil className="h-4 w-4 text-primary" />
                    Ticket Template
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowEditor(!showEditor)}
                  >
                    {showEditor ? "Hide Editor" : "Edit Template"}
                  </Button>
                </div>
                {showEditor && <TicketEditor template={template} onChange={setTemplate} />}
              </div>

              {/* Preview */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                <h3 className="font-semibold">Ticket Preview</h3>
                {registrations[0] && (
                  <TicketPreview template={template} registration={registrations[0]} />
                )}
              </div>
            </div>

            {/* Email Control Panel */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    <SendHorizontal className="h-4 w-4 text-primary" />
                    Send Tickets
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {emailStats.sent}/{emailStats.total} sent • {emailStats.pending} pending • {emailStats.invalid} invalid
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={handleSelectPending}>
                    Select All Pending ({emailStats.pending})
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSendEmails}
                    disabled={selectedIds.size === 0 || sending}
                  >
                    <Send className="h-3.5 w-3.5 mr-1.5" />
                    {sending ? "Sending..." : `Send to ${selectedIds.size} selected`}
                  </Button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-2 flex-wrap">
                {(["all", "pending", "sent", "failed", "invalid"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setEmailFilter(f)}
                    className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${emailFilter === f
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
                      }`}
                  >
                    {f === "all" ? `All (${emailStats.total})` :
                      f === "pending" ? `Pending (${emailStats.pending})` :
                        f === "sent" ? `Sent (${emailStats.sent})` :
                          f === "failed" ? `Failed (${emailStats.failed})` :
                            `Invalid (${emailStats.invalid})`}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Recipient List */}
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-card z-10">
                      <tr className="border-b border-border bg-muted/30">
                        <th className="px-3 py-2 text-left w-10">
                          <Checkbox
                            checked={selectedIds.size === filtered.length && filtered.length > 0}
                            onCheckedChange={handleSelectAll}
                          />
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Name</th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground hidden md:table-cell">Email</th>
                        <th className="px-3 py-2 text-center font-medium text-muted-foreground hidden sm:table-cell">Dept</th>
                        <th className="px-3 py-2 text-center font-medium text-muted-foreground">QR Code</th>
                        <th className="px-3 py-2 text-center font-medium text-muted-foreground">Email Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((reg) => (
                        <tr
                          key={reg.id}
                          className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${selectedIds.has(reg.id) ? "bg-primary/5" : ""
                            }`}
                        >
                          <td className="px-3 py-2">
                            <Checkbox
                              checked={selectedIds.has(reg.id)}
                              onCheckedChange={() => toggleSelect(reg.id)}
                              disabled={reg.emailStatus === "invalid"}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <p className="font-medium text-sm">{reg.name}</p>
                            <p className="text-xs text-muted-foreground md:hidden">{reg.email}</p>
                          </td>
                          <td className="px-3 py-2 hidden md:table-cell text-muted-foreground text-xs">
                            {reg.email || <span className="text-warning">No email</span>}
                          </td>
                          <td className="px-3 py-2 text-center hidden sm:table-cell">
                            <span className="text-xs">{reg.department}</span>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <span className="font-mono text-[10px] text-muted-foreground">{reg.qrCode}</span>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <span className={emailStatusBadge(reg.emailStatus)}>
                              {emailStatusIcon(reg.emailStatus)}
                              {reg.emailStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {filtered.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                            No participants match your filter
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ===== REGISTRATIONS TAB ===== */}
          <TabsContent value="registrations" className="space-y-4 mt-4">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <p className="text-sm text-muted-foreground">{registrations.length} total registrations</p>
              <div className="flex gap-2">
                <Dialog open={openAddUser} onOpenChange={setOpenAddUser}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Register User Manually</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="John Doe" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} placeholder="john@example.com" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input id="phone" value={newUserPhone} onChange={(e) => setNewUserPhone(e.target.value)} placeholder="+1234567890" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="department">Department</Label>
                          <Input id="department" value={newUserDept} onChange={(e) => setNewUserDept(e.target.value)} placeholder="Engineering" />
                        </div>
                      </div>
                      <Button onClick={handleAddUser} className="w-full">Register User</Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="outline" size="sm" onClick={handleExportCSV}>
                  <Download className="h-4 w-4 mr-1" />
                  Export CSV
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-card z-10">
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Email</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Phone</th>
                      <th className="px-4 py-3 text-center font-medium text-muted-foreground hidden sm:table-cell">Dept</th>
                      <th className="px-4 py-3 text-center font-medium text-muted-foreground">Scans</th>
                      <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((reg) => {
                      const today = new Date().toDateString();
                      const todayScans = reg.scans.filter((s) => new Date(s.scannedAt).toDateString() === today);
                      return (
                        <tr key={reg.id} className="border-b border-border/50 hover:bg-muted/20">
                          <td className="px-4 py-3">
                            <p className="font-medium">{reg.name}</p>
                            <p className="text-xs text-muted-foreground md:hidden">{reg.email}</p>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell text-muted-foreground text-xs">{reg.email}</td>
                          <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">{reg.phone}</td>
                          <td className="px-4 py-3 text-center hidden sm:table-cell text-xs">{reg.department}</td>
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
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* ===== ATTENDANCE TAB ===== */}
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
