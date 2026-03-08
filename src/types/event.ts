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

// Mock data for development
export const mockEvents: Event[] = [
  {
    id: "1",
    title: "TechTalk: AI & Future of Work",
    description: "Join us for an insightful session on how AI is reshaping the future of work. Industry experts will share their perspectives.",
    date: "2026-03-20T10:00:00",
    endDate: "2026-03-20T16:00:00",
    venue: "Main Auditorium, Block A",
    slug: "techtalk-ai-future",
    maxCapacity: 200,
    registeredCount: 147,
    status: "published",
    paymentRequired: false,
    paymentCollectLater: false,
    scanMode: "single",
    createdAt: "2026-03-01T10:00:00",
  },
  {
    id: "2",
    title: "Hackathon 2026",
    description: "48-hour hackathon challenging you to build innovative solutions. Prizes worth ₹50,000!",
    date: "2026-04-05T09:00:00",
    endDate: "2026-04-07T18:00:00",
    venue: "Innovation Lab, Block C",
    slug: "hackathon-2026",
    maxCapacity: 100,
    registeredCount: 82,
    status: "published",
    paymentRequired: true,
    paymentAmount: 200,
    paymentCollectLater: false,
    scanMode: "daily",
    maxScansPerDay: 1,
    totalDays: 3,
    createdAt: "2026-02-15T10:00:00",
  },
  {
    id: "3",
    title: "Web Dev Workshop",
    description: "Hands-on workshop covering React, TypeScript, and modern web development practices.",
    date: "2026-03-25T14:00:00",
    venue: "Computer Lab 3, Block B",
    slug: "webdev-workshop",
    maxCapacity: 50,
    registeredCount: 50,
    status: "published",
    paymentRequired: true,
    paymentAmount: 100,
    paymentCollectLater: true,
    scanMode: "single",
    createdAt: "2026-03-05T10:00:00",
  },
];

export const mockRegistrations: Registration[] = [
  {
    id: "r1",
    eventId: "1",
    name: "Rahul Kumar",
    email: "rahul@email.com",
    phone: "9876543210",
    college: "Aliet Engineering",
    department: "CSE",
    year: "3rd",
    qrCode: "EVT1-R001-RAHUL",
    paymentStatus: "free",
    registeredAt: "2026-03-10T14:30:00",
    scans: [],
  },
  {
    id: "r2",
    eventId: "1",
    name: "Priya Singh",
    email: "priya@email.com",
    phone: "9876543211",
    college: "Aliet Engineering",
    department: "ECE",
    year: "2nd",
    qrCode: "EVT1-R002-PRIYA",
    paymentStatus: "free",
    registeredAt: "2026-03-11T09:15:00",
    scans: [{ id: "s1", registrationId: "r2", scannedAt: "2026-03-20T10:05:00", scannedBy: "scanner1" }],
  },
];
