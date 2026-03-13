export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  venue: string;
  slug: string;
  maxCapacity: number;
  registeredCount: number;
  status: "draft" | "published" | "completed" | "cancelled";
  paymentRequired: boolean;
  paymentAmount?: number;
  paymentCollectLater: boolean;
  scanMode: "single" | "multiple" | "daily";
  maxScansPerDay?: number;
  totalDays?: number;
  createdAt: string;
  imageUrl?: string;
}

export interface Registration {
  id: string;
  eventId: string;
  name: string;
  email: string;
  phone: string;
  college?: string;
  department?: string;
  year?: string;
  qrCode: string;
  paymentStatus: "pending" | "paid" | "free" | "collect_later";
  registeredAt: string;
  scans: ScanRecord[];
  emailStatus: "pending" | "sent" | "failed" | "invalid";
}

export interface ScanRecord {
  id: string;
  registrationId: string;
  scannedAt: string;
  scannedBy: string;
  day?: number;
}

export interface User {
  id: string;
  username: string;
  role: "admin" | "scanner";
  name: string;
}

export interface TicketTemplate {
  eventName: string;
  tagline: string;
  date: string;
  time: string;
  venue: string;
  organizerName: string;
  footerText: string;
  primaryColor: string;
  showDepartment: boolean;
  showYear: boolean;
}

export const defaultTicketTemplate: TicketTemplate = {
  eventName: "Project-M Inaug",
  tagline: "Aliet Techpreneur Club presents",
  date: "March 14, 2026",
  time: "2:00 PM - 5:00 PM",
  venue: "Seminar Hall",
  organizerName: "Aliet Techpreneur Club",
  footerText: "Please carry this ticket for entry. Show the QR code at the venue.",
  primaryColor: "#3b82f6",
  showDepartment: true,
  showYear: true,
};

import { projectMRegistrations } from "@/data/projectm-registrations";

export const mockEvents: Event[] = [
  {
    id: "pm-inaug",
    title: "Project-M Inaug",
    description: "Inaugural event of Project-M by Aliet Techpreneur Club. Join us for an exciting launch!",
    date: "2026-03-14T14:00:00",
    endDate: "2026-03-14T17:00:00",
    venue: "Seminar Hall",
    slug: "project-m-inaug",
    maxCapacity: 150,
    registeredCount: 93,
    status: "published",
    paymentRequired: false,
    paymentCollectLater: false,
    scanMode: "single",
    createdAt: "2026-03-13T18:00:00",
  },
];

export const mockRegistrations: Registration[] = projectMRegistrations;
