
// Scripts/migrate_venues.js
// Run with: node scripts/migrate_venues.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');



// Manually parse .env.local because 'dotenv' is not installed
try {
    const envPath = path.resolve(__dirname, '../.env.local');
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
    console.log('Loaded environment variables from .env.local');
} catch (e) {
    console.warn('Could not read .env.local, checking process.env directly...');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase Environment Variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Simplified extracting of data from file since we can't import TS directly in JS script
// We will match the shape of CURATED_PLACES manually for now or read json if we extracted it.
// For robust migration, we'd compile TS or use ts-node.
// Here we assume "venues" data structure based on inspection.

const venues = [
    {
        id: "the-nines",
        name: "The Nines",
        city: "nyc",
        category: "Lounge / Piano Bar",
        neighborhood: "NoHo",
        price: "$$$$",
        age: ["30-34", "35-39", "bars-30s", "mixed-bars", "date-night", "daytime-30s", "hidden-gems"],
        tags: ["Impressive Night Out", "Sophisticated Drinks", "Cocktails"],
        image: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?q=80&w=1200",
        address: "9 Great Jones St, New York, NY 10012",
        rating: 4.8
    },
    {
        id: "fanelli-cafe",
        name: "Fanelli Cafe",
        city: "nyc",
        category: "Dive-ish Bar",
        neighborhood: "SoHo",
        price: "$$",
        age: ["25-29", "30-34", "bars-20s", "bars-30s", "mixed-bars", "daytime-mid-20s", "group-hangouts"],
        tags: ["People Watching", "Casual beers"],
        image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1200",
        address: "94 Prince St, New York, NY 10012",
        rating: 4.5
    },
    {
        id: "american-bar",
        name: "American Bar",
        city: "nyc",
        category: "Restaurant/Bar",
        neighborhood: "West Village",
        price: "$$$",
        age: ["25-29", "30-34", "bars-20s", "bars-30s", "group-hangouts", "daytime-30s", "mixed-bars"],
        tags: ["Networking", "Lively Dinner", "Cocktails"],
        image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1200",
        address: "33 Greenwich Ave, New York, NY 10014",
        rating: 4.2
    },
    {
        id: "soho-house-meatpacking",
        name: "Soho House",
        city: "nyc",
        category: "Lounge",
        neighborhood: "Meatpacking District",
        price: "$$$",
        age: ["30-34", "35-39", "rooftops-30s", "mixed-rooftops", "work-from-bar", "daytime-30s"],
        tags: ["Impressive social", "Group drinks"],
        image: "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?q=80&w=1200",
        address: "29-35 9th Ave, New York, NY 10014",
        rating: 4.4
    },
    {
        id: "lucien",
        name: "Lucien",
        city: "nyc",
        category: "French Bistro",
        neighborhood: "East Village",
        price: "$$$",
        age: ["21-24", "25-29", "bars-20s", "daytime-early-20s", "mixed-bars", "date-night", "group-hangouts"],
        tags: ["Birthday dinner", "Event dining", "Wine"],
        image: "https://images.unsplash.com/photo-1550966871-3ed3c47e2ce2?q=80&w=1200",
        address: "14 1st Ave, New York, NY 10009",
        rating: 3.8
    },
    {
        id: "zero-bond",
        name: "Zero Bond",
        city: "nyc",
        category: "Members Club",
        neighborhood: "NoHo",
        price: "$$$$",
        age: ["30-34", "35-39", "hidden-gems", "bars-30s", "clubs", "late-night"],
        tags: ["Late night party", "Exclusive access"],
        image: "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?q=80&w=1200",
        address: "0 Bond St, New York, NY 10012",
        rating: 4.5
    },
    {
        id: "rays",
        name: "Ray’s",
        city: "nyc",
        category: "Dive Bar",
        neighborhood: "Lower East Side",
        price: "$$",
        age: ["21-24", "25-29", "bars-20s", "late-night", "mixed-bars", "daytime-early-20s", "group-hangouts"],
        tags: ["Late night fun", "Meeting someone wild", "Happy Hour"],
        image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1200",
        address: "177 Chrystie St, New York, NY 10002",
        rating: 4.0
    },
    {
        id: "soho-grand-hotel",
        name: "Soho Grand Hotel",
        city: "nyc",
        category: "Hotel / Bar / Restaurant",
        neighborhood: "SoHo",
        price: "$$$$",
        age: ["30-34", "35-39", "bars-30s", "mixed-bars", "late-night", "work-from-bar", "hidden-gems", "daytime-30s"],
        tags: ["Impressive Night Out", "Late Night Fun", "Live Jazz"],
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200",
        address: "310 West Broadway, New York, NY 10013",
        rating: 4.6
    },
    {
        id: "mission-nightclub",
        name: "Mission Nightclub",
        city: "nyc",
        category: "Nightclub",
        neighborhood: "Chelsea / Garment District",
        price: "$$$",
        age: ["21-24", "25-29", "clubs", "bars-20s", "late-night"],
        tags: ["Dancing", "Bottle Service", "Late Night party"],
        image: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1200",
        address: "229 W 28th St, New York, NY 10001",
        rating: 4.5
    },
    {
        id: "emmetts-on-grove",
        name: "Emmett's On Grove",
        city: "nyc",
        category: "Restaurant / Pizza",
        neighborhood: "West Village",
        price: "$$$",
        age: ["25-29", "30-34", "35-39", "group-hangouts", "mixed-bars", "daytime-mid-20s"],
        tags: ["Dinner Party Vibe", "Casual Dinner", "Special Gathering"],
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1200",
        address: "39 Grove St, New York, NY 10014",
        rating: 4.7
    },
    {
        id: "art-soho",
        name: "ART SoHo",
        city: "nyc",
        category: "Rooftop Bar",
        neighborhood: "SoHo",
        price: "$$",
        age: ["21-24", "25-29", "rooftops-20s", "mixed-rooftops", "late-night"],
        tags: ["Dancing", "Views"],
        image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1200",
        address: "231 Hudson St, New York, NY 10013",
        rating: 4.3
    },
    {
        id: "the-skylark",
        name: "The Skylark",
        city: "nyc",
        category: "Rooftop Lounge",
        neighborhood: "Midtown",
        price: "$$$",
        age: ["30-34", "35-39", "rooftops-30s", "mixed-rooftops", "date-night"],
        tags: ["Impressive Drinks", "Views", "Cocktails"],
        image: "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?q=80&w=1200",
        address: "200 W 39th St, New York, NY 10018",
        rating: 4.4
    },
    {
        id: "chateau-marmont",
        name: "Chateau Marmont",
        city: "la",
        category: "Hotel Bar",
        neighborhood: "West Hollywood",
        price: "$$$$",
        age: ["30-34", "35-39", "bars-30s", "mixed-bars", "daytime-30s", "hidden-gems"],
        tags: ["Celebrity Spotting", "Power Lunch"],
        image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=1200",
        address: "8221 Sunset Blvd, Los Angeles, CA 90046",
        rating: 4.6
    },
    {
        id: "horses",
        name: "Horses",
        city: "la",
        category: "Bistro",
        neighborhood: "Hollywood",
        price: "$$$",
        age: ["25-29", "30-34", "bars-20s", "bars-30s", "mixed-bars", "date-night"],
        tags: ["Dinner Party Vibe", "First Date"],
        image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200",
        address: "7617 Sunset Blvd, Los Angeles, CA 90046",
        rating: 4.3
    },
    {
        id: "erewhon-beverly",
        name: "Erewhon (Beverly)",
        city: "la",
        category: "Market / Cafe",
        neighborhood: "Beverly Hills",
        price: "$$$",
        age: ["21-24", "25-29", "daytime-early-20s", "daytime-mid-20s", "group-hangouts"],
        tags: ["Post-workout", "See and be Seen"],
        image: "https://images.unsplash.com/photo-1577366366530-5bb287b94998?q=80&w=1200",
        address: "339 N Beverly Dr, Beverly Hills, CA 90210",
        rating: 4.0
    },
    {
        id: "chiltern-firehouse",
        name: "Chiltern Firehouse",
        city: "ldn",
        category: "Restaurant / Hotel",
        neighborhood: "Marylebone",
        price: "$$$$",
        age: ["30-34", "35-39", "bars-30s", "mixed-bars", "date-night", "daytime-30s"],
        tags: ["Impressive Date", "Celebrity Spotting"],
        image: "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?q=80&w=1200",
        address: "1 Chiltern St, London W1U 7PA",
        rating: 4.6
    },
    {
        id: "sketch",
        name: "Sketch (Gallery)",
        city: "ldn",
        category: "Tea Room / Lounge",
        neighborhood: "Mayfair",
        price: "$$$$",
        age: ["21-24", "25-29", "30-34", "35-39", "daytime-30s", "daytime-mid-20s", "mixed-bars"],
        tags: ["Afternoon Tea", "Photo Op"],
        image: "https://images.unsplash.com/photo-1547620615-5d9c6e5a5286?q=80&w=1200",
        address: "9 Conduit St, London W1S 2XG",
        rating: 4.4
    }
];

async function migrate() {
    console.log('Starting migration for', venues.length, 'venues...');

    // await supabase.from('venues').delete().neq('id', '00000000-0000-0000-0000-000000000000'); 

    try {
        for (const v of venues) {
            // Mock some seasonal/time data based on category for demo
            let seasonal_tags = {};
            let time_suitability = { morning: 0.1, afternoon: 0.5, evening: 0.9, late_night: 0.6 };

            if (v.category.toLowerCase().includes('rooftop')) {
                seasonal_tags = { summer: ['Rooftop', 'Views'], spring: ['Outdoor'] };
                time_suitability = { morning: 0, afternoon: 0.8, evening: 1.0, late_night: 0.7 };
            } else if (v.category.toLowerCase().includes('coffee') || v.category.toLowerCase().includes('cafe')) {
                seasonal_tags = { all_year: ['Coffee'] };
                time_suitability = { morning: 1.0, afternoon: 0.8, evening: 0.2, late_night: 0 };
            } else if (v.category.toLowerCase().includes('dive')) {
                seasonal_tags = { all_year: ['Cozy'] };
                time_suitability = { morning: 0, afternoon: 0.3, evening: 0.9, late_night: 1.0 };
            }

            const { error } = await supabase.from('venues').insert({
                name: v.name,
                city: v.city,
                neighborhood: v.neighborhood,
                category: v.category,
                price_point: v.price,
                age_demographic: v.age,
                tags: v.tags, // mapping intent/tags to tags
                image_url: v.image,
                address: v.address,
                seasonal_tags: seasonal_tags,
                time_suitability: time_suitability
            });

            if (error) {
                console.error(`Failed to insert ${v.name}:`, error.message);
            } else {
                console.log(`Inserted: ${v.name}`);
            }
        }

    } catch (e) {
        console.error('Migration crashed:', e);
        process.exit(1);
    }
    console.log('Migration complete!');
    process.exit(0);
}

console.log("--> SCRIPT STARTED: migrate_venues.js <--");
migrate();
console.log("--> SCRIPT FINISHED: migrate_venues.js <--");
