
import { Place, PLACES } from "./data";
import { City } from "./city-context";
import { QUEENS_NEIGHBORHOODS } from "./taxonomy";

export interface UserPreferences {
    ageBracket: string | null;
    dislikes: string[];
    neighborhoods: string[];
    category?: string; // Optional manual filter
}

export function getValidPlaces(city: City): Place[] {
    return PLACES.filter((place) => {
        // 1. Must match city
        if (place.city !== city) return false;

        // 2. Must have minimal fields
        if (!place.phone || place.phone.trim() === "") return false;
        if (!place.website || place.website.trim() === "") return false;
        if (!place.image || place.image.trim() === "") return false;

        // 3. Must not be a placeholder image (optional check, but good for "real" vibe)
        if (place.image.includes("/placeholder/")) return false; // Filter out local placeholders if any remain

        // 4. Exclude Queens
        if (QUEENS_NEIGHBORHOODS.includes(place.neighborhood)) return false;

        return true;
    });
}

/**
 * Returns a sorted list of recommended places for users unfamiliar with the city.
 * Filters by age bracket and excludes dislikes.
 */
export function getRecommendedPlaces(city: City, prefs: UserPreferences): Place[] {
    const validPlaces = getValidPlaces(city);

    return validPlaces.filter(place => {
        // 1. Age Filter (Strict)
        // If place has age tags, user's bracket must be compatible
        // e.g. user "25-29" compatible with place ["21-24", "25-29", "bars-20s", "mixed-bars"]
        if (prefs.ageBracket && place.age) {
            const userAge = prefs.ageBracket; // e.g. "25-29"

            // Map simple bracket to broader categories for matching
            const is20s = userAge === "21-24" || userAge === "25-29";
            const is30s = userAge === "30-34" || userAge === "35-39";

            const matchesAge = place.age.some(tag => {
                if (tag === userAge) return true;
                if (is20s && (tag === "bars-20s" || tag === "mixed-bars" || tag === "rooftops-20s")) return true;
                if (is30s && (tag === "bars-30s" || tag === "mixed-bars" || tag === "rooftops-30s")) return true;
                return false;
            });

            if (!matchesAge && place.age.length > 0) return false;
        }

        // 2. Dislike Filter (Exclude)
        if (prefs.dislikes.length > 0) {
            // Check category
            if (prefs.dislikes.includes(place.category) || prefs.dislikes.some(d => place.category.includes(d))) return false;

            // Check customized tags (e.g. "Clubs" -> filter out "Nightclub")
            if (prefs.dislikes.includes("Clubs") && (place.category.toLowerCase().includes("club") || place.intent.includes("Dancing"))) return false;

            // Check vibe tags if they exist
            if (place.vibe && place.vibe.some(v => prefs.dislikes.includes(v))) return false;
        }

        return true;
    }).sort((a, b) => {
        // Sort by Rating (High to Low)
        return (b.rating || 0) - (a.rating || 0);
    });
}
