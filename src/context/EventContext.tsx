import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Event, Registration, ScanRecord } from "@/types/event";
import { supabase } from "@/lib/supabase";

interface EventContextType {
  events: Event[];
  registrations: Registration[];
  loading: boolean;
  addEvent: (event: Omit<Event, "id" | "slug" | "registeredCount" | "createdAt">) => Promise<void>;
  updateEvent: (id: string, data: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  addRegistration: (reg: Omit<Registration, "id" | "qrCode" | "registeredAt" | "scans">) => Promise<void>;
  addScan: (registrationId: string, scannedBy: string) => Promise<{ success: boolean; message: string; name: string }>;
  getEventRegistrations: (eventId: string) => Registration[];
  getEventById: (id: string) => Event | undefined;
  getEventBySlug: (slug: string) => Event | undefined;
  updateEmailStatus: (registrationIds: string[], status: Registration["emailStatus"]) => Promise<void>;
}

const EventContext = createContext<EventContextType | null>(null);

export const useEvents = () => {
  const ctx = useContext(EventContext);
  if (!ctx) throw new Error("useEvents must be used within EventProvider");
  return ctx;
};

const generateSlug = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const generateId = () => Math.random().toString(36).substring(2, 10);

const generateQR = (eventId: string, name: string) => {
  return `EVT${eventId}-${generateId().toUpperCase()}`;
};

export const EventProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const { data: eventsData } = await supabase.from('events').select('*').order('date', { ascending: true });

    // fetch registrations with their nested scan_records
    const { data: regsData } = await supabase.from('registrations').select('*, scans:scan_records(*)').order('registeredAt', { ascending: false });

    if (eventsData) setEvents(eventsData as Event[]);
    if (regsData) setRegistrations(regsData as Registration[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();

    // Subscribe to realtime changes
    const eventsSubscription = supabase
      .channel('public:events')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, payload => {
        fetchData();
      })
      .subscribe();

    const regsSubscription = supabase
      .channel('public:registrations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'registrations' }, payload => {
        fetchData();
      })
      .subscribe();

    const scansSubscription = supabase
      .channel('public:scan_records')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'scan_records' }, payload => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(eventsSubscription);
      supabase.removeChannel(regsSubscription);
      supabase.removeChannel(scansSubscription);
    };
  }, []);

  const addEvent = async (data: Omit<Event, "id" | "slug" | "registeredCount" | "createdAt">) => {
    const newEvent: Event = {
      ...data,
      id: generateId(),
      slug: generateSlug(data.title),
      registeredCount: 0,
      createdAt: new Date().toISOString(),
    };

    // optimistic
    setEvents((prev) => [newEvent, ...prev]);

    await supabase.from('events').insert([newEvent]);
  };

  const updateEvent = async (id: string, data: Partial<Event>) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...data } : e)));
    await supabase.from('events').update(data).eq('id', id);
  };

  const deleteEvent = async (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setRegistrations((prev) => prev.filter((r) => r.eventId !== id));
    await supabase.from('events').delete().eq('id', id);
  };

  const addRegistration = async (data: Omit<Registration, "id" | "qrCode" | "registeredAt" | "scans">) => {
    const id = generateId();
    const newReg: Registration = {
      ...data,
      id,
      qrCode: generateQR(data.eventId, data.name),
      registeredAt: new Date().toISOString(),
      scans: [],
    };

    setRegistrations((prev) => [...prev, newReg]);
    setEvents((prev) =>
      prev.map((e) => (e.id === data.eventId ? { ...e, registeredCount: e.registeredCount + 1 } : e))
    );

    // we must insert registration but not the empty scans array
    const { scans, ...regDataToInsert } = newReg;
    await supabase.from('registrations').insert([regDataToInsert]);

    // update event count
    const event = events.find(e => e.id === data.eventId);
    if (event) {
      await supabase.from('events').update({ registeredCount: event.registeredCount + 1 }).eq('id', data.eventId);
    }
  };

  const addScan = async (registrationId: string, scannedBy: string) => {
    const reg = registrations.find((r) => r.id === registrationId);
    if (!reg) return { success: false, message: "Registration not found", name: "Unknown" };

    const event = events.find((e) => e.id === reg.eventId);
    if (!event) return { success: false, message: "Event not found", name: reg.name };

    const today = new Date().toDateString();
    const todayScans = reg.scans.filter((s) => new Date(s.scannedAt).toDateString() === today);

    if (event.scanMode === "single" && reg.scans.length > 0) {
      return { success: false, message: `Already scanned (${reg.scans.length} total)`, name: reg.name };
    }
    if (event.scanMode === "daily" && todayScans.length >= (event.maxScansPerDay || 1)) {
      return { success: false, message: `Daily limit reached (${todayScans.length}/${event.maxScansPerDay || 1} today)`, name: reg.name };
    }
    if (event.scanMode === "multiple" && event.maxScansPerDay && todayScans.length >= event.maxScansPerDay) {
      return { success: false, message: `Max scans reached today (${todayScans.length}/${event.maxScansPerDay})`, name: reg.name };
    }

    const scan: ScanRecord = {
      id: generateId(),
      registrationId,
      scannedAt: new Date().toISOString(),
      scannedBy,
      day: todayScans.length + 1,
    };

    setRegistrations((prev) =>
      prev.map((r) => (r.id === registrationId ? { ...r, scans: [...r.scans, scan] } : r))
    );

    await supabase.from('scan_records').insert([scan]);

    return {
      success: true,
      message: `Entry confirmed ✓ (Scan ${reg.scans.length + 1}${event.scanMode === "daily" ? `, Day scan ${todayScans.length + 1}/${event.maxScansPerDay || "∞"}` : ""})`,
      name: reg.name,
    };
  };

  const updateEmailStatus = async (registrationIds: string[], status: Registration["emailStatus"]) => {
    setRegistrations((prev) =>
      prev.map((r) => (registrationIds.includes(r.id) ? { ...r, emailStatus: status } : r))
    );
    await supabase.from('registrations').update({ emailStatus: status }).in('id', registrationIds);
  };

  const getEventRegistrations = (eventId: string) => registrations.filter((r) => r.eventId === eventId);
  const getEventById = (id: string) => events.find((e) => e.id === id);
  const getEventBySlug = (slug: string) => events.find((e) => e.slug === slug);

  return (
    <EventContext.Provider
      value={{
        events,
        registrations,
        loading,
        addEvent,
        updateEvent,
        deleteEvent,
        addRegistration,
        addScan,
        getEventRegistrations,
        getEventById,
        getEventBySlug,
        updateEmailStatus,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};
