
const API_KEY = process.env.GOOGLE_API_KEY;

const CURATED_VENUES = [
    { name: "The Nines", address: "9 Great Jones St, New York, NY 10012" },
    { name: "Fanelli Cafe", address: "94 Prince St, New York, NY 10012" },
    { name: "American Bar", address: "33 Greenwich Ave, New York, NY 10014" },
    { name: "Soho House", address: "29-35 9th Ave, New York, NY 10014" },
    { name: "Lucien", address: "14 1st Ave, New York, NY 10009" },
    { name: "Zero Bond", address: "0 Bond St, New York, NY 10012" },
    { name: "Ray’s", address: "177 Chrystie St, New York, NY 10002" },
    { name: "Soho Grand Hotel", address: "310 West Broadway, New York, NY 10013" },
    { name: "Mission Nightclub", address: "229 W 28th St, New York, NY 10001" },
    { name: "Emmett's On Grove", address: "39 Grove St, New York, NY 10014" },
    { name: "ART SoHo", address: "231 Hudson St, New York, NY 10013" },
    { name: "The Skylark", address: "200 W 39th St, New York, NY 10018" },
    { name: "Chateau Marmont", address: "8221 Sunset Blvd, Los Angeles, CA 90046" },
    { name: "Horses", address: "7617 Sunset Blvd, Los Angeles, CA 90046" },
    { name: "Gjelina", address: "1429 Abbot Kinney Blvd, Venice, CA 90291" },
    { name: "Tower Bar", address: "8358 Sunset Blvd, Los Angeles, CA 90069" },
    { name: "Erewhon (Beverly)", address: "339 N Beverly Dr, Beverly Hills, CA 90210" },
    { name: "The Roof at Edition", address: "9040 Sunset Blvd, West Hollywood, CA 90069" },
    { name: "Chiltern Firehouse", address: "1 Chiltern St, London W1U 7PA" },
    { name: "Sessions Arts Club", address: "24 Clerkenwell Green, London EC1R 0NA" },
    { name: "Sketch (Gallery)", address: "9 Conduit St, London W1S 2XG" },
    { name: "Brilliant Corners", address: "470 Kingsland Rd, London E8 4AE" },
    { name: "The Connaught Bar", address: "Connaught, Carlos Pl, London W1K 2AL" }
];

async function fetchPhotoForVenue(venue) {
    console.log(`Searching for: ${venue.name}...`);
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
        const place = data.places?.[0];

        if (place && place.photos && place.photos.length > 0) {
            const photoRef = place.photos[0].name;
            const photoUrl = `https://places.googleapis.com/v1/${photoRef}/media?maxHeightPx=1200&maxWidthPx=1200&key=${API_KEY}`;
            return {
                name: venue.name,
                id: place.id,
                photoUrl: photoUrl
            };
        }
        return { name: venue.name, error: "No photo found" };
    } catch (e) {
        return { name: venue.name, error: e.message };
    }
}

async function run() {
    if (!API_KEY) {
        console.error("Error: GOOGLE_API_KEY is not set.");
        return;
    }

    const results = [];
    for (const venue of CURATED_VENUES) {
        const result = await fetchPhotoForVenue(venue);
        results.push(result);
        // Small delay to be polite
        await new Promise(r => setTimeout(r, 100));
    }

    console.log("--- RESULTS ---");
    console.log(JSON.stringify(results, null, 2));
}

run();
