import { Place, PLACES } from "./data";
import { City } from "./city-context";
import { QUEENS_NEIGHBORHOODS } from "./taxonomy";

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
