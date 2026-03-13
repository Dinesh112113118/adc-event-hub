import { createClient } from '@supabase/supabase-js';
import Papa from 'papaparse';

// Env variables are injected via node --env-file=.env.local
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const url = "https://docs.google.com/spreadsheets/d/1rX6OWzhZcwXqizfnIeGudPrD_EU7db7XfQF-UZDdqjI/export?format=csv";

async function run() {
    console.log("Fetching CSV...");
    const res = await fetch(url);
    const csvText = await res.text();

    const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
    const rows = parsed.data;
    console.log(`Parsed ${rows.length} participants.`);

    const eventId = "atc-project-m-inaug";

    const event = {
        id: eventId,
        title: "ATC Project M Inaguration event",
        slug: "atc-project-m-inaug",
        description: "Inaugural event of Project M from the Google Sheets registrations.",
        date: "2026-03-20T10:00:00Z",
        venue: "Main Auditorium",
        "maxCapacity": 500,
        "scanMode": "single",
        status: "published",
        "paymentRequired": false,
        "paymentCollectLater": false,
        "registeredCount": rows.length,
        "createdAt": new Date().toISOString()
    };

    console.log("Inserting event...");
    const { error: eventError } = await supabase.from('events').upsert([event]);
    if (eventError) {
        console.error("Error inserting event:", eventError);
        return;
    }
    console.log("Event inserted successfully.");

    const registrations = rows.map((row, idx) => {
        // Generate valid ISO string from typical google forms timestamp or fallback to now
        let regDate = new Date().toISOString();
        try {
            if (row["Timestamp"]) {
                const d = new Date(row["Timestamp"]);
                if (!isNaN(d.getTime())) regDate = d.toISOString();
            }
        } catch (e) { }

        return {
            id: `reg-${Date.now()}-${idx}`,
            "eventId": eventId,
            name: row["Full Name"] || "Unknown",
            email: row["Email Address"] || "unknown@example.com",
            phone: row[" Phone Number"] || row["Phone Number"] || "",
            department: row[" Branch / Department"] || "",
            year: row["Year of Study"] || "",
            "qrCode": `EVT-ATC-PROJM-${Date.now()}-${idx}`,
            "emailStatus": "pending",
            "paymentStatus": "free",
            "registeredAt": regDate
        };
    });

    console.log(`Inserting ${registrations.length} registrations...`);

    // Supabase has a limit on generic inserts, but 100-200 is fine in one go.
    const chunkSize = 200;
    for (let i = 0; i < registrations.length; i += chunkSize) {
        const chunk = registrations.slice(i, i + chunkSize);
        const { error: regError } = await supabase.from('registrations').insert(chunk);
        if (regError) {
            console.error(`Error inserting registrations chunk ${i}:`, regError);
        } else {
            console.log(`Successfully inserted block of ${chunk.length} registrations.`);
        }
    }

    console.log("Migration complete!");
}

run().catch(console.error);
