import { createContext, useContext, useState, ReactNode } from "react";
import { Event, Registration, ScanRecord, mockEvents, mockRegistrations } from "@/types/event";

interface EventContextType {
  events: Event[];
  registrations: Registration[];
  addEvent: (event: Omit<Event, "id" | "slug" | "registeredCount" | "createdAt">) => void;
  updateEvent: (id: string, data: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  addRegistration: (reg: Omit<Registration, "id" | "qrCode" | "registeredAt" | "scans">) => void;
  addScan: (registrationId: string, scannedBy: string) => { success: boolean; message: string; name: string };
  getEventRegistrations: (eventId: string) => Registration[];
  getEventById: (id: string) => Event | undefined;
  getEventBySlug: (slug: string) => Event | undefined;
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
  const code = `EVT${eventId}-${generateId().toUpperCase()}`;
  return code;
};

export const EventProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [registrations, setRegistrations] = useState<Registration[]>(mockRegistrations);

  const addEvent = (data: Omit<Event, "id" | "slug" | "registeredCount" | "createdAt">) => {
    const newEvent: Event = {
      ...data,
      id: generateId(),
      slug: generateSlug(data.title),
      registeredCount: 0,
      createdAt: new Date().toISOString(),
    };
    setEvents((prev) => [newEvent, ...prev]);
  };

  const updateEvent = (id: string, data: Partial<Event>) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...data } : e)));
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setRegistrations((prev) => prev.filter((r) => r.eventId !== id));
  };

  const addRegistration = (data: Omit<Registration, "id" | "qrCode" | "registeredAt" | "scans">) => {
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
  };

  const addScan = (registrationId: string, scannedBy: string) => {
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

    return {
      success: true,
      message: `Entry confirmed ✓ (Scan ${reg.scans.length + 1}${event.scanMode === "daily" ? `, Day scan ${todayScans.length + 1}/${event.maxScansPerDay || "∞"}` : ""})`,
      name: reg.name,
    };
  };

  const getEventRegistrations = (eventId: string) => registrations.filter((r) => r.eventId === eventId);
  const getEventById = (id: string) => events.find((e) => e.id === id);
  const getEventBySlug = (slug: string) => events.find((e) => e.slug === slug);

  return (
    <EventContext.Provider
      value={{
        events,
        registrations,
        addEvent,
        updateEvent,
        deleteEvent,
        addRegistration,
        addScan,
        getEventRegistrations,
        getEventById,
        getEventBySlug,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};
