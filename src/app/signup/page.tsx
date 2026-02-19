"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

type SignupStep = "invite" | "start" | "phone" | "username" | "name" | "age" | "neighborhoods" | "familiarity" | "dislikes" | "location" | "instagram" | "tiktok" | "email-confirmation-pending";
type LocationPermission = "always" | "while_using" | "never";

function SignupPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();
    const [step, setStep] = useState<SignupStep>("invite");
    const [prevStep, setPrevStep] = useState<SignupStep | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingPhone, setIsCheckingPhone] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [inviteError, setInviteError] = useState<string | null>(null);

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
        tiktok: "",
        inviteCode: ""
    });
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [showCountryModal, setShowCountryModal] = useState(false);

    // Pre-fill invite code from URL query param
    useEffect(() => {
        const code = searchParams.get("invite");
        if (code) {
            setFormData(prev => ({ ...prev, inviteCode: code }));
        }
    }, [searchParams]);

    const [showPassword, setShowPassword] = useState(false);

    const getStepError = (): string | null => {
        if (step === "phone") {
            if (ALLOWED_TEST_DATA.phones.includes(formData.phone)) return null;
            if (formData.phone.length > 0 && formData.phone.length < 10) return "Please enter a valid 10-digit number";
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
                // Formatting the phone number if needed - assuming basic digits for now
                const phoneToCheck = formData.phone.trim();

                // Use the new secure RPC to check for existence
                const { data: exists, error: rpcError } = await supabase
                    .rpc('check_phone_exists', { p_phone: phoneToCheck });

                if (rpcError) {
                    console.error("Error checking phone:", rpcError);
                    // On error, we might want to let them proceed but log it, or block.
                    // Blocking is safer for duplicates but worse for UX if DB is flaky.
                    // For now, let's just log and proceed if it's a transient error, 
                    // but if it exists = true, we block.
                } else if (exists) {
                    setServerError("An account with this phone number already exists.");
                    setIsCheckingPhone(false);
                    return;
                }
            } catch (e) {
                console.error("Check phone exception:", e);
            } finally {
                setIsCheckingPhone(false);
            }
        }

        setPrevStep(step);
        if (step === "invite") setStep("phone");
        else if (step === "phone") setStep("username");
        else if (step === "username") setStep("name");
        else if (step === "name") setStep("age");
        else if (step === "age") setStep("neighborhoods");
        else if (step === "neighborhoods") setStep("dislikes"); // Skip 'familiarity'
        else if (step === "dislikes") setStep("location");
        else if (step === "location") setStep("instagram");
        else if (step === "instagram") setStep("tiktok");
        else if (step === "tiktok") handleCompleteSignup();

    };

    const handleCompleteSignup = async () => {
        setIsLoading(true);
        try {
            // Generate email from phone for Supabase auth
            // This allows users to log in with their phone number
            const normalizedPhone = formData.phone.replace(/\D/g, "");
            const generatedEmail = `${formData.countryCode.replace("+", "")}${normalizedPhone}@thescene.app`;
            const generatedPassword = formData.password || `scene_${normalizedPhone}_auth`;

            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: generatedEmail,
                password: generatedPassword,
                options: {
                    data: {
                        full_name: `${formData.firstName} ${formData.lastName}`,
                        username: formData.username,
                        first_name: formData.firstName,
                        last_name: formData.lastName,
                        phone: formData.phone,
                        age_bracket: formData.ageBracket,
                        neighborhoods: formData.neighborhoods,
                        not_familiar: formData.notFamiliar,
                        dislikes: formData.dislikes,
                        location_permission: formData.locationPermission || "never",
                        instagram: formData.instagram,
                        tiktok: formData.tiktok
                    }
                }
            });

            if (authError) {
                console.error("Signup error:", authError.message);
                setServerError(authError.message);
                setIsLoading(false);
                return;
            }

            if (authData.user) {
                // Redeem invite code if provided
                if (formData.inviteCode.trim()) {
                    try {
                        await supabase.rpc("redeem_invite_code", {
                            p_code: formData.inviteCode.trim(),
                            p_redeemer_id: authData.user.id
                        });
                    } catch (inviteErr) {
                        console.error("Invite redemption error:", inviteErr);
                        // Don't block signup for invite errors
                    }
                }

                // 2. Check if session exists (user is logged in)
                if (authData.session) {
                    // User is logged in (email confirmation disabled or auto-confirmed)
                    router.push("/discover");
                    router.refresh();
                } else {
                    // Email confirmation required - show pending screen
                    setStep("email-confirmation-pending");
                }
            }
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
        if (step === "invite") {
            router.push("/");
            return;
        }
        else if (step === "phone") setStep("invite");
        else if (step === "username") setStep("phone");
        else if (step === "name") setStep("username");
        else if (step === "age") setStep("name");
        else if (step === "neighborhoods") setStep("age");
        else if (step === "dislikes") setStep("neighborhoods"); // Skip 'familiarity'
        else if (step === "location") setStep("dislikes");
        else if (step === "instagram") setStep("location");
        else if (step === "tiktok") setStep("instagram");
    };

    const isStepValid = () => {
        if (error) return false;
        if (step === "invite") return true; // invite code is optional
        if (step === "phone") return formData.phone.length >= 10 || ALLOWED_TEST_DATA.phones.includes(formData.phone);
        if (step === "name") return formData.firstName.trim() !== "" && formData.lastName.trim() !== "";
        if (step === "username") return formData.username.length >= 6 || ALLOWED_TEST_DATA.usernames.includes(formData.username);
        if (step === "age") return formData.ageBracket !== null;
        if (step === "neighborhoods") return formData.notFamiliar || formData.neighborhoods.length > 0;
        if (step === "dislikes") return true;
        if (step === "location") return true;
        if (step === "instagram") return true;
        if (step === "tiktok") return true;
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

    // Total steps calculation
    const currentStepIndex = ["invite", "start", "phone", "username", "name", "age", "neighborhoods", "familiarity", "dislikes", "location", "instagram", "tiktok"].indexOf(step);
    const totalSteps = 12;
    const progress = Math.max(0, (currentStepIndex / (totalSteps - 1)) * 100);

    const direction = prevStep ? (getStepOrder(step) > getStepOrder(prevStep) ? 1 : -1) : 1;

    function getStepOrder(s: SignupStep) {
        const orders: Record<SignupStep, number> = {
            "invite": -2,
            "start": -1,
            "phone": 0,
            "username": 1,
            "name": 2,
            "age": 3,
            "neighborhoods": 4,
            "familiarity": 5,
            "dislikes": 6,
            "location": 7,
            "instagram": 8,
            "tiktok": 9,
            "email-confirmation-pending": 10
        };
        return orders[s] ?? 0;
    }

    const getStepVisual = () => {
        const visuals: Record<SignupStep, { type: 'gradient' | 'image'; value: string }> = {
            "invite": { type: 'gradient', value: 'linear-gradient(135deg, #434343 0%, #000000 100%)' },
            "start": { type: 'image', value: '/images/landing-bg.jpg' },
            "phone": { type: 'gradient', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
            "username": { type: 'gradient', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
            "name": { type: 'gradient', value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
            "age": { type: 'gradient', value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
            "neighborhoods": { type: 'gradient', value: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)' },
            "familiarity": { type: 'gradient', value: 'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)' },
            "dislikes": { type: 'gradient', value: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
            "location": { type: 'gradient', value: 'linear-gradient(135deg, #ff9a56 0%, #ff6a95 100%)' },
            "instagram": { type: 'gradient', value: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)' },
            "tiktok": { type: 'gradient', value: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)' },
            "email-confirmation-pending": { type: 'gradient', value: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)' }
        };
        return visuals[step];
    };

    const currentVisual = getStepVisual();

    return (
        <div className="flex justify-center min-h-screen bg-white text-black w-full">
            {/* Desktop Split Screen Layout */}
            <div className="w-full flex">
                {/* Left: Form Content (Always visible) */}
                <AppContainer className="bg-white md:w-1/2 md:max-w-none h-[100dvh] flex flex-col relative overflow-hidden p-0">
                    <TopBar onBack={handleBack} className="md:flex flex-none pt-4 px-6 mb-2" />

                    <main className="flex-1 flex flex-col relative w-full h-full overflow-hidden">
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
                                className="flex flex-col h-full w-full"
                            >
                                {/* Scrollable Content Area */}
                                <div className="flex-1 overflow-y-auto px-6 py-4 no-scrollbar">
                                    {/* Step: Invite Code */}
                                    {step === "invite" && (
                                        <div className="space-y-12">
                                            <div className="space-y-3">
                                                <h1 className="text-4xl font-serif tracking-tight leading-tight">
                                                    Got an invite?
                                                </h1>
                                                <p className="text-zinc-400 text-sm leading-relaxed">
                                                    Enter a friend&apos;s invite code to join their circle. Or skip to continue without one.
                                                </p>
                                            </div>
                                            <div className="relative group">
                                                <div className="border-b-2 border-zinc-100 focus-within:border-black transition-all pb-2">
                                                    <input
                                                        autoFocus
                                                        type="text"
                                                        value={formData.inviteCode}
                                                        onChange={(e) => {
                                                            setFormData({ ...formData, inviteCode: e.target.value.toUpperCase() });
                                                            setInviteError(null);
                                                        }}
                                                        placeholder="SCENE-XXXX-XXXX"
                                                        className="w-full bg-transparent text-xl font-mono focus:outline-none placeholder:text-zinc-200 tracking-wider"
                                                    />
                                                </div>
                                                {inviteError && (
                                                    <p className="mt-4 text-sm text-red-500">{inviteError}</p>
                                                )}
                                                {formData.inviteCode && (
                                                    <p className="mt-4 text-[10px] text-zinc-400 font-mono uppercase tracking-wider">
                                                        Code will be validated after you create your account
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Step: Phone */}
                                    {step === "phone" && (
                                        <div className="space-y-12">
                                            <h1 className="text-4xl font-serif tracking-tight leading-tight">
                                                What&apos;s your number?
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

                                    {/* Step: Neighborhoods */}
                                    {step === "neighborhoods" && (
                                        <div className="space-y-6 flex-1 flex flex-col pb-10 min-h-0">
                                            <h1 className="text-4xl font-serif tracking-tight leading-tight">
                                                Which neighborhoods?
                                            </h1>
                                            <div className="space-y-0 -mx-8 pb-10">
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

                                    {/* Step: Familiarity (Redirect logic handles this, but keeping UI if needed or merging) */}
                                    {/* Actually, familiarity is handled within neighborhoods step above as a toggle. 
                                    But the flow has a distinct 'familiarity' step in the enum. 
                                    Let's skip explicit UI for it if it's integrated, or add a dedicated screen.
                                    For now, assuming neighborhoods step covers it. */}

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
                                        </div>
                                    )}

                                    {/* Step: Dislikes (Preferences) */}
                                    {step === "dislikes" && (
                                        <div className="space-y-10 flex-1 flex flex-col min-h-0">
                                            <h1 className="text-4xl font-serif tracking-tight leading-tight">What are you into?</h1>
                                            <div className="space-y-0 -mx-8 pb-10">
                                                {[
                                                    { name: "By Occasion", options: ["Date Night", "Group Hangouts", "Casual Catch-Up", "Big Night Out"] },
                                                    { name: "By Time", options: ["Daytime", "Happy Hour", "Late Night"] },
                                                    { name: "By Venue Type", options: ["Bars", "Rooftops", "Cocktail Bars", "Wine Bars"] },
                                                    { name: "Discovery", options: ["Hidden Gems", "Work From Bar"] }
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

                                    {/* Step: Instagram */}
                                    {step === "instagram" && (
                                        <div className="space-y-12">
                                            <div className="space-y-2">
                                                <h1 className="text-4xl font-serif tracking-tight leading-tight">Link Instagram</h1>
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
                                            </div>
                                        </div>
                                    )}

                                    {/* Step: TikTok */}
                                    {step === "tiktok" && (
                                        <div className="space-y-12">
                                            <div className="space-y-2">
                                                <h1 className="text-4xl font-serif tracking-tight leading-tight">Link TikTok</h1>
                                                <p className="text-sm text-zinc-400">Build your reputation.</p>
                                            </div>
                                            <div className="space-y-6">
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

                                    {/* Step: Email Confirmation Pending */}
                                    {step === "email-confirmation-pending" && (
                                        <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6">
                                            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-zinc-900">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                                </svg>
                                            </div>
                                            <h1 className="text-3xl font-serif tracking-tight leading-tight">Check your email</h1>
                                            <p className="text-zinc-500 max-w-xs mx-auto">
                                                We sent a confirmation link to <span className="font-semibold text-zinc-900">{formData.email}</span>. Please verify your email to continue.
                                            </p>
                                            <div className="pt-8">
                                                <button
                                                    onClick={() => router.push("/login")}
                                                    className="text-sm font-medium text-zinc-900 underline underline-offset-4"
                                                >
                                                    Back to Login
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Fixed Footer Area */}
                                <div className="flex-none p-6 pt-2 bg-gradient-to-t from-white via-white/95 to-white/0 backdrop-blur-[2px]">
                                    {step === "invite" ? (
                                        <div className="w-full space-y-3">
                                            <button
                                                onClick={handleNext}
                                                disabled={!formData.inviteCode.trim()}
                                                className="w-full bg-black text-white py-6 rounded-3xl font-medium text-lg active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-xl"
                                            >
                                                Continue with Code
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setPrevStep(step);
                                                    setStep("phone");
                                                }}
                                                className="w-full py-3 text-sm font-medium text-zinc-400"
                                            >
                                                Skip — I don&apos;t have a code
                                            </button>
                                        </div>
                                    ) : step === "location" ? (
                                        <div className="w-full space-y-4">
                                            <button onClick={() => requestLocation()} className="w-full py-5 bg-black text-white rounded-3xl font-bold text-sm shadow-xl">Allow Location</button>
                                            <button onClick={handleNext} className="w-full py-3 text-sm font-medium text-zinc-400">Not now</button>
                                        </div>
                                    ) : (
                                        step !== "email-confirmation-pending" && (
                                            <button
                                                onClick={handleNext}
                                                disabled={!isStepValid()}
                                                className="w-full bg-black text-white py-6 rounded-3xl font-medium text-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                                            >
                                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Continue"}
                                            </button>
                                        )
                                    )}
                                </div>
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
                                <p className="text-lg font-light">NYC, Curated. From Coffee to Cocktails.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function SignupPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
            <SignupPageContent />
        </Suspense>
    );
}
