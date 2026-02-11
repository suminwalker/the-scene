import { supabase } from "@/lib/supabase";

export async function validateNYCLocation(userId: string) {
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('home_borough')
        .eq('id', userId)
        .single();

    if (error) throw error;

    if (!['Manhattan', 'Brooklyn'].includes(profile?.home_borough)) {
        throw new Error('The Scene is currently available in Manhattan and Brooklyn only');
    }
}

export interface ProfileUpdate {
    name?: string;
    handle?: string;
    bio?: string;
    avatar?: string;
    instagram?: string;
    tiktok?: string;
    city?: string;
    home_borough?: string;
    neighborhoods?: string[];
    age_bracket?: string;
    dislikes?: string[];
    activity_visibility?: string;
}

export async function updateProfile(userId: string, updates: ProfileUpdate) {
    const { error } = await supabase
        .from('profiles')
        .update({
            ...updates,
            updated_at: new Date().toISOString()
        })
        .eq('id', userId);

    if (error) throw error;
}

export async function getProfile(userId: string) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) throw error;
    return data;
}
