/**
 * Fetch and download photos for remaining curated venues that still have Unsplash URLs.
 * Targets all venues in data.ts, regardless of city.
 */

const fs = require("fs");
const path = require("path");

// Load .env.local
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
    const envContents = fs.readFileSync(envPath, "utf-8");
    for (const line of envContents.split("\n")) {
        const match = line.match(/^([^#=]+)=(.*)$/);
        if (match) {
            process.env[match[1].trim()] = match[2].trim();
        }
    }
}

const API_KEY = process.env.GOOGLE_API_KEY;
const OUTPUT_DIR = path.join(__dirname, "..", "public", "images", "venues");

// ALL curated venues from data.ts that still have Unsplash URLs
const REMAINING_VENUES = [
    { id: "the-nines", name: "The Nines", address: "9 Great Jones St, New York, NY 10012" },
    { id: "lucien", name: "Lucien", address: "14 1st Ave, New York, NY 10009" },
    { id: "zero-bond", name: "Zero Bond", address: "0 Bond St, New York, NY 10012" },
    { id: "the-brothers-sushi-santa-monica", name: "The Brothers Sushi", address: "1151 2nd St, Santa Monica, CA 90403" },
    // LA
    { id: "chateau-marmont", name: "Chateau Marmont", address: "8221 Sunset Blvd, Los Angeles, CA 90046" },
    { id: "horses", name: "Horses restaurant", address: "7617 Sunset Blvd, Los Angeles, CA 90046" },
    { id: "gjelina", name: "Gjelina", address: "1429 Abbot Kinney Blvd, Venice, CA 90291" },
    { id: "tower-bar", name: "Tower Bar at Sunset Tower Hotel", address: "8358 Sunset Blvd, Los Angeles, CA 90069" },
    { id: "erewhon-beverly", name: "Erewhon", address: "339 N Beverly Dr, Beverly Hills, CA 90210" },
    { id: "the-edition-rooftop", name: "The Roof at Edition", address: "9040 Sunset Blvd, West Hollywood, CA 90069" },
    // London
    { id: "chiltern-firehouse", name: "Chiltern Firehouse", address: "1 Chiltern St, London W1U 7PA" },
    { id: "sessions-arts-club", name: "Sessions Arts Club", address: "24 Clerkenwell Green, London EC1R 0NA" },
    { id: "sketch", name: "Sketch London Gallery", address: "9 Conduit St, London W1S 2XG" },
    { id: "brilliant-corners", name: "Brilliant Corners", address: "470 Kingsland Rd, London E8 4AE" },
    { id: "connaught-bar", name: "The Connaught Bar", address: "Connaught, Carlos Pl, London W1K 2AL" },
    // NYC expansion
    { id: "chinese-tuxedo", name: "Chinese Tuxedo", address: "5 Doyers St, New York, NY 10013" },
    { id: "estela", name: "Estela", address: "47 E Houston St, New York, NY 10012" },
    { id: "gramercy-tavern", name: "Gramercy Tavern", address: "42 E 20th St, New York, NY 10003" },
    { id: "cote", name: "Cote Korean Steakhouse", address: "16 W 22nd St, New York, NY 10010" },
    { id: "minetta-tavern", name: "Minetta Tavern", address: "113 MacDougal St, New York, NY 10012" },
    { id: "bemelmans-bar", name: "Bemelmans Bar at The Carlyle", address: "35 E 76th St, New York, NY 10021" },
    // Brooklyn
    { id: "cecconis-dumbo", name: "Cecconi's Dumbo", address: "55 Water St, Brooklyn, NY 11201" },
    { id: "sisters", name: "Sisters Brooklyn", address: "900 Fulton St, Brooklyn, NY 11238" },
    { id: "grand-army", name: "Grand Army Bar", address: "336 State St, Brooklyn, NY 11217" },
    { id: "lucali", name: "Lucali", address: "575 Henry St, Brooklyn, NY 11231" },
    { id: "union-hall", name: "Union Hall", address: "702 Union St, Brooklyn, NY 11215" },
];

async function fetchPhoto(venue) {
    try {
        const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": API_KEY,
                "X-Goog-FieldMask": "places.id,places.displayName,places.photos"
            },
            body: JSON.stringify({
                textQuery: `${venue.name} ${venue.address}`,
                pageSize: 1
            })
        });

        const data = await response.json();
        if (data.error) return { ...venue, error: data.error.message };

        const place = data.places?.[0];
        if (place && place.photos && place.photos.length > 0) {
            const photoRef = place.photos[0].name;
            const photoUrl = `https://places.googleapis.com/v1/${photoRef}/media?maxHeightPx=800&maxWidthPx=800&key=${API_KEY}`;
            return { ...venue, photoUrl, googlePlaceId: place.id };
        }
        return { ...venue, error: "No photo found" };
    } catch (e) {
        return { ...venue, error: e.message };
    }
}

