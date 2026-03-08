import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar, Plus, Users, BarChart3, LogOut, Zap,
  MoreHorizontal, Eye, Pencil, Trash2, Search,
  TrendingUp, UserCheck, Clock
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
import { mockEvents } from "@/types/event";
import { useToast } from "@/hooks/use-toast";

const statusColors: Record<string, string> = {
  published: "bg-success/20 text-success border-success/30",
  draft: "bg-warning/20 text-warning border-warning/30",
  completed: "bg-muted text-muted-foreground border-border",
  cancelled: "bg-destructive/20 text-destructive border-destructive/30",
};

const AdminDashboard = () => {
  const [events, setEvents] = useState(mockEvents);
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

  const totalRegistrations = events.reduce((a, e) => a + e.registeredCount, 0);
  const activeEvents = events.filter((e) => e.status === "published").length;

  const handleDelete = (id: string) => {
    setEvents(events.filter((e) => e.id !== id));
    toast({ title: "Event deleted" });
  };

  const handleLogout = () => {
    localStorage.removeItem("adc_user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border glass sticky top-0 z-50">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold">ADC Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user.name}
            </span>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Events", value: events.length, icon: Calendar, color: "text-primary" },
            { label: "Active Events", value: activeEvents, icon: TrendingUp, color: "text-success" },
            { label: "Registrations", value: totalRegistrations, icon: Users, color: "text-accent" },
            { label: "Attendance Rate", value: "78%", icon: UserCheck, color: "text-warning" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Link to="/admin/create-event">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Create Event
            </Button>
          </Link>
        </div>

        {/* Events Table */}
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
                        <p className="text-xs text-muted-foreground mt-0.5">/{event.slug}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                      {event.venue}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-mono text-sm">
                        {event.registeredCount}
                        <span className="text-muted-foreground">/{event.maxCapacity}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="outline" className={statusColors[event.status]}>
                        {event.status}
                      </Badge>
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
                          <DropdownMenuItem>
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
                      No events found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
