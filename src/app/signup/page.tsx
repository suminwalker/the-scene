"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AppContainer } from "@/components/layout/AppContainer";
import { TopBar } from "@/components/layout/TopBar";
import { ChevronDown, Eye, EyeOff, Camera, Check, MapPin, Users, Search, MinusCircle, ChevronRight, X as CloseIcon, Loader2, Instagram, Music2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

// Define allowed test data locally since it was missing
const ALLOWED_TEST_DATA = {
    phones: ["5555555555", "1234567890", "0000000000"],
    emails: ["test@example.com", "admin@thescene.com", "demo@thescene.com"],
    usernames: ["testuser", "admin", "suminwalker", "demo"]
};

type SignupStep = "phone" | "email" | "password" | "name" | "username" | "photo" | "age" | "city" | "location" | "dislikes" | "social";
type LocationPermission = "always" | "while_using" | "never";

export default function SignupPage() {
    const router = useRouter();
    const supabase = createClient();
    const [step, setStep] = useState<SignupStep>("phone");
    const [prevStep, setPrevStep] = useState<SignupStep | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingPhone, setIsCheckingPhone] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        phone: "",
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        username: "",
        photo: null as string | null,
        photoFile: null as File | null,
        countryCode: "+1",
        countryName: "United States",
        neighborhoods: [] as string[],
        notFamiliar: false,
        ageBracket: null as string | null,
        dislikes: [] as string[],
        location: null as { lat: number; lng: number } | null,
        locationPermission: null as LocationPermission | null,
        instagram: "",
        tiktok: ""
    });
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [showCountryModal, setShowCountryModal] = useState(false);

    const [showPassword, setShowPassword] = useState(false);

    const getStepError = (): string | null => {
        if (step === "phone") {
            if (ALLOWED_TEST_DATA.phones.includes(formData.phone)) return null;
            if (formData.phone.length > 0 && formData.phone.length < 10) return "Please enter a valid 10-digit number";
        }
        if (step === "email") {
            if (ALLOWED_TEST_DATA.emails.includes(formData.email)) return null;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (formData.email.length > 0 && !emailRegex.test(formData.email)) return "Please enter a legitimate email address";
        }
        if (step === "username") {
            if (ALLOWED_TEST_DATA.usernames.includes(formData.username)) return null;
            if (formData.username.length > 0 && formData.username.length < 6) return "Username must be at least 6 characters";
        }
        return null;
    };

    const error = getStepError() || serverError;

    const handleNext = async () => {
        if (step === "phone") {
            setIsCheckingPhone(true);
            setServerError(null);

            try {
                // Check if phone already exists
                const { count, error: countError } = await supabase
                    .from('profiles')
                    .select('id', { count: 'exact', head: true })
                    .eq('phone', formData.phone);

                if (countError) {
                    console.error("Error checking phone:", countError);
                    // Optionally handle network error, for now proceeding or standardizing error
                } else if (count && count > 0) {
                    setServerError("An account with this phone number already exists.");
                    setIsCheckingPhone(false);
                    return;
                }
            } catch (e) {
                console.error("Check phone exception:", e);
            } finally {
                setIsCheckingPhone(false);
            }

            // Only proceed if no server error was set (double check logic above)
            // If we returned above, we won't get here.
        }

        setPrevStep(step);
        if (step === "phone") setStep("username");
        else if (step === "username") setStep("email");
        else if (step === "email") setStep("password");
        else if (step === "password") setStep("name");
        else if (step === "name") setStep("photo");
        else if (step === "photo") setStep("age");
        else if (step === "age") setStep("city");
        else if (step === "city") setStep("location");
        else if (step === "location") setStep("dislikes");
        else if (step === "dislikes") setStep("social");
        else if (step === "social") {
            handleCompleteSignup();
        }
    };

    const handleCompleteSignup = async () => {
        setIsLoading(true);
        try {
            // 1. Sign up the user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: `${formData.firstName} ${formData.lastName}`,
                        username: formData.username,
                    }
                }
            });

            if (authError) {
                console.error("Signup error:", authError.message);
                alert(`Signup failed: ${authError.message}`);
                setIsLoading(false);
                return;
            }

            if (authData.user) {
                // 2. Create the profile
                // Note: If you have a trigger that creates a profile on auth.users insert, 
                // you might need to use 'update' instead of 'insert', or rely on the metadata above.
                // Assuming manual profile creation/update here for completeness.

                const updates = {
                    id: authData.user.id,
                    username: formData.username,
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    phone: formData.phone,
                    // country_code: formData.countryCode,
                    age_bracket: formData.ageBracket,
                    neighborhoods: formData.neighborhoods,
                    not_familiar: formData.notFamiliar,
                    dislikes: formData.dislikes,
                    location_permission: formData.locationPermission || "never",
                    instagram: formData.instagram,
                    tiktok: formData.tiktok,
                    updated_at: new Date().toISOString(),
                    // Photo handling would normally go to Storage here
                };

                const { error: profileError } = await supabase
                    .from('profiles')
                    .upsert(updates);

                if (profileError) {
                    console.error("Profile creation error:", profileError);
                }
            }

            // Keep localStorage logic as fallback/cache for Immediate UI
            if (typeof window !== 'undefined') {
                localStorage.setItem("the_scene_onboarding_data", JSON.stringify({
                    ageBracket: formData.ageBracket,
                    neighborhoods: formData.neighborhoods,
                    notFamiliar: formData.notFamiliar,
                    dislikes: formData.dislikes
                }));
            }

            router.push("/discover");
            router.refresh();
        } catch (e) {
            console.error("Unexpected error:", e);
            alert("Something went wrong. Please try again.");
            setIsLoading(false);
        }
    };

    const requestLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            handleNext();
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData(prev => ({
                    ...prev,
                    location: {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    }
                }));
                setShowLocationModal(false);
                handleNext();
            },
            (error) => {
                console.error("Location error:", error);
                setShowLocationModal(false);
                handleNext();
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    };

    const handleBack = () => {
        if (step === "phone") router.push("/");
        else if (step === "username") setStep("phone");
        else if (step === "email") setStep("username");
        else if (step === "password") setStep("email");
        else if (step === "name") setStep("password");
        else if (step === "photo") setStep("name");
        else if (step === "age") setStep("photo");
        else if (step === "city") setStep("age");
        else if (step === "location") setStep("city");
        else if (step === "dislikes") setStep("location");
        else if (step === "social") setStep("dislikes");
    };

    const isStepValid = () => {
        if (error) return false;
        if (step === "phone") return formData.phone.length >= 10 || ALLOWED_TEST_DATA.phones.includes(formData.phone);
        if (step === "email") {
            if (ALLOWED_TEST_DATA.emails.includes(formData.email)) return true;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(formData.email);
        }
        if (step === "password") {
            // Replicating logic from previous file
            const hasLetters = /[a-zA-Z]/.test(formData.password);
            const hasNumbers = /[0-9]/.test(formData.password);
            const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);
            return formData.password.length >= 8 && formData.password.length <= 20 && hasLetters && hasNumbers && hasSpecial;
        }
        if (step === "name") return formData.firstName.trim() !== "" && formData.lastName.trim() !== "";
        if (step === "username") return formData.username.length >= 6 || ALLOWED_TEST_DATA.usernames.includes(formData.username);
        if (step === "photo") return true; // Skipable
        if (step === "age") return formData.ageBracket !== null;
        if (step === "city") return formData.neighborhoods.length > 0 || formData.notFamiliar;
        if (step === "location") return true;
        if (step === "dislikes") return true;
        if (step === "social") return true;
        return false;
    };

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 20 : -20,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 20 : -20,
            opacity: 0
        })
    };

    const direction = prevStep ? (getStepOrder(step) > getStepOrder(prevStep) ? 1 : -1) : 1;

    function getStepOrder(s: SignupStep) {
        const orders: Record<SignupStep, number> = {
            phone: 0,
            username: 1,
            email: 2,
            password: 3,
            name: 4,
            photo: 5,
            age: 6,
            city: 7,
            location: 8,
            dislikes: 9,
            social: 10
        };
        return orders[s];
    }

    // Step-specific background visuals for desktop
    const getStepVisual = () => {
        const visuals: Record<SignupStep, { type: 'gradient' | 'image'; value: string }> = {
            phone: { type: 'gradient', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
            username: { type: 'gradient', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
            email: { type: 'gradient', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
            password: { type: 'gradient', value: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
            name: { type: 'gradient', value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
            photo: { type: 'gradient', value: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' },
            age: { type: 'gradient', value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
            city: { type: 'image', value: '/Users/suminwalker/.gemini/antigravity/brain/9a2ca23e-8497-4164-bbf4-f6d98f180931/signup_city_bg_1770744162404.png' },
            location: { type: 'gradient', value: 'linear-gradient(135deg, #ff9a56 0%, #ff6a95 100%)' },
            dislikes: { type: 'gradient', value: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
            social: { type: 'image', value: '/Users/suminwalker/.gemini/antigravity/brain/9a2ca23e-8497-4164-bbf4-f6d98f180931/signup_social_bg_1770744176347.png' }
        };
        return visuals[step];
    };

    const currentVisual = getStepVisual();

    return (
        <div className="flex justify-center min-h-screen bg-white text-black w-full">
            {/* Desktop Split Screen Layout */}
            <div className="w-full flex">
                {/* Left: Form Content (Always visible) */}
                <AppContainer className="bg-white md:w-1/2 md:max-w-none">
                    <TopBar onBack={handleBack} className="md:flex" />

                    <main className="px-8 pt-12 relative flex-1 flex flex-col min-h-0 pb-8">
                        <AnimatePresence initial={false} custom={direction} mode="wait">
                            <motion.div
                                key={step}
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                    x: { type: "spring", stiffness: 300, damping: 30 },
                                    opacity: { duration: 0.2 }
                                }}
                                className="flex-1 flex flex-col min-h-0"
                            >
                                {/* Step: Phone */}
                                {step === "phone" && (
                                    <div className="space-y-12">
                                        <h1 className="text-4xl font-serif tracking-tight leading-tight">
                                            First, what&apos;s your phone number?
                                        </h1>
                                        <div className="relative group">
                                            <div className="flex items-center gap-3 border-b-2 border-zinc-100 focus-within:border-black transition-all pb-2">
                                                <div className="flex items-center gap-1 text-zinc-900 font-mono text-lg px-2 py-1">
                                                    <span>{formData.countryCode}</span>
                                                    <ChevronDown className="w-4 h-4 text-zinc-400" />
                                                </div>
                                                <input
                                                    autoFocus
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    placeholder="Phone number"
                                                    className="flex-1 bg-transparent text-xl font-mono focus:outline-none placeholder:text-zinc-200 tracking-wider"
                                                />
                                            </div>
                                            <p className="mt-4 text-[10px] text-zinc-400 leading-relaxed font-mono">
                                                By submitting your phone number, you consent to receive informational messages at that number from The Scene. Message and data rates may apply.
                                            </p>
                                            {error && (
                                                <div className="mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                                    <p className="text-sm text-zinc-600 leading-relaxed">{error}</p>
                                                    <p className="mt-2 text-sm">
                                                        <span onClick={() => router.push("/login")} className="text-black font-bold underline cursor-pointer">Log in</span> to your existing account.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Step: Username */}
                                {step === "username" && (
                                    <div className="space-y-12">
                                        <div className="space-y-2">
                                            <h1 className="text-4xl font-serif tracking-tight leading-tight">
                                                Your username
                                            </h1>
                                            <p className="text-sm text-zinc-400">Choose a unique handle.</p>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 border-b-2 border-zinc-100 focus-within:border-black transition-all pb-2">
                                                <span className="text-xl font-serif text-zinc-900">@</span>
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    value={formData.username}
                                                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, "") })}
                                                    placeholder="username"
                                                    className="flex-1 bg-transparent text-xl font-serif italic focus:outline-none placeholder:text-zinc-200"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step: Email */}
                                {step === "email" && (
                                    <div className="space-y-12">
                                        <h1 className="text-4xl font-serif tracking-tight leading-tight">
                                            What&apos;s your email?
                                        </h1>
                                        <div className="space-y-4">
                                            <div className="border-b-2 border-zinc-100 focus-within:border-black transition-all pb-2">
                                                <input
                                                    autoFocus
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    placeholder="email@example.com"
                                                    className="w-full bg-transparent text-xl font-serif italic focus:outline-none placeholder:text-zinc-200"
                                                />
                                            </div>
                                            {error && (
                                                <div className="mt-6 text-sm text-zinc-600">
                                                    {error}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Step: Password */}
                                {step === "password" && (
                                    <div className="space-y-12">
                                        <h1 className="text-4xl font-serif tracking-tight leading-tight">
                                            Create password
                                        </h1>
                                        <div className="space-y-6">
                                            <div className="relative border-b-2 border-zinc-100 focus-within:border-black transition-all pb-2">
                                                <input
                                                    autoFocus
                                                    type={showPassword ? "text" : "password"}
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                    placeholder="Password"
                                                    className="w-full bg-transparent text-xl font-serif italic focus:outline-none placeholder:text-zinc-200 pr-16"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-8 top-1 text-zinc-400 p-1 hover:text-zinc-600 transition-colors"
                                                >
                                                    {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                                </button>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-xs font-bold text-zinc-400">Your password must have:</p>
                                                <div className="space-y-1">
                                                    <div className={cn("flex items-center gap-2 text-xs transition-colors", formData.password.length >= 8 && formData.password.length <= 20 ? "text-green-500" : "text-zinc-300")}>
                                                        <Check className="w-3 h-3" /> 8 to 20 characters
                                                    </div>
                                                    <div className={cn("flex items-center gap-2 text-xs transition-colors", /[0-9]/.test(formData.password) && /[a-zA-Z]/.test(formData.password) && /[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? "text-green-500" : "text-zinc-300")}>
                                                        <Check className="w-3 h-3" /> Letters, numbers, and special characters
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step: Name */}
                                {step === "name" && (
                                    <div className="space-y-12">
                                        <div className="space-y-2">
                                            <h1 className="text-4xl font-serif tracking-tight leading-tight">
                                                What&apos;s your name?
                                            </h1>
                                            <p className="text-sm text-zinc-400">This is how your friends will see you!</p>
                                        </div>
                                        <div className="space-y-8">
                                            <div className="border-b-2 border-zinc-100 focus-within:border-black transition-all pb-2">
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    value={formData.firstName}
                                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                    placeholder="First name"
                                                    className="w-full bg-transparent text-xl font-serif italic focus:outline-none placeholder:text-zinc-200"
                                                />
                                            </div>
                                            <div className="border-b-2 border-zinc-100 focus-within:border-black transition-all pb-2">
                                                <input
                                                    type="text"
                                                    value={formData.lastName}
                                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                    placeholder="Last name"
                                                    className="w-full bg-transparent text-xl font-serif italic focus:outline-none placeholder:text-zinc-200"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step: Photo */}
                                {step === "photo" && (
                                    <div className="space-y-12 flex flex-col items-center flex-1">
                                        <div className="relative mt-8">
                                            <div className="w-48 h-48 rounded-full bg-zinc-50 border-2 border-zinc-100 flex items-center justify-center overflow-hidden">
                                                {formData.photo ? (
                                                    <img src={formData.photo} alt="Profile" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Camera className="w-16 h-16 text-zinc-200" />
                                                )}
                                            </div>
                                            <label htmlFor="photo-upload" className="absolute bottom-2 right-2 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer">
                                                <span className="text-2xl font-light">+</span>
                                                <input
                                                    id="photo-upload"
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            // Store file object in state (need to update type)
                                                            // For now, just create object URL for preview
                                                            const url = URL.createObjectURL(file);
                                                            setFormData({ ...formData, photo: url, photoFile: file });
                                                        }
                                                    }}
                                                />
                                            </label>
                                        </div>
                                        <div className="text-center space-y-2">
                                            <h1 className="text-4xl font-serif tracking-tight leading-tight">
                                                Add your profile photo
                                            </h1>
                                            <p className="text-sm text-zinc-400 px-12 leading-relaxed">
                                                Show off the face behind the The Scene
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Step: Age */}
                                {step === "age" && (
                                    <div className="space-y-12">
                                        <div className="space-y-2">
                                            <h1 className="text-4xl font-serif tracking-tight leading-tight">
                                                How old are you?
                                            </h1>
                                        </div>
                                        <div className="space-y-4">
                                            {["21-24", "25-29", "30-34", "35-39", "40-49", "50+"].map((age) => (
                                                <button
                                                    key={age}
                                                    onClick={() => setFormData({ ...formData, ageBracket: age })}
                                                    className={cn(
                                                        "w-full py-5 text-xl font-serif italic border-b transition-all text-left px-4 flex justify-between items-center",
                                                        formData.ageBracket === age ? "border-black text-black font-bold bg-zinc-50" : "border-zinc-100 text-zinc-400"
                                                    )}
                                                >
                                                    <span>{age}</span>
                                                    {formData.ageBracket === age && <Check className="w-5 h-5" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Step: City */}
                                {step === "city" && (
                                    <div className="space-y-6 flex-1 flex flex-col pb-10 min-h-0">
                                        <h1 className="text-4xl font-serif tracking-tight leading-tight">
                                            Which neighborhoods?
                                        </h1>
                                        <div className="space-y-0 -mx-8 overflow-y-auto flex-1 no-scrollbar pb-10 min-h-0">
                                            {/* Simplified list for brevity */}
                                            <div className="px-8 pb-6 border-b border-zinc-50">
                                                <button
                                                    onClick={() => setFormData({ ...formData, notFamiliar: !formData.notFamiliar, neighborhoods: [] })}
                                                    className={cn("w-full py-4 px-6 flex items-center justify-between rounded-xl border-2 transition-all", formData.notFamiliar ? "border-black bg-zinc-50" : "border-zinc-100")}
                                                >
                                                    <span className="text-lg font-serif italic">Not familiar with the city</span>
                                                    {formData.notFamiliar && <Check className="w-4 h-4" />}
                                                </button>
                                            </div>
                                            {[
                                                {
                                                    borough: "Manhattan",
                                                    neighborhoods: [
                                                        "SoHo", "West Village", "Tribeca", "LES", "East Village",
                                                        "Chinatown", "Nolita", "NoHo", "Gramercy", "Chelsea",
                                                        "Flatiron", "Greenwich Village", "Hell's Kitchen",
                                                        "Upper East Side", "Upper West Side"
                                                    ]
                                                },
                                                {
                                                    borough: "Brooklyn",
                                                    neighborhoods: [
                                                        "Williamsburg", "Bushwick", "Greenpoint", "Dumbo",
                                                        "Fort Greene", "Clinton Hill", "Boerum Hill", "Cobble Hill",
                                                        "Carroll Gardens", "Park Slope", "Bed-Stuy", "Crown Heights"
                                                    ]
                                                }
                                            ].map((group) => (
                                                <div key={group.borough}>
                                                    <h3 className="px-8 py-3 text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase bg-zinc-50/50">{group.borough}</h3>
                                                    {group.neighborhoods.map(name => (
                                                        <button
                                                            key={name}
                                                            disabled={formData.notFamiliar}
                                                            onClick={() => {
                                                                const current = formData.neighborhoods;
                                                                setFormData({
                                                                    ...formData,
                                                                    neighborhoods: current.includes(name) ? current.filter(n => n !== name) : [...current, name]
                                                                });
                                                            }}
                                                            className={cn(
                                                                "w-full px-8 py-5 flex justify-between items-center border-b border-zinc-50 transition-colors",
                                                                formData.neighborhoods.includes(name) ? "bg-zinc-100/50 font-bold" : "",
                                                                formData.notFamiliar ? "opacity-30 cursor-not-allowed" : "hover:bg-zinc-50"
                                                            )}
                                                        >
                                                            <span className="text-lg font-serif italic">{name}</span>
                                                            {formData.neighborhoods.includes(name) && <Check className="w-4 h-4" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Step: Location */}
                                {step === "location" && (
                                    <div className="flex-1 flex flex-col items-center justify-between pb-12 pt-8">
                                        <div className="space-y-4 text-center">
                                            <div className="w-48 h-48 bg-zinc-50 rounded-[40px] flex items-center justify-center mx-auto mb-8">
                                                <MapPin className="w-10 h-10 text-zinc-900" />
                                            </div>
                                            <h1 className="text-4xl font-serif tracking-tight leading-tight">Enable Location</h1>
                                            <p className="text-zinc-400">We need your location for hyper-local maps.</p>
                                        </div>
                                        <div className="w-full space-y-4">
                                            <button onClick={() => requestLocation()} className="w-full py-5 bg-black text-white rounded-3xl font-bold text-sm shadow-xl">Allow Location</button>
                                            <button onClick={handleNext} className="w-full py-3 text-sm font-medium text-zinc-400">Not now</button>
                                        </div>
                                    </div>
                                )}

                                {/* Step: Dislikes */}
                                {step === "dislikes" && (
                                    <div className="space-y-10 flex-1 flex flex-col min-h-0">
                                        <h1 className="text-4xl font-serif tracking-tight leading-tight">Any places you don&apos;t like?</h1>
                                        <div className="space-y-0 -mx-8 overflow-y-auto flex-1 pb-10 min-h-0">
                                            {[
                                                { name: "Bars", options: ["Dive Bars", "Sports Bars", "Cocktail Bars"] },
                                                { name: "Clubs", options: ["Nightclubs", "Techno Clubs"] },
                                                { name: "Vibe", options: ["Too Loud", "Too Crowded", "Expensive"] }
                                            ].map(category => (
                                                <div key={category.name} className="px-8 py-4">
                                                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">{category.name}</h3>
                                                    <div className="flex flex-wrap gap-2">
                                                        {category.options.map(opt => (
                                                            <button
                                                                key={opt}
                                                                onClick={() => {
                                                                    const current = formData.dislikes;
                                                                    setFormData({ ...formData, dislikes: current.includes(opt) ? current.filter(d => d !== opt) : [...current, opt] });
                                                                }}
                                                                className={cn("px-4 py-2 rounded-full border text-sm transition-all", formData.dislikes.includes(opt) ? "bg-black text-white border-black" : "border-zinc-200 text-zinc-600")}
                                                            >
                                                                {opt}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Step: Social */}
                                {step === "social" && (
                                    <div className="space-y-12">
                                        <div className="space-y-2">
                                            <h1 className="text-4xl font-serif tracking-tight leading-tight">Link your socials</h1>
                                            <p className="text-sm text-zinc-400">Build your reputation.</p>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3 border-b-2 border-zinc-100 focus-within:border-black transition-all pb-2">
                                                <Instagram className="w-5 h-5 text-zinc-400" />
                                                <input
                                                    type="text"
                                                    value={formData.instagram}
                                                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                                                    placeholder="Instagram handle"
                                                    className="flex-1 bg-transparent text-xl font-serif italic focus:outline-none placeholder:text-zinc-200"
                                                />
                                            </div>
                                            <div className="flex items-center gap-3 border-b-2 border-zinc-100 focus-within:border-black transition-all pb-2">
                                                <Music2 className="w-5 h-5 text-zinc-400" />
                                                <input
                                                    type="text"
                                                    value={formData.tiktok}
                                                    onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
                                                    placeholder="TikTok handle"
                                                    className="flex-1 bg-transparent text-xl font-serif italic focus:outline-none placeholder:text-zinc-200"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Navigation Buttons (Common for steps that aren't specialized) */}
                                {step !== "location" && (
                                    <div className="pt-4 mt-auto">
                                        <button
                                            onClick={handleNext}
                                            disabled={!isStepValid()}
                                            className="w-full bg-black text-white py-6 rounded-3xl font-medium text-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Continue"}
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </main>
                </AppContainer>

                {/* Right: Visual Panel (Desktop only) */}
                <div className="hidden md:block md:w-1/2 h-screen sticky top-0">
                    <div
                        className="w-full h-full flex items-center justify-center transition-all duration-500"
                        style={{
                            background: currentVisual.type === 'gradient'
                                ? currentVisual.value
                                : `url(${currentVisual.value}) center/cover`
                        }}
                    >
                        {currentVisual.type === 'gradient' && (
                            <div className="text-center text-white/90 p-12">
                                <h2 className="text-5xl font-serif mb-4">The Scene</h2>
                                <p className="text-lg font-light">NYC's Nightlife, Curated</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