async function downloadPhoto(venue) {
    if (!venue.photoUrl) return null;

    try {
        const response = await fetch(venue.photoUrl, { redirect: "follow" });
        if (!response.ok) return null;

        const contentType = response.headers.get("content-type") || "";
        let ext = ".jpg";
        if (contentType.includes("png")) ext = ".png";
        else if (contentType.includes("webp")) ext = ".webp";

        const filename = `${venue.id}${ext}`;
        const filepath = path.join(OUTPUT_DIR, filename);

        const buffer = Buffer.from(await response.arrayBuffer());
        fs.writeFileSync(filepath, buffer);

        console.log(`  ✅ ${venue.name} → ${filename} (${Math.round(buffer.length / 1024)}KB)`);
        return `/images/venues/${filename}`;
    } catch (e) {
        console.log(`  ❌ ${venue.name}: ${e.message}`);
        return null;
    }
}

async function run() {
    if (!API_KEY) {
        console.error("Error: GOOGLE_API_KEY not set.");
        process.exit(1);
    }

    fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    console.log(`\n🔍 Fetching photos for ${REMAINING_VENUES.length} remaining curated venues...\n`);

    const mapping = {};
    for (const venue of REMAINING_VENUES) {
        process.stdout.write(`  Searching: ${venue.name}...`);
        const result = await fetchPhoto(venue);

        if (result.error) {
            console.log(` ⚠️  ${result.error}`);
            continue;
        }

        const localPath = await downloadPhoto(result);
        if (localPath) {
            mapping[venue.id] = localPath;
        }

        await new Promise(r => setTimeout(r, 150));
    }

    console.log(`\n✅ Downloaded ${Object.keys(mapping).length}/${REMAINING_VENUES.length} photos.\n`);

    // Update data.ts
    console.log("🔄 Updating data.ts...");
    let dataContent = fs.readFileSync(
        path.join(__dirname, "..", "src", "lib", "data.ts"),
        "utf-8"
    );
    let updated = 0;

    for (const [venueId, localPath] of Object.entries(mapping)) {
        const idEscaped = venueId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(
            `(id:\\s*"${idEscaped}"[\\s\\S]*?image:\\s*")([^"]*)(")`,
            "g" // Use global to catch duplicates (same venue appears in multiple places)
        );

        const newContent = dataContent.replace(regex, `$1${localPath}$3`);
        if (newContent !== dataContent) {
            dataContent = newContent;
            updated++;
        }
    }

    fs.writeFileSync(
        path.join(__dirname, "..", "src", "lib", "data.ts"),
        dataContent
    );
    console.log(`   ✅ Updated ${updated} venues in data.ts`);

    // Merge into main mapping
    const mainMappingPath = path.join(__dirname, "venue-photo-mapping.json");
    const mainMapping = JSON.parse(fs.readFileSync(mainMappingPath, "utf-8"));
    Object.assign(mainMapping, mapping);
    fs.writeFileSync(mainMappingPath, JSON.stringify(mainMapping, null, 2));

    console.log(`\n🎉 Done! Total photos in mapping: ${Object.keys(mainMapping).length}`);
}

run();
