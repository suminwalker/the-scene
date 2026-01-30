import { City } from "@/lib/city-context";
import { GENERATED_PLACES } from "./generated-data";

export type Review = {
    id: string;
    author: string;
    rating: number;
    text: string;
    date: string;
    vibe?: string[];
    crowd?: string[];
    attire?: string[];
};

export type Place = {
    id: string;
    name: string;
    city: City;
    category: string;
    neighborhood: string;
    price: string;
    crowd: string[];
    vibe: string[];
    age?: string[];
    season?: string[];
    timeOfDay?: string[];
    intent: string[];
    editorial: string;
    image: string;
    address: string;
    phone: string;
    website: string;
    rating: number;
    reviews: Review[];
};

export const CURATED_PLACES: Place[] = [
    // --- NYC ---
    {
        id: "the-nines",
        name: "The Nines",
        city: "nyc",
        category: "Lounge / Piano Bar",
        neighborhood: "NoHo",
        price: "$$$$",
        crowd: [],
        vibe: [],
        age: ["30-34", "35-39", "bars-30s", "mixed-bars", "date-night", "daytime-30s", "hidden-gems"],
        intent: ["Impressive Night Out", "Sophisticated Drinks", "Cocktails"],
        editorial: "",
        image: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?q=80&w=1200",
        address: "9 Great Jones St, New York, NY 10012",
        phone: "(212) 421-5575",
        website: "https://ninesnyc.com",
        rating: 4.8,
        reviews: []
    },
    {
        id: "fanelli-cafe",
        name: "Fanelli Cafe",
        city: "nyc",
        category: "Dive-ish Bar",
        neighborhood: "SoHo",
        price: "$$",
        crowd: [],
        vibe: [],
        age: ["25-29", "30-34", "bars-20s", "bars-30s", "mixed-bars", "daytime-mid-20s", "group-hangouts"],
        intent: ["People Watching", "Casual beers"],
        editorial: "",
        image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1200", // Busy outdoor cafe
        address: "94 Prince St, New York, NY 10012",
        phone: "(212) 226-9412",
        website: "https://fanellicafe.nyc",
        rating: 4.5,
        reviews: []
    },
    {
        id: "american-bar",
        name: "American Bar",
        city: "nyc",
        category: "Restaurant/Bar",
        neighborhood: "West Village",
        price: "$$$",
        crowd: [],
        vibe: [],
        age: ["25-29", "30-34", "bars-20s", "bars-30s", "group-hangouts", "daytime-30s", "mixed-bars"],
        intent: ["Networking", "Lively Dinner", "Cocktails"],
        editorial: "",
        image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1200", // Elegant cocktail
        address: "33 Greenwich Ave, New York, NY 10014",
        phone: "(212) 888-8888",
        website: "https://americanbarnyc.com",
        rating: 4.2,
        reviews: []
    },
    {
        id: "soho-house-meatpacking",
        name: "Soho House",
        city: "nyc",
        category: "Lounge",
        neighborhood: "Meatpacking District",
        price: "$$$",
        crowd: [],
        vibe: [],
        age: ["30-34", "35-39", "rooftops-30s", "mixed-rooftops", "work-from-bar", "daytime-30s"],
        intent: ["Impressive social", "Group drinks"],
        editorial: "",
        image: "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?q=80&w=1200", // Rooftop pool vibe
        address: "29-35 9th Ave, New York, NY 10014",
        phone: "(212) 627-9800",
        website: "https://sohohouse.com",
        rating: 4.4,
        reviews: []
    },
    {
        id: "lucien",
        name: "Lucien",
        city: "nyc",
        category: "French Bistro",
        neighborhood: "East Village",
        price: "$$$",
        crowd: [],
        vibe: [],
        age: ["21-24", "25-29", "bars-20s", "daytime-early-20s", "mixed-bars", "date-night", "group-hangouts"],
        intent: ["Birthday dinner", "Event dining", "Wine"],
        editorial: "",
        image: "https://images.unsplash.com/photo-1550966871-3ed3c47e2ce2?q=80&w=1200", // Busy bistro
        address: "14 1st Ave, New York, NY 10009",
        phone: "(212) 260-6481",
        website: "https://luciennyc.com",
        rating: 3.8,
        reviews: []
    },
    {
        id: "zero-bond",
        name: "Zero Bond",
        city: "nyc",
        category: "Members Club",
        neighborhood: "NoHo",
        price: "$$$$",
        crowd: [],
        vibe: [],
        age: ["30-34", "35-39", "hidden-gems", "bars-30s", "clubs", "late-night"],
        intent: ["Late night party", "Exclusive access"],
        editorial: "",
        image: "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?q=80&w=1200", // Sleek modern lounge
        address: "0 Bond St, New York, NY 10012",
        phone: "",
        website: "https://zerobond.com",
        rating: 4.5,
        reviews: []
    },
    {
        id: "rays",
        name: "Ray’s",
        city: "nyc",
        category: "Dive Bar",
        neighborhood: "Lower East Side",
        price: "$$",
        crowd: [],
        vibe: [],
        age: ["21-24", "25-29", "bars-20s", "late-night", "mixed-bars", "daytime-early-20s", "group-hangouts"],
        intent: ["Late night fun", "Meeting someone wild", "Happy Hour"],
        editorial: "",
        image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1200", // Dive bar neon
        address: "177 Chrystie St, New York, NY 10002",
        phone: "(555) 555-5555",
        website: "https://raysbarnyc.com",
        rating: 4.0,
        reviews: []
    },
    {
        id: "soho-grand-hotel",
        name: "Soho Grand Hotel",
        city: "nyc",
        category: "Hotel / Bar / Restaurant",
        neighborhood: "SoHo",
        price: "$$$$",
        crowd: [],
        vibe: [],
        age: ["30-34", "35-39", "bars-30s", "mixed-bars", "late-night", "work-from-bar", "hidden-gems", "daytime-30s"],
        intent: ["Impressive Night Out", "Late Night Fun", "Live Jazz"],
        editorial: "",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200",
        address: "310 West Broadway, New York, NY 10013",
        phone: "(212) 965-3000",
        website: "https://sohogrand.com",
        rating: 4.6,
        reviews: []
    },
    {
        id: "mission-nightclub",
        name: "Mission Nightclub",
        city: "nyc",
        category: "Nightclub",
        neighborhood: "Chelsea / Garment District",
        price: "$$$",
        crowd: [],
        vibe: [],
        age: ["21-24", "25-29", "clubs", "bars-20s", "late-night"],
        intent: ["Dancing", "Bottle Service", "Late Night party"],
        editorial: "",
        image: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1200",
        address: "229 W 28th St, New York, NY 10001",
        phone: "(646) 850-0466",
        website: "https://missionny.com",
        rating: 4.5,
        reviews: []
    },
    {
        id: "emmetts-on-grove",
        name: "Emmett's On Grove",
        city: "nyc",
        category: "Restaurant / Pizza",
        neighborhood: "West Village",
        price: "$$$",
        crowd: [],
        vibe: [],
        age: ["25-29", "30-34", "35-39", "group-hangouts", "mixed-bars", "daytime-mid-20s"],
        intent: ["Dinner Party Vibe", "Casual Dinner", "Special Gathering"],
        editorial: "",
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1200",
        address: "39 Grove St, New York, NY 10014",
        phone: "(646) 370-3858",
        website: "https://emmettsongrove.com",
        rating: 4.7,
        reviews: []
    },
    {
        id: "art-soho",
        name: "ART SoHo",
        city: "nyc",
        category: "Rooftop Bar",
        neighborhood: "SoHo",
        price: "$$",
        crowd: [],
        vibe: [],
        age: ["21-24", "25-29", "rooftops-20s", "mixed-rooftops", "late-night"],
        intent: ["Dancing", "Views"],
        editorial: "",
        image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1200",
        address: "231 Hudson St, New York, NY 10013",
        phone: "(929) 588-8422",
        website: "https://artrooftops.com/location/soho/",
        rating: 4.3,
        reviews: []
    },
    {
        id: "the-skylark",
        name: "The Skylark",
        city: "nyc",
        category: "Rooftop Lounge",
        neighborhood: "Midtown",
        price: "$$$",
        crowd: [],
        vibe: [],
        age: ["30-34", "35-39", "rooftops-30s", "mixed-rooftops", "date-night"],
        intent: ["Impressive Drinks", "Views", "Cocktails"],
        editorial: "",
        image: "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?q=80&w=1200",
        address: "200 W 39th St, New York, NY 10018",
        phone: "(212) 257-4577",
        website: "https://theskylarknyc.com/",
        rating: 4.4,
        reviews: []
    },

    {
        id: "the-brothers-sushi-santa-monica",
        name: "The Brothers Sushi Santa Monica",
        city: "la",
        category: "Sushi",
        neighborhood: "Santa Monica",
        price: "$$$$",
        crowd: [],
        vibe: [],
        age: ["30-34"],
        intent: ["Fine Dining"],
        editorial: "",
        image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=1200",
        address: "1151 2nd St, Santa Monica, CA 90403",
        phone: "(424) 330-0214",
        website: "https://thebrotherssushi.com",
        rating: 4.8,
        reviews: []
    },
    {
        id: "mary-os",
        name: "Mary O's",
        city: "nyc",
        category: "Pub",
        neighborhood: "East Village",
        price: "$$",
        crowd: [],
        vibe: [],
        age: ["25-29", "30-34", "bars-20s", "bars-30s", "mixed-bars", "group-hangouts", "work-from-bar", "daytime-mid-20s"],
        intent: ["Casual drinks", "Comfort food", "Happy Hour"],
        editorial: "",
        image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1200",
        address: "32 Avenue A, New York, NY 10009",
        phone: "(212) 673-0770",
        website: "https://maryos.nyc",
        rating: 4.6,
        reviews: []
    },
    {
        id: "corto",
        name: "Corto",
        city: "nyc",
        category: "Italian",
        neighborhood: "Bed-Stuy",
        price: "$$",
        crowd: [],
        vibe: [],
        age: ["25-29", "30-34", "date-night", "daytime-early-20s", "daytime-mid-20s", "daytime-30s", "work-from-bar", "hidden-gems", "group-hangouts"],
        intent: ["Date Night", "Coffee"],
        editorial: "",
        image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200",
        address: "357 Nostrand Ave, Brooklyn, NY 11216",
        phone: "(917) 914-7221",
        website: "https://cortobk.com",
        rating: 4.7,
        reviews: []
    },
    {
        id: "ludlow-coffee-supply",
        name: "Ludlow Coffee Supply",
        city: "nyc",
        category: "Coffee Shop / Bar",
        neighborhood: "Lower East Side",
        price: "$$",
        crowd: [],
        vibe: [],
        age: ["21-24", "25-29", "daytime-early-20s", "daytime-mid-20s", "work-from-bar", "hidden-gems"],
        intent: ["Work", "Casual Meetup"],
        editorial: "",
        image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=1200",
        address: "176 Ludlow St, New York, NY 10002",
        phone: "(212) 777-7463",
        website: "https://ludlowcoffeesupply.com",
        rating: 4.5,
        reviews: []
    },

    // --- LOS ANGELES ---
    {
        id: "chateau-marmont",
        name: "Chateau Marmont",
        city: "la",
        category: "Hotel Bar",
        neighborhood: "West Hollywood",
        price: "$$$$",
        crowd: [],
        vibe: [],
        age: ["30-34", "35-39", "bars-30s", "mixed-bars", "daytime-30s", "hidden-gems"],
        intent: ["Celebrity Spotting", "Power Lunch"],
        editorial: "",
        image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=1200", // Garden patio
        address: "8221 Sunset Blvd, Los Angeles, CA 90046",
        phone: "(323) 656-1010",
        website: "https://chateaumarmont.com",
        rating: 4.6,
        reviews: []
    },
    {
        id: "horses",
        name: "Horses",
        city: "la",
        category: "Bistro",
        neighborhood: "Hollywood",
        price: "$$$",
        crowd: [],
        vibe: [],
        age: ["25-29", "30-34", "bars-20s", "bars-30s", "mixed-bars", "date-night"],
        intent: ["Dinner Party Vibe", "First Date"],
        editorial: "",
        image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200", // Modern bistro
        address: "7617 Sunset Blvd, Los Angeles, CA 90046",
        phone: "",
        website: "https://horsesla.com",
        rating: 4.3,
        reviews: []
    },
    {
        id: "gjelina",
        name: "Gjelina",
        city: "la",
        category: "Restaurant",
        neighborhood: "Venice",
        price: "$$$",
        crowd: [],
        vibe: [],
        age: ["25-29", "30-34", "daytime-mid-20s", "daytime-30s", "mixed-bars", "group-hangouts"],
        intent: ["Casual Dinner", "People Watching"],
        editorial: "",
        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200", // Rustic restaurant
        address: "1429 Abbot Kinney Blvd, Venice, CA 90291",
        phone: "(310) 450-1429",
        website: "https://gjelina.com",
        rating: 4.5,
        reviews: []
    },
    {
        id: "tower-bar",
        name: "Tower Bar",
        city: "la",
        category: "Lounge",
        neighborhood: "West Hollywood",
        price: "$$$$",
        crowd: [],
        vibe: [],
        age: ["35-39", "bars-30s", "date-night", "hidden-gems"],
        intent: ["Special Occasion", "Quiet Conversation"],
        editorial: "",
        image: "https://images.unsplash.com/photo-1561582200-c9a781b0f555?q=80&w=1200", // Elegant bar
        address: "8358 Sunset Blvd, Los Angeles, CA 90069",
        phone: "(323) 848-6677",
        website: "https://sunsettowerhotel.com",
        rating: 4.7,
        reviews: []
    },
    {
        id: "erewhon-beverly",
        name: "Erewhon (Beverly)",
        city: "la",
        category: "Market / Cafe",
        neighborhood: "Beverly Hills",
        price: "$$$",
        crowd: [],
        vibe: [],
        age: ["21-24", "25-29", "daytime-early-20s", "daytime-mid-20s", "group-hangouts"],
        intent: ["Post-workout", "See and be Seen"],
        editorial: "",
        image: "https://images.unsplash.com/photo-1577366366530-5bb287b94998?q=80&w=1200", // Bright smoothie shop
        address: "339 N Beverly Dr, Beverly Hills, CA 90210",
        phone: "",
        website: "https://erewhonmarket.com",
        rating: 4.0,
        reviews: []
    },
    {
        id: "the-edition-rooftop",
        name: "The Roof at Edition",
        city: "la",
        category: "Rooftop Bar",
        neighborhood: "West Hollywood",
        price: "$$$",
        crowd: [],
        vibe: [],
        age: ["25-29", "30-34", "rooftops-20s", "rooftops-30s", "mixed-rooftops", "late-night"],
        intent: ["Views", "Socializing"],
        editorial: "",
        image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1200",
        address: "9040 Sunset Blvd, West Hollywood, CA 90069",
        phone: "(310) 953-9000",
        website: "https://editionhotels.com",
        rating: 4.5,
        reviews: []
    },

    // --- LONDON ---
    {
        id: "chiltern-firehouse",
        name: "Chiltern Firehouse",
        city: "ldn",
        category: "Restaurant / Hotel",
        neighborhood: "Marylebone",
        price: "$$$$",
        crowd: [],
        vibe: [],
        age: ["30-34", "35-39", "bars-30s", "mixed-bars", "date-night", "daytime-30s"],
        intent: ["Impressive Date", "Celebrity Spotting"],
        editorial: "",
        image: "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?q=80&w=1200", // Grand courtyard
        address: "1 Chiltern St, London W1U 7PA",
        phone: "+44 20 7073 7676",
        website: "https://chilternfirehouse.com",
        rating: 4.6,
        reviews: []
    },
    {
        id: "sessions-arts-club",
        name: "Sessions Arts Club",
        city: "ldn",
        category: "Restaurant",
        neighborhood: "Clerkenwell",
        price: "$$$",
        crowd: [],
        vibe: [],
        age: ["30-34", "35-39", "date-night", "hidden-gems", "bars-30s"],
        intent: ["Dinner Party", "Romantic Evening"],
        editorial: "",
        image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1200", // Decayed grandeur
        address: "24 Clerkenwell Green, London EC1R 0NA",
        phone: "",
        website: "https://sessionsartsclub.com",
        rating: 4.8,
        reviews: []
    },
    {
        id: "sketch",
        name: "Sketch (Gallery)",
        city: "ldn",
        category: "Tea Room / Lounge",
        neighborhood: "Mayfair",
        price: "$$$$",
        crowd: [],
        vibe: [],
        age: ["21-24", "25-29", "30-34", "35-39", "daytime-30s", "daytime-mid-20s", "mixed-bars"],
        intent: ["Afternoon Tea", "Photo Op"],
        editorial: "",
        image: "https://images.unsplash.com/photo-1547620615-5d9c6e5a5286?q=80&w=1200", // Pink artistic room
        address: "9 Conduit St, London W1S 2XG",
        phone: "+44 20 7659 4500",
        website: "https://sketch.london",
        rating: 4.4,
        reviews: []
    },
    {
        id: "brilliant-corners",
        name: "Brilliant Corners",
        city: "ldn",
        category: "Audiophile Bar",
        neighborhood: "Dalston",
        price: "$$$",
        crowd: [],
        vibe: [],
        age: ["25-29", "30-34", "bars-20s", "late-night", "mixed-bars", "hidden-gems"],
        intent: ["Music Appreciation", "Late Night"],
        editorial: "",
        image: "https://images.unsplash.com/photo-1571204829887-3b8d69f4b04c?q=80&w=1200", // Vinyl bar
        address: "470 Kingsland Rd, London E8 4AE",
        phone: "",
        website: "https://brilliantcornerslondon.co.uk",
        rating: 4.5,
        reviews: []
    },
    {
        id: "connaught-bar",
        name: "The Connaught Bar",
        city: "ldn",
        category: "Cocktail Bar",
        neighborhood: "Mayfair",
        price: "$$$$",
        crowd: [],
        vibe: [],
        age: ["35-39", "bars-30s", "date-night"],
        intent: ["Best Martini in World", "Business Deal"],
        editorial: "",
        image: "https://images.unsplash.com/photo-1597075687490-8f673c6c17f6?q=80&w=1200", // Elegant silver bar
        address: "Connaught, Carlos Pl, London W1K 2AL",
        phone: "+44 20 7499 7070",
        website: "https://the-connaught.co.uk",
        rating: 4.9,
        reviews: []
    }
];


export const PLACES: Place[] = [...CURATED_PLACES, ...(GENERATED_PLACES as unknown as Place[])];

/**
 * Utility to get all places including user-added ones from localStorage
 * This ensures consistency across Browse, Search, and Feed.
 */
export function getCombinedPlaces(): Place[] {
    if (typeof window === 'undefined') return PLACES;

    const saved = localStorage.getItem('the_scene_user_venues');
    if (!saved) return PLACES;

    try {
        const localPlaces = JSON.parse(saved) as Place[];
        // Filter out any potential duplicates by ID if necessary
        const localIds = new Set(localPlaces.map(p => p.id));
        const filteredPlaces = PLACES.filter(p => !localIds.has(p.id));
        return [...localPlaces, ...filteredPlaces];
    } catch (e) {
        console.error("Failed to parse local venues", e);
        return PLACES;
    }
}
