import Papa from 'papaparse';

const url = "https://docs.google.com/spreadsheets/d/1rX6OWzhZcwXqizfnIeGudPrD_EU7db7XfQF-UZDdqjI/export?format=csv";

async function run() {
    const res = await fetch(url);
    const csvText = await res.text();

    const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
    console.log("Headers:", JSON.stringify(parsed.meta.fields, null, 2));
    console.log("Row 1:", JSON.stringify(parsed.data[0], null, 2));
}

run().catch(console.error);
