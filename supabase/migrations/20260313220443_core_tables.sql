CREATE TABLE events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL,
  "endDate" TEXT,
  venue TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  "maxCapacity" INTEGER NOT NULL,
  "registeredCount" INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL,
  "paymentRequired" BOOLEAN NOT NULL DEFAULT false,
  "paymentAmount" INTEGER,
  "paymentCollectLater" BOOLEAN NOT NULL DEFAULT false,
  "scanMode" TEXT NOT NULL,
  "maxScansPerDay" INTEGER,
  "totalDays" INTEGER,
  "createdAt" TEXT NOT NULL,
  "imageUrl" TEXT
);

CREATE TABLE registrations (
  id TEXT PRIMARY KEY,
  "eventId" TEXT REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  college TEXT,
  department TEXT,
  year TEXT,
  "qrCode" TEXT UNIQUE NOT NULL,
  "paymentStatus" TEXT NOT NULL DEFAULT 'free',
  "emailStatus" TEXT NOT NULL DEFAULT 'pending',
  "registeredAt" TEXT NOT NULL
);

CREATE TABLE scan_records (
  id TEXT PRIMARY KEY,
  "registrationId" TEXT REFERENCES registrations(id) ON DELETE CASCADE NOT NULL,
  "scannedAt" TEXT NOT NULL,
  "scannedBy" TEXT NOT NULL,
  day INTEGER
);

-- Turn off Row Level Security (RLS) for admin public access
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE registrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE scan_records DISABLE ROW LEVEL SECURITY;
