import { City } from "@/lib/city-context";
import { GENERATED_PLACES } from "./generated-data";
import { QUEENS_NEIGHBORHOODS } from "./taxonomy";

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

export const PLACES: Place[] = [
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
        image: "/images/venues/the-nines.jpg",
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
        image: "/images/venues/fanelli-cafe.jpg", // Busy outdoor cafe
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
        image: "/images/venues/american-bar.jpg", // Elegant cocktail
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
        image: "/images/venues/soho-house-meatpacking.jpg", // Rooftop pool vibe
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
        image: "/images/venues/lucien.jpg", // Busy bistro
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
        image: "/images/venues/zero-bond.jpg", // Sleek modern lounge
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
        image: "/images/venues/rays.jpg", // Dive bar neon
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
        image: "/images/venues/soho-grand-hotel.jpg",
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
        image: "/images/venues/mission-nightclub.png",
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
        image: "/images/venues/emmetts-on-grove.jpg",
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
        image: "/images/venues/art-soho.jpg",
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
        image: "/images/venues/the-skylark.jpg",
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
        image: "/images/venues/the-brothers-sushi-santa-monica.jpg",
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
        image: "/images/venues/mary-os.jpg",
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
        image: "/images/venues/corto.jpg",
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
        image: "/images/venues/ludlow-coffee-supply.jpg",
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
        image: "/images/venues/chateau-marmont.jpg", // Garden patio
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
        image: "/images/venues/horses.jpg", // Modern bistro
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
        image: "/images/venues/gjelina.jpg", // Rustic restaurant
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
        image: "/images/venues/tower-bar.jpg", // Elegant bar
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
        image: "/images/venues/erewhon-beverly.jpg", // Bright smoothie shop
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
        image: "/images/venues/the-edition-rooftop.jpg",
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
        image: "/images/venues/chiltern-firehouse.jpg", // Grand courtyard
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
        image: "/images/venues/sessions-arts-club.jpg", // Decayed grandeur
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
        image: "/images/venues/sketch.jpg", // Pink artistic room
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
        image: "/images/venues/brilliant-corners.jpg", // Vinyl bar
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
        image: "/images/venues/connaught-bar.jpg", // Elegant silver bar
        address: "Connaught, Carlos Pl, London W1K 2AL",
        phone: "+44 20 7499 7070",
        website: "https://the-connaught.co.uk",
        rating: 4.9,
        reviews: []
    },
    // --- MANHATTAN EXPANSION ---
    {
        id: "chinese-tuxedo",
        name: "Chinese Tuxedo",
        city: "nyc",
        category: "Modern Chinese",
        neighborhood: "Chinatown",
        price: "$$$",
        crowd: [],
        vibe: [],
        age: ["25-29", "30-34", "date-night", "group-hangouts", "mixed-bars"],
        intent: ["Dinner Party", "Cocktails"],
        editorial: "",
        image: "/images/venues/chinese-tuxedo.jpg", // Elegant dining
        address: "5 Doyers St, New York, NY 10013",
        phone: "(646) 895-9301",
        website: "https://chinesetuxedo.com",
        rating: 4.5,
        reviews: []
    },
    {
        id: "estela",
        name: "Estela",
        city: "nyc",
        category: "Restaurant",
        neighborhood: "Nolita",
        price: "$$$",
        crowd: [],
        vibe: [],
        age: ["30-34", "35-39", "date-night", "foodie"],
        intent: ["Fine Dining", "Impressive Date"],
        editorial: "",
        image: "/images/venues/estela.jpg",
        address: "47 E Houston St, New York, NY 10012",
        phone: "(212) 219-7693",
        website: "https://estelanyc.com",
        rating: 4.7,
        reviews: []
    },
    {
        id: "gramercy-tavern",
        name: "Gramercy Tavern",
        city: "nyc",
        category: "New American",
        neighborhood: "Gramercy",
        price: "$$$$",
        crowd: [],
        vibe: [],
        age: ["30-34", "35-39", "parents", "business"],
        intent: ["Special Occasion", "Business Lunch"],
        editorial: "",
        image: "/images/venues/gramercy-tavern.jpg",
        address: "42 E 20th St, New York, NY 10003",
        phone: "(212) 477-0777",
        website: "https://gramercytavern.com",
        rating: 4.8,
        reviews: []
    },
    {
        id: "cote",
        name: "Cote",
        city: "nyc",
        category: "Korean Steakhouse",
        neighborhood: "Flatiron",
        price: "$$$$",
        crowd: [],
        vibe: [],
        age: ["25-29", "30-34", "group-hangouts", "celebration"],
        intent: ["Birthday Dinner", "Lively Dinner"],
        editorial: "",
        image: "/images/venues/cote.jpg",
        address: "16 W 22nd St, New York, NY 10010",
        phone: "(212) 401-7986",
        website: "https://cotenyc.com",
        rating: 4.8,
        reviews: []
    },
    {
        id: "minetta-tavern",
        name: "Minetta Tavern",
        city: "nyc",
        category: "French Brasserie",
        neighborhood: "Greenwich Village",
        price: "$$$$",
        crowd: [],
        vibe: [],
        age: ["30-34", "35-39", "date-night", "business"],
        intent: ["Steak Dinner", "Classic NYC"],
        editorial: "",
        image: "/images/venues/minetta-tavern.jpg",
        address: "113 MacDougal St, New York, NY 10012",
        phone: "(212) 475-3850",
        website: "https://minettatavernny.com",
        rating: 4.6,
        reviews: []
    },
    {
        id: "bemelmans-bar",
        name: "Bemelmans Bar",
        city: "nyc",
        category: "Piano Bar",
        neighborhood: "Upper East Side",
        price: "$$$$",
        crowd: [],
        vibe: [],
        age: ["30-34", "35-39", "date-night", "old-school"],
        intent: ["Martinis", "Live Jazz", "Quiet Conversation"],
        editorial: "",
        image: "/images/venues/bemelmans-bar.png",
        address: "35 E 76th St, New York, NY 10021",
        phone: "(212) 744-1600",
        website: "https://rosewoodhotels.com",
        rating: 4.9,
        reviews: []
    },

    // --- BROOKLYN EXPANSION ---
    {
        id: "laser-wolf",
        name: "Laser Wolf",
        city: "nyc",
        category: "Israeli Skewer House",
        neighborhood: "Williamsburg",
        price: "$$$",
        crowd: [],
        vibe: [],
        age: ["25-29", "30-34", "rooftops-20s", "mixed-rooftops", "group-hangouts"],
        intent: ["Views", "Lively Dinner", "Sunset"],
        editorial: "",
        image: "/images/venues/laser-wolf.jpg",
        address: "97 Wythe Ave, Brooklyn, NY 11249",
        phone: "(718) 215-7150",
        website: "https://laserwolfbrooklyn.com",
        rating: 4.8,
        reviews: []
    },
    {
        id: "fourfivesix",
        name: "FourFiveSix",
        city: "nyc",
        category: "Bar / Lounge",
        neighborhood: "Williamsburg",
        price: "$$",
        crowd: [],
        vibe: [],
        age: ["21-24", "25-29", "bars-20s", "mixed-bars", "late-night", "clubs"],
        intent: ["Dancing", "Hookup", "Party"],
        editorial: "",
        image: "/images/venues/fourfivesix.png",
        address: "199 Richardson St, Brooklyn, NY 11222",
        phone: "",
        website: "https://456live.com",
        rating: 4.0,
        reviews: []
    },
    {
        id: "house-of-yes",
        name: "House of Yes",
        city: "nyc",
        category: "Performance Venue / Club",
        neighborhood: "Bushwick",
        price: "$$$",
        crowd: [],
        vibe: [], // Added manually from request context, implies LGBTQ+ safe / wild
        age: ["21-24", "25-29", "clubs", "hidden-gems", "late-night"],
        intent: ["Dancing", "Show", "Wild Night"],
        editorial: "",
        image: "/images/venues/house-of-yes.jpg",
        address: "2 Wyckoff Ave, Brooklyn, NY 11237",
        phone: "",
        website: "https://houseofyes.org",
        rating: 4.7,
        reviews: []
    },
    {
        id: "bernies",
        name: "Bernie's",
        city: "nyc",
        category: "American",
        neighborhood: "Greenpoint",
        price: "$$",
        crowd: [],
        vibe: [],
        age: ["25-29", "30-34", "mixed-bars", "group-hangouts"],
        intent: ["Comfort Food", "Casual Dinner"],
        editorial: "",
        image: "/images/venues/bernies.jpg",
        address: "332 Driggs Ave, Brooklyn, NY 11222",
        phone: "(347) 529-6400",
        website: "https://berniesnyc.com",
        rating: 4.5,
        reviews: []
    },
    {
        id: "cecconis-dumbo",
        name: "Cecconi's Dumbo",
        city: "nyc",
        category: "Italian",
        neighborhood: "Dumbo",
        price: "$$$$",
        crowd: [],
        vibe: [],
        age: ["30-34", "35-39", "date-night", "parents"],
        intent: ["Views", "Waterfront", "Impressive Lunch"],
        editorial: "",
        image: "/images/venues/cecconis-dumbo.png",
        address: "55 Water St, Brooklyn, NY 11201",
        phone: "(718) 650-3900",
        website: "https://cecconisdumbo.com",
        rating: 4.4,
        reviews: []
    },
    {
        id: "miss-ada",
        name: "Miss Ada",
        city: "nyc",
        category: "Mediterranean",
        neighborhood: "Fort Greene",
        price: "$$$",
        crowd: [],
        vibe: [],
        age: ["25-29", "30-34", "date-night", "brunch"],
        intent: ["Brunch", "Patio Dining"],
        editorial: "",
        image: "/images/venues/miss-ada.jpg",
        address: "184 Dekalb Ave, Brooklyn, NY 11205",
        phone: "(917) 909-1023",
        website: "https://missadanyc.com",
        rating: 4.6,
        reviews: []
    },
    {
        id: "sisters",
        name: "Sisters",
        city: "nyc",
        category: "Bar / Restaurant",
        neighborhood: "Clinton Hill",
        price: "$$",
        crowd: [],
        vibe: [],
        age: ["25-29", "30-34", "mixed-bars", "group-hangouts"],
        intent: ["Casual Drinks", "Brunch", "Live Music"],
        editorial: "",
        image: "/images/venues/sisters.jpg",
        address: "900 Fulton St, Brooklyn, NY 11238",
        phone: "(347) 763-2537",
        website: "https://sistersbklyn.com",
        rating: 4.4,
        reviews: []
    },
    {
        id: "grand-army",
        name: "Grand Army",
        city: "nyc",
        category: "Cocktail Bar",
        neighborhood: "Boerum Hill",
        price: "$$$",
        crowd: [],
        vibe: [],
        age: ["25-29", "30-34", "bars-30s", "date-night"],
        intent: ["Oysters", "Craft Cocktails"],
        editorial: "",
        image: "/images/venues/grand-army.jpg",
        address: "336 State St, Brooklyn, NY 11217",
        phone: "(718) 422-7867",
        website: "https://grandarmybar.com",
        rating: 4.6,
        reviews: []
    },
    {
        id: "lucali",
        name: "Lucali",
        city: "nyc",
        category: "Pizza",
        neighborhood: "Carroll Gardens",
        price: "$$",
        crowd: [],
        vibe: [],
        age: ["25-29", "30-34", "35-39", "date-night", "foodie"],
        intent: ["Legendary Food", "BYOB"],
        editorial: "",
        image: "/images/venues/lucali.jpg",
        address: "575 Henry St, Brooklyn, NY 11231",
        phone: "(718) 858-4086",
        website: "",
        rating: 4.9,
        reviews: []
    },
    {
        id: "union-hall",
        name: "Union Hall",
        city: "nyc",
        category: "Bar / Venue",
        neighborhood: "Park Slope",
        price: "$$",
        crowd: [],
        vibe: [],
        age: ["25-29", "30-34", "bars-20s", "mixed-bars", "group-hangouts"],
        intent: ["Bocce", "Comedy", "Casual Hang"],
        editorial: "",
        image: "/images/venues/union-hall.png", // Dark interior
        address: "702 Union St, Brooklyn, NY 11215",
        phone: "(718) 638-4400",
        website: "https://unionhallny.com",
        rating: 4.5,
        reviews: []
    }
];

/**
 * Utility to get all places including user-added ones from localStorage
 * This ensures consistency across Browse, Search, and Feed.
 */
export function getCombinedPlaces(): Place[] {
    let allPlaces = PLACES;

    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('the_scene_user_venues');
        if (saved) {
            try {
                const localPlaces = JSON.parse(saved) as Place[];
                // Filter out any potential duplicates by ID if necessary
                const localIds = new Set(localPlaces.map(p => p.id));
                const filteredPlaces = PLACES.filter(p => !localIds.has(p.id));
                allPlaces = [...localPlaces, ...filteredPlaces];
            } catch (e) {
                console.error("Failed to parse local venues", e);
            }
        }
    }

    // Global Queens Filter
    return allPlaces.filter(p => !QUEENS_NEIGHBORHOODS.includes(p.neighborhood));
}
