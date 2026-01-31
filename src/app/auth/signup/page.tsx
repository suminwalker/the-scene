"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { TopBar } from "@/components/layout/TopBar";
import { ChevronDown, Eye, EyeOff, Camera, Check, MapPin, Users, Search, MinusCircle, ChevronRight, X as CloseIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type SignupStep = "phone" | "email" | "password" | "name" | "username" | "photo" | "age" | "city" | "location" | "dislikes" | "social";
type LocationPermission = "always" | "while_using" | "never";

export default function SignupPage() {
    const router = useRouter();
    const [step, setStep] = useState<SignupStep>("phone");
    const [prevStep, setPrevStep] = useState<SignupStep | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        phone: "",
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        username: "",
        photo: null as string | null,
        countryCode: "+1",
        countryName: "United States",
        neighborhoods: [] as string[],
        ageBracket: null as string | null,
        dislikes: [] as string[],
        location: null as { lat: number; lng: number } | null,
        locationPermission: null as LocationPermission | null
    });
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [showCountryModal, setShowCountryModal] = useState(false);
    const [countrySearch, setCountrySearch] = useState("");

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

    const error = getStepError();

    const handleNext = () => {
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
            // Save onboarding data for profile
            localStorage.setItem("the_scene_onboarding_data", JSON.stringify({
                ageBracket: formData.ageBracket,
                neighborhoods: formData.neighborhoods,
                dislikes: formData.dislikes
            }));
            router.push("/discover");
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
        else if (step === "city") setStep("age");
        else if (step === "age") setStep("photo");
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
            const hasLetters = /[a-zA-Z]/.test(formData.password);
            const hasNumbers = /[0-9]/.test(formData.password);
            const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);
            return formData.password.length >= 8 && formData.password.length <= 20 && hasLetters && hasNumbers && hasSpecial;
        }
        if (step === "name") return formData.firstName.trim() !== "" && formData.lastName.trim() !== "";
        if (step === "username") return formData.username.length >= 6 || ALLOWED_TEST_DATA.usernames.includes(formData.username);
        if (step === "photo") return true; // Skipable
        if (step === "age") return formData.ageBracket !== null;
        if (step === "city") return formData.neighborhoods.length > 0;
        if (step === "location") return true; // Handled by buttons
        if (step === "dislikes") return true; // Skipable
        if (step === "social") return true; // Skipable
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

    return (
        <div className="flex justify-center min-h-screen bg-white text-black w-full">
            <MobileContainer className="bg-white">
                <TopBar onBack={handleBack} />

                <main className="px-8 pt-12 relative flex-1 flex flex-col min-h-0">
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
                                            <div
                                                onClick={() => setShowCountryModal(true)}
                                                className="flex items-center gap-1 text-zinc-900 font-mono text-lg cursor-pointer hover:bg-zinc-50 px-2 py-1 rounded-md transition-colors"
                                            >
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
                                            By submitting your phone number, you consent to receive informational messages at that number from The Scene. Message and data rates may apply. See our <span className="underline">Privacy Policy</span> and <span className="underline">Terms of Service</span> for more information.
                                        </p>
                                        {error && (
                                            <div className="mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                                <p className="text-sm text-zinc-600 leading-relaxed">
                                                    {error}
                                                </p>
                                                <p className="mt-2 text-sm">
                                                    <span onClick={() => router.push("/auth/login")} className="text-black font-bold underline cursor-pointer">Log in</span> to your existing account.
                                                </p>
                                            </div>
                                        )}
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
                                            <div className="mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                                <p className="text-sm text-zinc-600 leading-relaxed">
                                                    {error}
                                                </p>
                                                <p className="mt-2 text-sm">
                                                    <span onClick={() => router.push("/auth/login")} className="text-black font-bold underline cursor-pointer">Log in</span> to your existing account.
                                                </p>
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
                                        {error && (
                                            <div className="mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                                <p className="text-sm text-zinc-600 leading-relaxed">
                                                    {error}
                                                </p>
                                                <p className="mt-2 text-sm">
                                                    <span onClick={() => router.push("/auth/login")} className="text-black font-bold underline cursor-pointer">Log in</span> to your existing account.
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
                                        <p className="text-sm text-zinc-400">Choose a unique handle (6-8 characters recommended).</p>
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
                                        <p className="text-xs text-zinc-400">You can always change this later.</p>
                                        {error && (
                                            <div className="mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                                <p className="text-sm text-zinc-600 leading-relaxed">
                                                    {error}
                                                </p>
                                                <p className="mt-2 text-sm">
                                                    <span onClick={() => router.push("/auth/login")} className="text-black font-bold underline cursor-pointer">Log in</span> to your existing account.
                                                </p>
                                            </div>
                                        )}
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
                                        <button
                                            onClick={() => {
                                                const input = document.createElement("input");
                                                input.type = "file";
                                                input.accept = "image/*";
                                                input.onchange = (e) => {
                                                    const file = (e.target as HTMLInputElement).files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onload = (re) => setFormData({ ...formData, photo: re.target?.result as string });
                                                        reader.readAsDataURL(file);
                                                    }
                                                };
                                                input.click();
                                            }}
                                            className="absolute bottom-2 right-2 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all"
                                        >
                                            <span className="text-2xl font-light">+</span>
                                        </button>
                                    </div>

                                    <div className="text-center space-y-2">
                                        <h1 className="text-4xl font-serif tracking-tight leading-tight">
                                            Add your profile photo
                                        </h1>
                                        <p className="text-sm text-zinc-400 px-12 leading-relaxed">
                                            Show off the face behind the <span className="line-through opacity-30">belly</span> The Scene
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
                                        <p className="text-sm text-zinc-400">
                                            This helps us recommend the right crowd for you.
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        {["21-24", "25-29", "30-34", "35-39"].map((age) => (
                                            <button
                                                key={age}
                                                onClick={() => setFormData({ ...formData, ageBracket: age })}
                                                className={cn(
                                                    "w-full py-5 text-xl font-serif italic border-b transition-all text-left px-4 flex justify-between items-center",
                                                    formData.ageBracket === age
                                                        ? "border-black text-black font-bold bg-zinc-50"
                                                        : "border-zinc-100 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50/50"
                                                )}
                                            >
                                                <span>{age}</span>
                                                {formData.ageBracket === age && <Check className="w-5 h-5" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Step: Home City */}
                            {step === "city" && (
                                <div className="space-y-6 flex-1 flex flex-col pb-10 min-h-0">
                                    <div className="space-y-2">
                                        <h1 className="text-4xl font-serif tracking-tight leading-tight">
                                            Which neighborhoods are you going out in?
                                        </h1>
                                        <p className="text-zinc-500 text-lg leading-relaxed">
                                            This will be your default location for recommendations, but don't worry, The Scene lets you rank venues anywhere!
                                        </p>
                                    </div>
                                    <div className="space-y-0 -mx-8 overflow-y-auto flex-1 no-scrollbar pb-10 min-h-0">
                                        {[
                                            {
                                                borough: "Manhattan",
                                                neighborhoods: ["West Village", "East Village", "Soho", "Chelsea", "Upper East Side", "Tribeca", "Murray Hill"]
                                            },
                                            {
                                                borough: "Brooklyn",
                                                neighborhoods: ["Williamsburg", "Bushwick", "Greenpoint", "Brooklyn Heights", "Fort Greene", "Dumbo"]
                                            }
                                        ].map((group) => {
                                            const allSelected = group.neighborhoods.every(n => formData.neighborhoods.includes(n));
                                            return (
                                                <div key={group.borough} className="space-y-0">
                                                    <div
                                                        onClick={() => {
                                                            if (allSelected) {
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    neighborhoods: prev.neighborhoods.filter(n => !group.neighborhoods.includes(n))
                                                                }));
                                                            } else {
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    neighborhoods: [...new Set([...prev.neighborhoods, ...group.neighborhoods])]
                                                                }));
                                                            }
                                                        }}
                                                        className={cn(
                                                            "px-8 py-3 border-b flex justify-between items-center cursor-pointer transition-colors",
                                                            allSelected ? "bg-zinc-100 border-zinc-200/50" : "bg-zinc-50/50 border-zinc-100/50 hover:bg-zinc-100/30"
                                                        )}
                                                    >
                                                        <h3 className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase">
                                                            {group.borough}
                                                        </h3>
                                                        <div className={cn(
                                                            "w-5 h-5 rounded border flex items-center justify-center transition-all",
                                                            allSelected ? "bg-zinc-900 border-zinc-900" : "border-zinc-200"
                                                        )}>
                                                            {allSelected && <Check className="w-3.5 h-3.5 text-white" />}
                                                        </div>
                                                    </div>
                                                    {group.neighborhoods.map((name) => (
                                                        <button
                                                            key={name}
                                                            onClick={() => {
                                                                setFormData(prev => {
                                                                    const current = prev.neighborhoods;
                                                                    if (current.includes(name)) {
                                                                        return { ...prev, neighborhoods: current.filter(n => n !== name) };
                                                                    } else {
                                                                        return { ...prev, neighborhoods: [...current, name] };
                                                                    }
                                                                });
                                                            }}
                                                            className={cn(
                                                                "w-full px-8 py-5 flex justify-between items-center transition-all border-b border-zinc-50 group",
                                                                formData.neighborhoods.includes(name) ? "bg-zinc-100/50" : "hover:bg-zinc-100/10"
                                                            )}
                                                        >
                                                            <span className={cn(
                                                                "text-lg transition-colors font-serif italic",
                                                                formData.neighborhoods.includes(name) ? "text-zinc-900 font-bold" : "text-zinc-600"
                                                            )}>{name}</span>
                                                            <div className={cn(
                                                                "w-5 h-5 rounded border flex items-center justify-center transition-all",
                                                                formData.neighborhoods.includes(name) ? "bg-zinc-900 border-zinc-900" : "border-zinc-200 group-hover:border-zinc-300"
                                                            )}>
                                                                {formData.neighborhoods.includes(name) && <Check className="w-3.5 h-3.5 text-white" />}
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="pt-4">
                                        <button
                                            onClick={handleNext}
                                            disabled={!isStepValid()}
                                            className="w-full bg-black text-white py-6 rounded-3xl font-medium text-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Continue
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step: Location Permissions */}
                            {step === "location" && (
                                <div className="flex-1 flex flex-col items-center justify-between pb-12 pt-8">
                                    <div className="flex-1 flex flex-col items-center justify-center space-y-12 text-center">
                                        <div className="relative">
                                            <div className="w-48 h-48 bg-zinc-50 rounded-[40px] flex items-center justify-center relative overflow-hidden ring-1 ring-zinc-100">
                                                <div className="absolute inset-0 opacity-10 scale-150 rotate-12">
                                                    <div className="bg-zinc-400 w-full h-1 my-6" />
                                                    <div className="bg-zinc-400 w-full h-1 my-6" />
                                                    <div className="bg-zinc-400 w-full h-1 my-6" />
                                                    <div className="bg-zinc-400 w-full h-1 my-6" />
                                                </div>
                                                <div className="relative z-10 w-20 h-24 bg-white rounded-3xl shadow-2xl flex items-center justify-center border border-zinc-50 italic font-serif text-3xl font-black text-zinc-900">
                                                    <MapPin className="w-10 h-10 text-zinc-900" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4 px-6 text-center">
                                            <h1 className="text-4xl font-serif tracking-tight leading-tight">
                                                The Scene everywhere
                                            </h1>
                                            <p className="text-sm text-zinc-400 leading-relaxed px-4">
                                                The Scene needs location permission in order to provide hyper-local maps and curated recommendations.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="w-full space-y-4">
                                        <button
                                            onClick={() => setShowLocationModal(true)}
                                            className="w-full py-5 bg-black text-white rounded-3xl font-bold text-sm shadow-xl active:scale-95 transition-all"
                                        >
                                            Allow location
                                        </button>
                                        <button
                                            onClick={() => {
                                                setFormData(prev => ({ ...prev, locationPermission: "never" }));
                                                handleNext();
                                            }}
                                            className="w-full py-3 text-sm font-medium text-zinc-400 active:opacity-60 transition-opacity"
                                        >
                                            Not now
                                        </button>
                                    </div>

                                    {/* Advanced Permission Modal */}
                                    <AnimatePresence>
                                        {showLocationModal && (
                                            <>
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    onClick={() => setShowLocationModal(false)}
                                                    className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[60]"
                                                />
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                                    className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] bg-[#f2f2f2]/95 backdrop-blur-xl rounded-[20px] shadow-2xl z-[70] overflow-hidden border border-white/20"
                                                >
                                                    <div className="p-5 text-center space-y-1">
                                                        <h2 className="text-[17px] font-semibold text-black leading-tight">
                                                            Allow &quot;The Scene&quot; to use your location?
                                                        </h2>
                                                        <p className="text-[13px] text-zinc-600 leading-snug">
                                                            Your location is used to provide hyper-local maps and curated recommendations.
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col border-t border-zinc-300">
                                                        <button
                                                            onClick={() => {
                                                                setFormData(prev => ({ ...prev, locationPermission: "always" }));
                                                                requestLocation();
                                                            }}
                                                            className="px-4 py-3 text-[17px] text-[#007aff] font-medium active:bg-zinc-300 transition-colors border-b border-zinc-300"
                                                        >
                                                            Allow Always
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setFormData(prev => ({ ...prev, locationPermission: "while_using" }));
                                                                requestLocation();
                                                            }}
                                                            className="px-4 py-3 text-[17px] text-[#007aff] font-medium active:bg-zinc-300 transition-colors border-b border-zinc-300"
                                                        >
                                                            While Using App
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setFormData(prev => ({ ...prev, locationPermission: "never" }));
                                                                setShowLocationModal(false);
                                                                handleNext();
                                                            }}
                                                            className="px-4 py-3 text-[17px] text-[#007aff] font-medium active:bg-zinc-300 transition-colors"
                                                        >
                                                            Don&apos;t Allow
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            </>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            {/* Step: Dislikes */}
                            {step === "dislikes" && (
                                <div className="space-y-10 flex-1 flex flex-col min-h-0">
                                    <div className="space-y-2">
                                        <h1 className="text-4xl font-serif tracking-tight leading-tight">
                                            Any places you don&apos;t like?
                                        </h1>
                                        <p className="text-sm text-zinc-400 leading-relaxed">
                                            The Scene won&apos;t recommend these types of venues to you. You can update this list whenever.
                                        </p>
                                    </div>
                                    <div className="space-y-0 -mx-8 overflow-y-auto flex-1 pb-10 min-h-0">
                                        {[
                                            {
                                                name: "Bars",
                                                options: ["Dive Bars", "Sports Bars", "Standing-Only Bars", "Neighborhood Bars", "Cocktail Bars", "Bars with DJs"]
                                            },
                                            {
                                                name: "Rooftops",
                                                options: ["Rooftop Bars", "Hotel Rooftops"]
                                            },
                                            {
                                                name: "Clubs",
                                                options: ["Nightclubs", "Dance Clubs", "Table / Bottle Service Clubs"]
                                            },
                                            {
                                                name: "Lounges",
                                                options: ["Cocktail Lounges", "Hotel Lounges", "Wine Bars"]
                                            }
                                        ].map((group) => {
                                            const allSelected = group.options.every(opt => formData.dislikes.includes(opt));

                                            return (
                                                <div key={group.name} className="space-y-0">
                                                    <div
                                                        onClick={() => {
                                                            if (allSelected) {
                                                                setFormData({
                                                                    ...formData,
                                                                    dislikes: formData.dislikes.filter(d => !group.options.includes(d))
                                                                });
                                                            } else {
                                                                const newDislikes = [...new Set([...formData.dislikes, ...group.options])];
                                                                setFormData({ ...formData, dislikes: newDislikes });
                                                            }
                                                        }}
                                                        className={cn(
                                                            "px-8 py-3 border-b flex justify-between items-center cursor-pointer transition-colors",
                                                            allSelected ? "bg-zinc-100 border-zinc-200/50" : "bg-zinc-50/50 border-zinc-100/50 hover:bg-zinc-100/30"
                                                        )}
                                                    >
                                                        <h3 className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase">
                                                            {group.name}
                                                        </h3>
                                                        <div className={cn(
                                                            "w-5 h-5 rounded border flex items-center justify-center transition-all",
                                                            allSelected ? "bg-zinc-900 border-zinc-900" : "border-zinc-200"
                                                        )}>
                                                            {allSelected && <Check className="w-3.5 h-3.5 text-white" />}
                                                        </div>
                                                    </div>
                                                    {group.options.map((scene) => (
                                                        <button
                                                            key={scene}
                                                            onClick={() => {
                                                                const current = formData.dislikes;
                                                                if (current.includes(scene)) {
                                                                    setFormData({ ...formData, dislikes: current.filter(d => d !== scene) });
                                                                } else {
                                                                    setFormData({ ...formData, dislikes: [...current, scene] });
                                                                }
                                                            }}
                                                            className={cn(
                                                                "w-full px-8 py-5 flex justify-between items-center transition-all border-b border-zinc-50 group",
                                                                formData.dislikes.includes(scene) ? "bg-zinc-100/50" : "hover:bg-zinc-100/10"
                                                            )}
                                                        >
                                                            <span className={cn(
                                                                "text-lg transition-colors font-serif italic",
                                                                formData.dislikes.includes(scene) ? "text-zinc-900 font-bold" : "text-zinc-600"
                                                            )}>{scene}</span>
                                                            <div className={cn(
                                                                "w-5 h-5 rounded border flex items-center justify-center transition-all",
                                                                formData.dislikes.includes(scene) ? "bg-zinc-900 border-zinc-900" : "border-zinc-200 group-hover:border-zinc-300"
                                                            )}>
                                                                {formData.dislikes.includes(scene) && <Check className="w-3.5 h-3.5 text-white" />}
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="pt-6 pb-12">
                                        <button
                                            onClick={handleNext}
                                            className="w-full py-5 bg-black text-white rounded-3xl font-bold text-sm shadow-xl"
                                        >
                                            {formData.dislikes.length > 0 ? `Skip these ${formData.dislikes.length} scenes` : "Nope, I like everything"}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step: Social Discovery */}
                            {step === "social" && (
                                <div className="flex-1 flex flex-col items-center justify-between pb-12 pt-8 overflow-y-auto no-scrollbar min-h-0">
                                    <div className="flex-1 flex flex-col items-center justify-center space-y-12 text-center">
                                        <div className="relative">
                                            <div className="w-48 h-48 bg-zinc-50 rounded-full flex items-center justify-center relative overflow-hidden border-2 border-zinc-100 shadow-inner">
                                                <div className="flex items-center -space-x-8">
                                                    <div className="w-24 h-24 rounded-full border-4 border-white bg-zinc-100 flex items-center justify-center relative z-10 shadow-lg">
                                                        <Users className="w-10 h-10 text-zinc-400" />
                                                    </div>
                                                    <div className="w-24 h-24 rounded-full border-4 border-white bg-zinc-200 flex items-center justify-center relative z-0 shadow-lg">
                                                        <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold shadow-xl">10.0</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4 px-6 text-center">
                                            <h1 className="text-4xl font-serif tracking-tight leading-tight">
                                                Discover your friends already on The Scene
                                            </h1>
                                            <p className="text-sm text-zinc-400 px-4">So you can see where they&apos;re going out.</p>
                                        </div>
                                        <div className="w-full space-y-6 text-left px-8">
                                            {[
                                                { icon: Users, text: "See where friends are going out" },
                                                { icon: Users, text: "Plan group outings" },
                                                { icon: Check, text: "Share recommendations" }
                                            ].map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-4 text-sm font-medium text-zinc-600">
                                                    <div className="w-10 h-10 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center shadow-sm">
                                                        <item.icon className="w-5 h-5 text-zinc-400" />
                                                    </div>
                                                    <span>{item.text}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="w-full space-y-4 mt-10">
                                        <button
                                            onClick={handleNext}
                                            className="w-full py-5 bg-black text-white rounded-3xl font-bold text-sm shadow-xl active:scale-95 transition-all"
                                        >
                                            Allow contacts
                                        </button>
                                        <button
                                            onClick={handleNext}
                                            className="w-full py-3 text-sm font-medium text-zinc-400 active:opacity-60 transition-opacity"
                                        >
                                            Not now
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Common Footer Actions (excluding expanded onboarding screens) */}
                            {!["location", "social", "dislikes", "city"].includes(step) && (
                                <div className="mt-auto pb-12 space-y-4">
                                    <button
                                        onClick={handleNext}
                                        disabled={!isStepValid()}
                                        className={cn(
                                            "w-full py-5 rounded-3xl font-bold text-sm shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3",
                                            isStepValid() ? "bg-black text-white" : "bg-zinc-100 text-zinc-400"
                                        )}
                                    >
                                        Continue
                                    </button>
                                    {step === "photo" && (
                                        <button
                                            onClick={() => setStep("city")}
                                            className="w-full py-2 text-sm font-medium text-zinc-400 active:opacity-60 transition-opacity"
                                        >
                                            Not now
                                        </button>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </main>

                {/* Country Code Selector Modal */}
                <AnimatePresence>
                    {showCountryModal && (
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="absolute inset-0 bg-white z-[100] flex flex-col"
                        >
                            {/* Header */}
                            <div className="relative p-6 flex items-center justify-center border-b border-zinc-100">
                                <h2 className="text-lg font-bold">Select Country</h2>
                                <button
                                    onClick={() => setShowCountryModal(false)}
                                    className="absolute right-6 text-[#1B4B5A] font-medium hover:opacity-70 transition-opacity"
                                >
                                    Close
                                </button>
                            </div>

                            {/* Search */}
                            <div className="p-4 px-6 mt-2">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                    <input
                                        type="text"
                                        placeholder="Enter country name"
                                        value={countrySearch}
                                        onChange={(e) => setCountrySearch(e.target.value)}
                                        className="w-full bg-zinc-100 rounded-xl pl-12 pr-6 py-3 focus:outline-none placeholder:text-zinc-400 transition-all text-sm"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {/* List */}
                            <div className="flex-1 overflow-y-auto no-scrollbar px-6">
                                {COUNTRIES.filter(c =>
                                    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
                                    c.code.includes(countrySearch)
                                ).map((country) => {
                                    const isSelected = formData.countryCode === country.code && formData.countryName === country.name;
                                    return (
                                        <button
                                            key={country.iso}
                                            onClick={() => {
                                                setFormData({ ...formData, countryCode: country.code, countryName: country.name });
                                                setShowCountryModal(false);
                                                setCountrySearch("");
                                            }}
                                            className="w-full py-5 flex items-center gap-4 hover:bg-zinc-50 transition-colors border-b border-zinc-100/50 group"
                                        >
                                            <div className={cn(
                                                "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                                                isSelected ? "bg-[#1B4B5A] border-[#1B4B5A]" : "border-zinc-200"
                                            )}>
                                                {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                                            </div>
                                            <div className="flex-1 flex items-center justify-between">
                                                <span className="text-[17px] text-zinc-900">{country.name}</span>
                                                <span className="text-zinc-400 font-mono text-sm">{country.code}</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </MobileContainer>
        </div>
    );
}

const ALLOWED_TEST_DATA = {
    phones: ["0000000000", "1111111111", "9999999999"],
    emails: ["test@thescene.com", "dev@thescene.com", "qa@thescene.com"],
    usernames: ["tester", "devuser", "qa_user"]
};

const COUNTRIES = [
    { name: "Afghanistan", code: "+93", flag: "🇦🇫", iso: "AF" },
    { name: "Albania", code: "+355", flag: "🇦🇱", iso: "AL" },
    { name: "Algeria", code: "+213", flag: "🇩🇿", iso: "DZ" },
    { name: "American Samoa", code: "+1684", flag: "🇦🇸", iso: "AS" },
    { name: "Andorra", code: "+376", flag: "🇦🇩", iso: "AD" },
    { name: "Angola", code: "+244", flag: "🇦🇴", iso: "AO" },
    { name: "Anguilla", code: "+1264", flag: "🇦🇮", iso: "AI" },
    { name: "Antigua and Barbuda", code: "+1268", flag: "🇦🇬", iso: "AG" },
    { name: "Argentina", code: "+54", flag: "🇦🇷", iso: "AR" },
    { name: "Armenia", code: "+374", flag: "🇦🇲", iso: "AM" },
    { name: "Aruba", code: "+297", flag: "🇦🇼", iso: "AW" },
    { name: "Australia", code: "+61", flag: "🇦🇺", iso: "AU" },
    { name: "Austria", code: "+43", flag: "🇦🇹", iso: "AT" },
    { name: "Azerbaijan", code: "+994", flag: "🇦🇿", iso: "AZ" },
    { name: "Bahamas", code: "+1242", flag: "🇧🇸", iso: "BS" },
    { name: "Bahrain", code: "+973", flag: "🇧🇭", iso: "BH" },
    { name: "Bangladesh", code: "+880", flag: "🇧🇩", iso: "BD" },
    { name: "Barbados", code: "+1246", flag: "🇧🇧", iso: "BB" },
    { name: "Belarus", code: "+375", flag: "🇧🇾", iso: "BY" },
    { name: "Belgium", code: "+32", flag: "🇧🇪", iso: "BE" },
    { name: "Brazil", code: "+55", flag: "🇧🇷", iso: "BR" },
    { name: "Canada", code: "+1", flag: "🇨🇦", iso: "CA" },
    { name: "Chile", code: "+56", flag: "🇨🇱", iso: "CL" },
    { name: "China", code: "+86", flag: "🇨🇳", iso: "CN" },
    { name: "Colombia", code: "+57", flag: "🇨🇴", iso: "CO" },
    { name: "Denmark", code: "+45", flag: "🇩🇰", iso: "DK" },
    { name: "Egypt", code: "+20", flag: "🇪🇬", iso: "EG" },
    { name: "Finland", code: "+358", flag: "🇫🇮", iso: "FI" },
    { name: "France", code: "+33", flag: "🇫🇷", iso: "FR" },
    { name: "Germany", code: "+49", flag: "🇩🇪", iso: "DE" },
    { name: "Greece", code: "+30", flag: "🇬🇷", iso: "GR" },
    { name: "Hong Kong", code: "+852", flag: "🇭🇰", iso: "HK" },
    { name: "Hungary", code: "+36", flag: "🇭🇺", iso: "HU" },
    { name: "Iceland", code: "+354", flag: "🇮🇸", iso: "IS" },
    { name: "India", code: "+91", flag: "🇮🇳", iso: "IN" },
    { name: "Indonesia", code: "+62", flag: "🇮🇩", iso: "ID" },
    { name: "Ireland", code: "+353", flag: "🇮🇪", iso: "IE" },
    { name: "Israel", code: "+972", flag: "🇮🇱", iso: "IL" },
    { name: "Italy", code: "+39", flag: "🇮🇹", iso: "IT" },
    { name: "Japan", code: "+81", flag: "🇯🇵", iso: "JP" },
    { name: "Kenya", code: "+254", flag: "🇰🇪", iso: "KE" },
    { name: "Malaysia", code: "+60", flag: "🇲🇾", iso: "MY" },
    { name: "Mexico", code: "+52", flag: "🇲🇽", iso: "MX" },
    { name: "Morocco", code: "+212", flag: "🇲🇦", iso: "MA" },
    { name: "Netherlands", code: "+31", flag: "🇳🇱", iso: "NL" },
    { name: "New Zealand", code: "+64", flag: "🇳🇿", iso: "NZ" },
    { name: "Nigeria", code: "+234", flag: "🇳🇬", iso: "NG" },
    { name: "Norway", code: "+47", flag: "🇳🇴", iso: "NO" },
    { name: "Philippines", code: "+63", flag: "🇵🇭", iso: "PH" },
    { name: "Portugal", code: "+351", flag: "🇵🇹", iso: "PT" },
    { name: "Singapore", code: "+65", flag: "🇸🇬", iso: "SG" },
    { name: "South Africa", code: "+27", flag: "🇿🇦", iso: "ZA" },
    { name: "South Korea", code: "+82", flag: "🇰🇷", iso: "KR" },
    { name: "Spain", code: "+34", flag: "🇪🇸", iso: "ES" },
    { name: "Sweden", code: "+46", flag: "🇸🇪", iso: "SE" },
    { name: "Switzerland", code: "+41", flag: "🇨🇭", iso: "CH" },
    { name: "Thailand", code: "+66", flag: "🇹🇭", iso: "TH" },
    { name: "Turkey", code: "+90", flag: "🇹🇷", iso: "TR" },
    { name: "United Arab Emirates", code: "+971", flag: "🇦🇪", iso: "AE" },
    { name: "United Kingdom", code: "+44", flag: "🇬🇧", iso: "GB" },
    { name: "United States", code: "+1", flag: "🇺🇸", iso: "US" },
    { name: "Vietnam", code: "+84", flag: "🇻🇳", iso: "VN" },
].sort((a, b) => a.name.localeCompare(b.name));
