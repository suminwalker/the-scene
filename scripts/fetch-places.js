
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

// NYC Targeted Neighborhoods to hit 1000+ places
const NYC_NEIGHBORHOODS = [
    // Manhattan
    "SoHo", "West Village", "East Village", "Lower East Side", "Tribeca",
    "Chinatown", "Little Italy", "NoHo", "Nolita", "Greenwich Village",
    "Chelsea", "Meatpacking District", "Hell's Kitchen", "Flatiron", "Gramercy",
    "Midtown", "Upper East Side", "Upper West Side", "Harlem", "Financial District",

    // Brooklyn
    "Williamsburg", "Greenpoint", "Bushwick", "DUMBO", "Brooklyn Heights",
    "Cobble Hill", "Boerum Hill", "Carroll Gardens", "Park Slope", "Fort Greene",
    "Clinton Hill", "Bed-Stuy", "Red Hook",

    // Queens
    "Astoria", "Long Island City", "Sunnyside", "Ridgewood"
];

const SEARCH_TERMS = [
    "iconic bars",
    "legendary restaurants",
    "michelin star restaurants",
    "best cocktail lounges",
    "historic taverns",
    "trendy hotspots",
    "celebrity favorite spots",
    "james beard restaurants",
    "it' bars and restaurants",
    "best rooftops nyc",
    "hidden speakeasies",
    "exclusive social clubs"
];

const API_KEY = process.env.GOOGLE_API_KEY;

// Rate limiting delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

async function fetchPlacesForQuery(query) {
    console.log(`Fetching: ${query}...`);
    try {
        const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": API_KEY,
                "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.websiteUri,places.nationalPhoneNumber,places.photos,places.types,places.editorialSummary,places.priceLevel,places.rating,places.userRatingCount"
            },
            body: JSON.stringify({
                textQuery: query,
                pageSize: 20
            })
        });

        const data = await response.json();
        return data.places || [];
    } catch (e) {
        console.error(`Check failed for ${query}:`, e);
        return [];
    }
}

function transformPlace(apiPlace, neighborhood) {
    if (!apiPlace) return null;

    // STRICT VALIDATION
    if (!apiPlace.nationalPhoneNumber) return null;
    if (!apiPlace.websiteUri) return null;
    if (!apiPlace.photos || apiPlace.photos.length === 0) return null;

    const photoRef = apiPlace.photos[0].name;
    const photoUrl = `https://places.googleapis.com/v1/${photoRef}/media?maxHeightPx=1200&maxWidthPx=1200&key=${API_KEY}`;

    // Map Price
    let price = "$$";
    if (apiPlace.priceLevel === "PRICE_LEVEL_EXPENSIVE") price = "$$$";
    if (apiPlace.priceLevel === "PRICE_LEVEL_VERY_EXPENSIVE") price = "$$$$";
    if (apiPlace.priceLevel === "PRICE_LEVEL_INEXPENSIVE") price = "$";

    // UPDATED Categories per User Request
    const VIBES = ["Low-key", "High-Energy", "Classy", "Cozy", "Loud", "Divey-Cool"];
    const CROWDS = ["Young Professional", "Intellectual", "Creative", "Edgy", "International"];
    const INTENTS = ["Group Fun", "Meet New People", "Dancing"];
    const AGES = ["20s", "30s", "40s"];

    // Basic heuristic for Time/Season
    let timeOfDay = ["Evening", "Late Night"];
    let season = ["All Year"];

    // If "cafe" or "bakery" or "park" -> add Morning/Afternoon
    const lowerTypes = apiPlace.types ? apiPlace.types.join(" ").toLowerCase() : "";
    if (lowerTypes.includes("cafe") || lowerTypes.includes("coffee") || lowerTypes.includes("bakery") || lowerTypes.includes("breakfast")) {
        timeOfDay = ["Morning", "Afternoon"];
        season = ["All Year"];
    }
    if (lowerTypes.includes("park") || lowerTypes.includes("garden")) {
        timeOfDay = ["Morning", "Afternoon"];
        season = ["Spring", "Summer", "Fall"];
    }
    if (lowerTypes.includes("rooftop")) {
        season = ["Spring", "Summer"];
    }

    return {
        id: apiPlace.id,
        name: apiPlace.displayName?.text || "Unknown",
        city: "nyc", // Force NYC for this batch
        category: "Restaurant/Bar",
        neighborhood: neighborhood, // Use the query neighborhood
        price: price,
        crowd: [pick(CROWDS), pick(CROWDS)],
        vibe: [pick(VIBES), pick(VIBES)],
        age: pick(AGES),
        season: season,
        timeOfDay: timeOfDay,
        intent: [pick(INTENTS)],
        editorial: apiPlace.editorialSummary?.text || "A popular local spot.",
        image: photoUrl,
        address: apiPlace.formattedAddress,
        phone: apiPlace.nationalPhoneNumber,
        website: apiPlace.websiteUri,
        rating: apiPlace.rating || 4.0,
        reviews: []
    };
}

async function run() {
    console.log("Starting NYC Deep Dive Ingestion (Target: 1000+)...");
    let allPlaces = [];
    let placeIds = new Set();

    for (const hood of NYC_NEIGHBORHOODS) {
        for (const term of SEARCH_TERMS) {
            // Rate limit
            await delay(100);

            const query = `${term} in ${hood}, New York City`;
            const places = await fetchPlacesForQuery(query);

            for (const p of places) {
                if (placeIds.has(p.id)) continue; // Dedup

                const transformed = transformPlace(p, hood);
                if (transformed) {
                    allPlaces.push(transformed);
                    placeIds.add(p.id);
                }
            }
        }
        console.log(`  > ${hood} complete. Total valid unique places: ${allPlaces.length}`);
    }

    console.log(`Total Places Fetched: ${allPlaces.length}`);

    // Write to file
    const outputContent = `
import { Place } from "./data";

export const GENERATED_PLACES: Place[] = ${JSON.stringify(allPlaces, null, 2)};
    `;

    fs.writeFileSync(path.join(__dirname, '../src/lib/generated-data.ts'), outputContent);
    console.log("Done! Written to src/lib/generated-data.ts");
}

run();
