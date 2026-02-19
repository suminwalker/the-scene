/**
 * Update data.ts and generated-data.ts to use local venue photos
 * instead of Unsplash stock images.
 * 
 * Reads the mapping from venue-photo-mapping.json and replaces
 * image URLs in both data files.
 */

const fs = require("fs");
const path = require("path");

const MAPPING_PATH = path.join(__dirname, "venue-photo-mapping.json");
const DATA_TS_PATH = path.join(__dirname, "..", "src", "lib", "data.ts");
const GENERATED_DATA_PATH = path.join(__dirname, "..", "src", "lib", "generated-data.ts");

const mapping = JSON.parse(fs.readFileSync(MAPPING_PATH, "utf-8"));

console.log(`📝 Loaded mapping with ${Object.keys(mapping).length} venue photos.\n`);

// --- Update generated-data.ts ---
console.log("🔄 Updating generated-data.ts...");
let generatedContent = fs.readFileSync(GENERATED_DATA_PATH, "utf-8");
let generatedUpdated = 0;

for (const [venueId, localPath] of Object.entries(mapping)) {
    // Only process Google Place IDs (generated venues)
    if (!venueId.startsWith("ChIJ")) continue;

    // Pattern: find the venue by its ID, then find its image field
    // The venue object has "id": "ChIJ..." followed eventually by "image": "..."
    const idEscaped = venueId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(
        `("id":\\s*"${idEscaped}"[\\s\\S]*?"image":\\s*")([^"]*)(")`,
        "m"
    );

    if (regex.test(generatedContent)) {
        generatedContent = generatedContent.replace(regex, `$1${localPath}$3`);
        generatedUpdated++;
    }
}

fs.writeFileSync(GENERATED_DATA_PATH, generatedContent);
console.log(`   ✅ Updated ${generatedUpdated} venues in generated-data.ts\n`);

// --- Update data.ts ---
console.log("🔄 Updating data.ts...");
let dataContent = fs.readFileSync(DATA_TS_PATH, "utf-8");
let dataUpdated = 0;

// For curated venues, we need to match by venue slug ID
const curatedMappings = {};
for (const [venueId, localPath] of Object.entries(mapping)) {
    if (!venueId.startsWith("ChIJ")) {
        curatedMappings[venueId] = localPath;
    }
}

for (const [venueId, localPath] of Object.entries(curatedMappings)) {
    const idEscaped = venueId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(
        `(id:\\s*"${idEscaped}"[\\s\\S]*?image:\\s*")([^"]*)(")`,
        "m"
    );

    if (regex.test(dataContent)) {
        dataContent = dataContent.replace(regex, `$1${localPath}$3`);
        dataUpdated++;
    }
}

fs.writeFileSync(DATA_TS_PATH, dataContent);
console.log(`   ✅ Updated ${dataUpdated} venues in data.ts\n`);

console.log(`🎉 Total: ${generatedUpdated + dataUpdated} venue images replaced with real photos!`);
