/**
 * Fetch real venue photos for ALL NYC venues (Manhattan + Brooklyn)
 * from both data.ts and generated-data.ts
 * 
 * Uses Google Place IDs directly for generated venues (much faster).
 * Uses text search for curated venues.
 * Downloads all photos to /public/images/venues/
 * 
 * Usage: node scripts/fetch-venue-photos.js
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

// Step 1: Extract ALL NYC venues from generated-data.ts
function extractGeneratedNYCVenues() {
    const filePath = path.join(__dirname, "..", "src", "lib", "generated-data.ts");
    const content = fs.readFileSync(filePath, "utf-8");

    const venues = [];
    // Each venue is a JSON-like object — extract id, name, address, city
    const venueRegex = /"id":\s*"([^"]+)",\s*\n\s*"name":\s*"([^"]+)",\s*\n\s*"city":\s*"([^"]+)"/g;
    const addressRegex = /"address":\s*"([^"]+)"/g;

    let match;
    const ids = [];
    const names = [];
    const cities = [];
    while ((match = venueRegex.exec(content)) !== null) {
        ids.push(match[1]);
        names.push(match[2]);
        cities.push(match[3]);
    }

    const addresses = [];
    while ((match = addressRegex.exec(content)) !== null) {
        addresses.push(match[1]);
    }

    for (let i = 0; i < ids.length; i++) {
        if (cities[i] === "nyc") {
            // Generated venues already have Google Place IDs (ChIJ...)
            venues.push({
                id: ids[i],
                name: names[i],
                address: addresses[i] || "",
                isGooglePlaceId: ids[i].startsWith("ChIJ")
            });
        }
    }

    return venues;
}

// Step 2: Curated venues from data.ts (NYC only)
const CURATED_NYC_VENUES = [
    { id: "the-nines", name: "The Nines", address: "9 Great Jones St, New York, NY 10012" },
    { id: "fanelli-cafe", name: "Fanelli Cafe", address: "94 Prince St, New York, NY 10012" },
    { id: "american-bar", name: "American Bar", address: "33 Greenwich Ave, New York, NY 10014" },
    { id: "soho-house-meatpacking", name: "Soho House", address: "29-35 9th Ave, New York, NY 10014" },
    { id: "lucien", name: "Lucien", address: "14 1st Ave, New York, NY 10009" },
    { id: "zero-bond", name: "Zero Bond", address: "0 Bond St, New York, NY 10012" },
    { id: "rays", name: "Ray's", address: "177 Chrystie St, New York, NY 10002" },
    { id: "soho-grand-hotel", name: "Soho Grand Hotel", address: "310 West Broadway, New York, NY 10013" },
    { id: "mission-nightclub", name: "Mission Nightclub", address: "229 W 28th St, New York, NY 10001" },
    { id: "emmetts-on-grove", name: "Emmett's On Grove", address: "39 Grove St, New York, NY 10014" },
    { id: "art-soho", name: "ART SoHo", address: "231 Hudson St, New York, NY 10013" },
    { id: "the-skylark", name: "The Skylark", address: "200 W 39th St, New York, NY 10018" },
    { id: "mary-os", name: "Mary O's", address: "32 Avenue A, New York, NY 10009" },
    { id: "corto", name: "Corto", address: "357 Nostrand Ave, Brooklyn, NY 11216" },
    { id: "ludlow-coffee-supply", name: "Ludlow Coffee Supply", address: "176 Ludlow St, New York, NY 10002" },
    { id: "chinese-tuxedo", name: "Chinese Tuxedo", address: "5 Doyers St, New York, NY 10013" },
    { id: "estela", name: "Estela", address: "47 E Houston St, New York, NY 10012" },
    { id: "gramercy-tavern", name: "Gramercy Tavern", address: "42 E 20th St, New York, NY 10003" },
    { id: "cote", name: "Cote Korean Steakhouse", address: "16 W 22nd St, New York, NY 10010" },
    { id: "minetta-tavern", name: "Minetta Tavern", address: "113 MacDougal St, New York, NY 10012" },
    { id: "bemelmans-bar", name: "Bemelmans Bar", address: "35 E 76th St, New York, NY 10021" },
    { id: "laser-wolf", name: "Laser Wolf", address: "97 Wythe Ave, Brooklyn, NY 11249" },
    { id: "fourfivesix", name: "FourFiveSix", address: "199 Richardson St, Brooklyn, NY 11222" },
    { id: "house-of-yes", name: "House of Yes", address: "2 Wyckoff Ave, Brooklyn, NY 11237" },
    { id: "bernies", name: "Bernie's", address: "332 Driggs Ave, Brooklyn, NY 11222" },
    { id: "cecconis-dumbo", name: "Cecconi's Dumbo", address: "55 Water St, Brooklyn, NY 11201" },
    { id: "miss-ada", name: "Miss Ada", address: "184 Dekalb Ave, Brooklyn, NY 11205" },
    { id: "sisters", name: "Sisters", address: "900 Fulton St, Brooklyn, NY 11238" },
    { id: "grand-army", name: "Grand Army", address: "336 State St, Brooklyn, NY 11217" },
    { id: "lucali", name: "Lucali", address: "575 Henry St, Brooklyn, NY 11231" },
    { id: "union-hall", name: "Union Hall", address: "702 Union St, Brooklyn, NY 11215" },
];

// Fetch photo via Google Place ID (for generated venues)
async function fetchPhotoByPlaceId(venue) {
    try {
        const response = await fetch(
            `https://places.googleapis.com/v1/places/${venue.id}`,
            {
                headers: {
                    "X-Goog-Api-Key": API_KEY,
                    "X-Goog-FieldMask": "id,displayName,photos"
                }
            }
        );

        const data = await response.json();

        if (data.error) {
            return { ...venue, error: data.error.message };
        }

        if (data.photos && data.photos.length > 0) {
            const photoRef = data.photos[0].name;
            const photoUrl = `https://places.googleapis.com/v1/${photoRef}/media?maxHeightPx=800&maxWidthPx=800&key=${API_KEY}`;
            return { ...venue, photoUrl };
        }
        return { ...venue, error: "No photo found" };
    } catch (e) {
        return { ...venue, error: e.message };
    }
}

// Fetch photo via text search (for curated venues without Place IDs)
async function fetchPhotoBySearch(venue) {
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

        if (data.error) {
            return { ...venue, error: data.error.message };
        }

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

// Download photo to local filesystem
async function downloadPhoto(venue, fileId) {
    if (!venue.photoUrl) return null;

    try {
        const response = await fetch(venue.photoUrl, { redirect: "follow" });
        if (!response.ok) return null;

        const contentType = response.headers.get("content-type") || "";
        let ext = ".jpg";
        if (contentType.includes("png")) ext = ".png";
        else if (contentType.includes("webp")) ext = ".webp";

        const filename = `${fileId}${ext}`;
        const filepath = path.join(OUTPUT_DIR, filename);

        const buffer = Buffer.from(await response.arrayBuffer());
        fs.writeFileSync(filepath, buffer);

        return `/images/venues/${filename}`;
    } catch (e) {
        return null;
    }
}

// Process venues in batches to avoid rate limits
async function processBatch(venues, batchNum, totalBatches, fetchFn) {
    const results = [];
    for (let i = 0; i < venues.length; i++) {
        const venue = venues[i];
        const globalIdx = batchNum * venues.length + i + 1;
        process.stdout.write(
            `\r  [${globalIdx}/${totalBatches}] ${venue.name.substring(0, 40).padEnd(40)}`
        );

        const result = await fetchFn(venue);
        results.push(result);

        // Rate limiting: 100ms between requests
        await new Promise(r => setTimeout(r, 100));
    }
    return results;
}

async function run() {
    if (!API_KEY) {
        console.error("Error: GOOGLE_API_KEY is not set.");
        process.exit(1);
    }

    fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    // 1. Extract generated NYC venues
    console.log("\n📋 Extracting NYC venues from generated-data.ts...");
    const generatedVenues = extractGeneratedNYCVenues();
    console.log(`   Found ${generatedVenues.length} generated NYC venues`);

    // 2. Combine with curated venues (dedup by name)
    const generatedNames = new Set(generatedVenues.map(v => v.name.toLowerCase()));
    const uniqueCurated = CURATED_NYC_VENUES.filter(
        v => !generatedNames.has(v.name.toLowerCase())
    );
    console.log(`   Found ${CURATED_NYC_VENUES.length} curated NYC venues (${uniqueCurated.length} unique)`);

    const totalVenues = generatedVenues.length + uniqueCurated.length;
    console.log(`   Total unique NYC venues: ${totalVenues}\n`);

    // 3. Fetch photos — generated venues use Place ID lookup (faster/cheaper)
    console.log(`🔍 Fetching photos for ${generatedVenues.length} generated venues (by Place ID)...`);
    const generatedResults = [];
    for (let i = 0; i < generatedVenues.length; i++) {
        const venue = generatedVenues[i];
        process.stdout.write(
            `\r  [${i + 1}/${generatedVenues.length}] ${venue.name.substring(0, 45).padEnd(45)}`
        );
        const result = await fetchPhotoByPlaceId(venue);
        generatedResults.push(result);
        await new Promise(r => setTimeout(r, 80));
    }
    console.log("\n");

    // 4. Fetch photos for curated venues (text search)
    console.log(`🔍 Fetching photos for ${uniqueCurated.length} curated venues (by text search)...`);
    const curatedResults = [];
    for (let i = 0; i < uniqueCurated.length; i++) {
        const venue = uniqueCurated[i];
        process.stdout.write(
            `\r  [${i + 1}/${uniqueCurated.length}] ${venue.name.substring(0, 45).padEnd(45)}`
        );
        const result = await fetchPhotoBySearch(venue);
        curatedResults.push(result);
        await new Promise(r => setTimeout(r, 100));
    }
    console.log("\n");

    // 5. Download all photos
    const allResults = [...generatedResults, ...curatedResults];
    const withPhotos = allResults.filter(r => r.photoUrl);
    const failed = allResults.filter(r => r.error);

    console.log(`📥 Downloading ${withPhotos.length} photos...\n`);

    const mapping = {}; // id → local path
    for (let i = 0; i < withPhotos.length; i++) {
        const venue = withPhotos[i];
        // Sanitize filename: use venue id, replacing special chars
        const fileId = venue.id.replace(/[^a-zA-Z0-9_-]/g, "_");
        process.stdout.write(
            `\r  [${i + 1}/${withPhotos.length}] Downloading ${venue.name.substring(0, 40).padEnd(40)}`
        );

        const localPath = await downloadPhoto(venue, fileId);
        if (localPath) {
            mapping[venue.id] = localPath;
        }
        await new Promise(r => setTimeout(r, 50));
    }

    console.log(`\n\n✅ Successfully downloaded ${Object.keys(mapping).length}/${totalVenues} venue photos.`);

    // 6. Save mapping
    const mappingPath = path.join(__dirname, "venue-photo-mapping.json");
    fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));
    console.log(`📝 Mapping saved to: ${mappingPath}`);

    if (failed.length > 0) {
        console.log(`\n⚠️  ${failed.length} venues had no photo available.`);
        // Only show first 10
        failed.slice(0, 10).forEach(f => console.log(`   - ${f.name}: ${f.error}`));
        if (failed.length > 10) console.log(`   ... and ${failed.length - 10} more`);
    }
}

run();
