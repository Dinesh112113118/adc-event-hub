import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar, Plus, Users, LogOut, Zap,
  MoreHorizontal, Eye, Pencil, Trash2, Search,
  TrendingUp, UserCheck, Clock, ArrowUpRight, QrCode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEvents } from "@/context/EventContext";
import { useToast } from "@/hooks/use-toast";

const statusColors: Record<string, string> = {
  published: "bg-success/20 text-success border-success/30",
  draft: "bg-warning/20 text-warning border-warning/30",
  completed: "bg-muted text-muted-foreground border-border",
  cancelled: "bg-destructive/20 text-destructive border-destructive/30",
};

const AdminDashboard = () => {
  const { events, registrations, deleteEvent } = useEvents();
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const user = JSON.parse(localStorage.getItem("adc_user") || "{}");
  if (user.role !== "admin") {
    navigate("/login");
    return null;
  }

  const filtered = events.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase())
  );

  const totalRegistrations = registrations.length;
  const activeEvents = events.filter((e) => e.status === "published").length;
  const totalAttended = registrations.filter((r) => r.scans.length > 0).length;
  const attendanceRate = totalRegistrations > 0 ? Math.round((totalAttended / totalRegistrations) * 100) : 0;

  const handleDelete = (id: string) => {
    deleteEvent(id);
    toast({ title: "Event deleted" });
  };

  const handleLogout = () => {
    localStorage.removeItem("adc_user");
    navigate("/login");
  };

  // Recent registrations
  const recentRegs = [...registrations]
    .sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime())
    .slice(0, 5);

  // Upcoming events
  const upcoming = events
    .filter((e) => e.status === "published" && new Date(e.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border glass sticky top-0 z-50">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold">ATC Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/scanner">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <QrCode className="h-3.5 w-3.5 mr-1.5" />
                Scanner
              </Button>
            </Link>
            <span className="text-sm text-muted-foreground hidden sm:block">{user.name}</span>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Welcome */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user.name?.split(" ")[0] || "Admin"} 👋</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Here's what's happening with your events</p>
          </div>
          <Link to="/admin/create-event">
            <Button>
              <Plus className="h-4 w-4 mr-1.5" />
              Create Event
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Events", value: events.length, icon: Calendar, color: "text-primary", bg: "bg-primary/10" },
            { label: "Active Events", value: activeEvents, icon: TrendingUp, color: "text-success", bg: "bg-success/10" },
            { label: "Total Registrations", value: totalRegistrations, icon: Users, color: "text-accent", bg: "bg-accent/10" },
            { label: "Attendance Rate", value: `${attendanceRate}%`, icon: UserCheck, color: "text-warning", bg: "bg-warning/10" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-5 hover:glow-border transition-all">
              <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${stat.bg} mb-3`}>
                <stat.icon className={`h-4.5 w-4.5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Two columns: Upcoming + Recent */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Upcoming Events */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Upcoming Events</h2>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No upcoming events</p>
            ) : (
              <div className="space-y-3">
                {upcoming.map((event) => {
                  const daysUntil = Math.ceil((new Date(event.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  const fillPercent = Math.round((event.registeredCount / event.maxCapacity) * 100);
                  return (
                    <Link
                      key={event.id}
                      to={`/admin/event/${event.id}`}
                      className="block rounded-lg border border-border/50 p-3 hover:bg-muted/30 transition-colors group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">{event.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `In ${daysUntil} days`}
                          </p>
                        </div>
                        <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>{event.registeredCount}/{event.maxCapacity}</span>
                          <span>{fillPercent}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${Math.min(fillPercent, 100)}%` }}
                          />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Registrations */}
          <div className="lg:col-span-3 rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Recent Registrations</h2>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            {recentRegs.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No registrations yet</p>
            ) : (
              <div className="space-y-2">
                {recentRegs.map((reg) => {
                  const evt = events.find((e) => e.id === reg.eventId);
                  return (
                    <div key={reg.id} className="flex items-center gap-3 rounded-lg border border-border/50 p-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                        {reg.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{reg.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{evt?.title || "Unknown event"}</p>
                      </div>
                      <p className="text-xs text-muted-foreground shrink-0">
                        {new Date(reg.registeredAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Events Table */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <h2 className="font-semibold text-lg">All Events</h2>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Event</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Date</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Venue</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">Registrations</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((event) => (
                    <tr key={event.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 font-mono">/{event.slug}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{event.venue}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-mono text-sm">
                          {event.registeredCount}
                          <span className="text-muted-foreground">/{event.maxCapacity}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusColors[event.status]}`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/admin/event/${event.id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/admin/event/${event.id}`)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit Event
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(event.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                        <Calendar className="h-8 w-8 mx-auto mb-2 opacity-40" />
                        <p>No events found</p>
                        <Link to="/admin/create-event" className="text-primary text-sm mt-1 inline-block hover:underline">
                          Create your first event →
                        </Link>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
