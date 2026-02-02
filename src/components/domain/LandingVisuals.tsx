"use client";

import React, { useEffect, useRef } from 'react';

// Declare globals for the dynamically loaded scripts
declare global {
    interface Window {
        gsap: any;
        THREE: any;
    }
}

export function LandingVisuals({ children }: { children?: React.ReactNode }) {
    const containerRef = useRef<HTMLDivElement>(null);

    // "Track, Share, Discover" Slides
    const slides = [
        {
            title: "Track",
            description: "Keep a running list of your favorite places to go out.",
            media: "/track-bg-friends.jpg",
            zoom: 1.0,
            grain: 0.15,
            brightness: 0.9
        },
        {
            title: "Share",
            description: "Send your spots to friends or newcomers to your city.",
            media: "/share-bg-g7x-v2.png",
            zoom: 1.0,
            brightness: 1.2
        },
        {
            title: "Discover",
            description: "See where people are going and what's worth showing up for.",
            media: "/discover-bg-couch.jpg",
            zoom: 1.0,
            grain: 0.15,
            brightness: 1.2
        }
    ];

    useEffect(() => {
        let cleanupRef: (() => void) | null | undefined = null;
        let isMounted = true;

        // --- DYNAMIC SCRIPT LOADING ---
        const loadScripts = async () => {
            const loadScript = (src: string, globalName: string) => new Promise<void>((res, rej) => {
                if ((window as any)[globalName]) { res(); return; }
                // Simple check if script tag already exists
                if (document.querySelector(`script[src="${src}"]`)) {
                    const check = setInterval(() => {
                        if ((window as any)[globalName]) { clearInterval(check); res(); }
                    }, 50);
                    setTimeout(() => { clearInterval(check); rej(new Error(`Timeout waiting for ${globalName}`)); }, 10000);
                    return;
                }
                const s = document.createElement('script');
                s.src = src;
                s.onload = () => { setTimeout(() => res(), 100); };
                s.onerror = () => rej(new Error(`Failed to load ${src}`));
                document.head.appendChild(s);
            });

            try {
                await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js', 'gsap');
                await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', 'THREE');
            } catch (e) {
                console.error('Failed to load base scripts:', e);
            }

            if (isMounted) {
                // Initialize and capture cleanup function
                cleanupRef = await initApplication();
            }
        };

        const initApplication = async () => {
            const THREE = window.THREE;
            const gsap = window.gsap;

            if (!THREE || !gsap) return;

            // --- MAIN LOGIC ---
            const SLIDER_CONFIG: any = {
                settings: {
                    transitionDuration: 1.5, // Faster transition
                    autoSlideSpeed: 4000,
                    currentEffect: "glass",
                    currentEffectPreset: "Default",
                    globalIntensity: 1.0, speedMultiplier: 1.0, distortionStrength: 0.5, colorEnhancement: 1.0,
                    uGlassRefractionStrength: 1.0, // Fixed config to match shader props
                    glassRefractionStrength: 0.8, glassChromaticAberration: 0.5, glassBubbleClarity: 1.0
                },
                effectPresets: { /* ... kept simple ... */ }
            };

            let currentSlideIndex = 0;
            let isTransitioning = false;
            let shaderMaterial: any, renderer: any, scene: any, camera: any;
            let removeMouseListeners: (() => void) | null = null;
            let slideTextures: any[] = [];
            let texturesLoaded = false;
            let autoSlideTimer: any = null;
            let progressAnimation: any = null;
            let sliderEnabled = false;

            const SLIDE_DURATION = () => SLIDER_CONFIG.settings.autoSlideSpeed;
            const PROGRESS_UPDATE_INTERVAL = 50;
            const TRANSITION_DURATION = () => SLIDER_CONFIG.settings.transitionDuration;

            // --- SHADERS ---
            const vertexShader = `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
            const fragmentShader = `
            precision highp float;
            
            uniform sampler2D uTexture1, uTexture2;
            uniform float uProgress;
            uniform float uTime;
            uniform vec2 uMouse;
            uniform float uMouseActive;
            uniform vec2 uResolution, uTexture1Size, uTexture2Size;
            uniform float uZoom1, uZoom2;
            uniform float uGrain;
            uniform float uBrightness;

            // Config uniforms
            uniform float uRevealRadius;
            uniform float uRevealSoftness;
            uniform float uPixelSize;
            uniform float uWaveSpeed;
            uniform float uWaveFrequency;
            uniform float uWaveAmplitude;
            uniform float uMouseRadius;
            
            varying vec2 vUv;
            
            // Bayer 4x4 dithering pattern
            float bayer4x4(vec2 pos) {
                int x = int(mod(pos.x, 4.0));
                int y = int(mod(pos.y, 4.0));
                int index = x + y * 4;
                
                float pattern[16];
                pattern[0] = 0.0;    pattern[1] = 8.0;    pattern[2] = 2.0;    pattern[3] = 10.0;
                pattern[4] = 12.0;   pattern[5] = 4.0;    pattern[6] = 14.0;   pattern[7] = 6.0;
                pattern[8] = 3.0;    pattern[9] = 11.0;   pattern[10] = 1.0;   pattern[11] = 9.0;
                pattern[12] = 15.0;  pattern[13] = 7.0;   pattern[14] = 13.0;  pattern[15] = 5.0;
                
                for (int i = 0; i < 16; i++) {
                    if (i == index) return pattern[i] / 16.0;
                }
                return 0.0;
            }

            vec2 getCoverUV(vec2 uv, vec2 textureSize, float zoom) {
                vec2 s = uResolution / textureSize;
                float scale = max(s.x, s.y) * zoom;
                vec2 scaledSize = textureSize * scale;
                vec2 offset = (uResolution - scaledSize) * 0.5;
                return (uv * uResolution - offset) / scaledSize;
            }
            
            void main() {
                // We use the raw vUv for distortion to keep wave consistent across screen
                vec2 uv = vUv;
                
                // Wave and Ripple Distortions
                float time = uTime;
                float waveStrength = uWaveAmplitude * 0.1;
                
                // Continuous waves
                float wave1 = sin(uv.y * uWaveFrequency + time * uWaveSpeed) * waveStrength;
                float wave2 = sin(uv.x * uWaveFrequency * 0.7 + time * uWaveSpeed * 0.8) * waveStrength * 0.5;
                
                vec2 distortedUv = uv;
                distortedUv.x += wave1;
                distortedUv.y += wave2;
                
                // Mouse interaction (Ripple)
                if (uMouseActive > 0.01) {
                    // Convert mouse to UV space (it's passed as 0..1)
                    vec2 mousePos = uMouse;
                    // Adjust distance for aspect ratio to make ripples circular
                    float aspect = uResolution.x / uResolution.y;
                    vec2 aspectCorrectedUV = vec2(uv.x * aspect, uv.y);
                    vec2 aspectCorrectedMouse = vec2(mousePos.x * aspect, mousePos.y);
                    
                    float dist = distance(aspectCorrectedUV, aspectCorrectedMouse);
                    float mouseInfluence = smoothstep(uMouseRadius, 0.0, dist);
                    
                    float rippleFreq = uWaveFrequency * 5.0;
                    float rippleSpeed = uWaveSpeed * 1.0;
                    float rippleStrength = uWaveAmplitude * 0.05;
                    
                    float ripple = sin(dist * rippleFreq - time * rippleSpeed) * rippleStrength * mouseInfluence * uMouseActive;
                    distortedUv += ripple;
                }
                
                // Calculate cover UVs for both textures using the distorted coordinate and zooms
                vec2 uv1 = getCoverUV(distortedUv, uTexture1Size, uZoom1);
                vec2 uv2 = getCoverUV(distortedUv, uTexture2Size, uZoom2);

                // Texture sampling with bounds check for "contain/zoom-out" support (black bars)
                vec4 t1 = (uv1.x < 0.0 || uv1.x > 1.0 || uv1.y < 0.0 || uv1.y > 1.0) 
                          ? vec4(0.0, 0.0, 0.0, 1.0) 
                          : texture2D(uTexture1, uv1);
                          
                vec4 t2 = (uv2.x < 0.0 || uv2.x > 1.0 || uv2.y < 0.0 || uv2.y > 1.0) 
                          ? vec4(0.0, 0.0, 0.0, 1.0) 
                          : texture2D(uTexture2, uv2);
                
                // Mix textures based on progress
                vec4 color = mix(t1, t2, uProgress);
                
                // Film Grain
                if (uGrain > 0.001) {
                    float noise = fract(sin(dot(uv + mod(uTime, 10.0), vec2(12.9898, 78.233))) * 43758.5453);
                    color.rgb += (noise - 0.5) * uGrain;
                }

                // Brightness / Flash Effect
                color.rgb *= uBrightness;
                
                // Output full color directly (removed B&W/Dither/Reveal)
                gl_FragColor = vec4(color.rgb, 1.0);
            }
            `;
            const fullFragmentShader = fragmentShader; // Use the same one

            const splitText = (text: string) => {
                return text.split('').map(char => `<span style="display: inline-block; opacity: 0;">${char === ' ' ? '&nbsp;' : char}</span>`).join('');
            };

            const updateContent = (idx: number) => {
                const titleEl = document.getElementById('mainTitle');
                const descEl = document.getElementById('mainDesc');
                if (titleEl && descEl) {
                    gsap.to(titleEl.children, { y: -20, opacity: 0, duration: 0.5, stagger: 0.02, ease: "power2.in" });
                    gsap.to(descEl, { y: -10, opacity: 0, duration: 0.4, ease: "power2.in" });

                    setTimeout(() => {
                        if (!titleEl || !descEl) return;
                        titleEl.innerHTML = splitText(slides[idx].title);
                        descEl.textContent = slides[idx].description;

                        gsap.set(titleEl.children, { opacity: 0, y: 20 });
                        gsap.set(descEl, { y: 20, opacity: 0 });

                        const children = titleEl.children;
                        gsap.to(children, { y: 0, opacity: 1, duration: 0.8, stagger: 0.03, ease: "power3.out" });
                        gsap.to(descEl, { y: 0, opacity: 1, duration: 0.8, delay: 0.2, ease: "power3.out" });
                    }, 500);
                }
            };

            const navigateToSlide = (targetIndex: number) => {
                if (isTransitioning || targetIndex === currentSlideIndex) return;
                stopAutoSlideTimer();
                quickResetProgress(currentSlideIndex);

                const currentTexture = slideTextures[currentSlideIndex];
                const targetTexture = slideTextures[targetIndex];
                if (!currentTexture || !targetTexture) return;

                isTransitioning = true;
                shaderMaterial.uniforms.uTexture1.value = currentTexture;
                shaderMaterial.uniforms.uTexture2.value = targetTexture;
                shaderMaterial.uniforms.uTexture1Size.value = currentTexture.userData.size;
                shaderMaterial.uniforms.uTexture2Size.value = targetTexture.userData.size;
                shaderMaterial.uniforms.uZoom1.value = slides[currentSlideIndex].zoom || 1.0;
                shaderMaterial.uniforms.uZoom1.value = slides[currentSlideIndex].zoom || 1.0;
                shaderMaterial.uniforms.uZoom2.value = slides[targetIndex].zoom || 1.0;

                // Animate Grain
                gsap.to(shaderMaterial.uniforms.uGrain, {
                    value: slides[targetIndex].grain || 0.0,
                    duration: TRANSITION_DURATION(),
                    ease: "power2.inOut"
                });

                // Animate Brightness
                gsap.to(shaderMaterial.uniforms.uBrightness, {
                    value: slides[targetIndex].brightness || 1.0,
                    duration: TRANSITION_DURATION(),
                    ease: "power2.inOut"
                });

                // Start text exit animation immediately
                updateContent(targetIndex);

                // Sync Point: At 500ms (matching text swap), update state and start timer
                setTimeout(() => {
                    currentSlideIndex = targetIndex;
                    updateCounter(currentSlideIndex);
                    updateNavigationState(currentSlideIndex);
                    // Start bar filling exactly when text/nav updates
                    safeStartTimer();
                }, 500);

                gsap.fromTo(shaderMaterial.uniforms.uProgress,
                    { value: 0 },
                    {
                        value: 1,
                        duration: TRANSITION_DURATION(),
                        ease: "power2.inOut",
                        onComplete: () => {
                            shaderMaterial.uniforms.uProgress.value = 0;
                            shaderMaterial.uniforms.uTexture1.value = targetTexture;
                            shaderMaterial.uniforms.uTexture1Size.value = targetTexture.userData.size;
                            shaderMaterial.uniforms.uZoom1.value = slides[targetIndex].zoom || 1.0;
                            isTransitioning = false;
                            // Timer already started at sync point
                        }
                    }
                );
            };

            const handleSlideChange = () => {
                if (isTransitioning || !texturesLoaded || !sliderEnabled) return;
                navigateToSlide((currentSlideIndex + 1) % slides.length);
            };

            const createSlidesNavigation = () => {
                const nav = document.getElementById("slidesNav"); if (!nav) return;
                nav.innerHTML = "";
                slides.forEach((slide, i) => {
                    const item = document.createElement("div");
                    // Wrapper for click area
                    item.className = `slide-nav-item cursor-pointer p-2 group`;
                    item.dataset.slideIndex = String(i);

                    // Bubble element
                    const bubble = document.createElement("div");
                    bubble.className = `nav-bubble h-2 bg-white rounded-full transition-all duration-300 ${i === 0 ? 'w-8 opacity-100' : 'w-2 opacity-30 group-hover:opacity-60'}`;
                    item.appendChild(bubble);

                    item.addEventListener("click", (e) => {
                        e.stopPropagation();
                        if (!isTransitioning && i !== currentSlideIndex) {
                            stopAutoSlideTimer();
                            navigateToSlide(i);
                        }
                    });
                    nav.appendChild(item);
                });
            };

            const updateNavigationState = (idx: number) => {
                document.querySelectorAll(".slide-nav-item").forEach((el, i) => {
                    const bubble = el.querySelector(".nav-bubble");
                    if (bubble) {
                        if (i === idx) {
                            bubble.classList.remove("w-2", "opacity-30", "group-hover:opacity-60");
                            bubble.classList.add("w-8", "opacity-100");
                        } else {
                            bubble.classList.remove("w-8", "opacity-100");
                            bubble.classList.add("w-2", "opacity-30", "group-hover:opacity-60");
                        }
                    }
                });
            };

            // Progress bars removed, these are now no-ops to prevent errors if called by timer
            const getProgressFill = (idx: number) => null;
            const updateSlideProgress = (idx: number, prog: number) => { };
            const fadeSlideProgress = (idx: number) => { };
            const quickResetProgress = (idx: number) => { };

            const updateCounter = (idx: number) => {
                const sn = document.getElementById("slideNumber"); if (sn) sn.textContent = String(idx + 1).padStart(2, "0");
                const st = document.getElementById("slideTotal"); if (st) st.textContent = String(slides.length).padStart(2, "0");
            };

            const startAutoSlideTimer = () => {
                if (!texturesLoaded || !sliderEnabled) return;
                stopAutoSlideTimer();
                let progress = 0;
                const increment = (100 / SLIDE_DURATION()) * PROGRESS_UPDATE_INTERVAL;
                progressAnimation = setInterval(() => {
                    if (!sliderEnabled) { stopAutoSlideTimer(); return; }
                    progress += increment;
                    updateSlideProgress(currentSlideIndex, progress);
                    if (progress >= 100) {
                        clearInterval(progressAnimation); progressAnimation = null;
                        fadeSlideProgress(currentSlideIndex);
                        if (!isTransitioning) handleSlideChange();
                    }
                }, PROGRESS_UPDATE_INTERVAL);
            };
            const stopAutoSlideTimer = () => { if (progressAnimation) clearInterval(progressAnimation); if (autoSlideTimer) clearTimeout(autoSlideTimer); progressAnimation = null; autoSlideTimer = null; };
            const safeStartTimer = (delay = 0) => { stopAutoSlideTimer(); if (sliderEnabled && texturesLoaded) { if (delay > 0) autoSlideTimer = setTimeout(startAutoSlideTimer, delay); else startAutoSlideTimer(); } };

            const loadImageTexture = (src: string) => new Promise<any>((resolve, reject) => {
                const l = new THREE.TextureLoader();
                l.load(src, (t: any) => {
                    t.minFilter = THREE.LinearFilter;
                    t.magFilter = THREE.LinearFilter;
                    t.wrapS = THREE.ClampToEdgeWrapping;
                    t.wrapT = THREE.ClampToEdgeWrapping;
                    t.userData = { size: new THREE.Vector2(t.image.width, t.image.height) };
                    resolve(t);
                }, undefined, reject);
            });

            const initRenderer = async () => {
                const canvas = document.querySelector(".webgl-canvas") as HTMLCanvasElement; if (!canvas) return;
                scene = new THREE.Scene();
                // User's camera was: camera={{ position: [0, 0, 1] }} in R3F which defaults to Perspective, but Orthographic is better for 2D. 
                // Let's stick with Orthographic for full control of 2D plane.
                camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
                renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
                renderer.setSize(window.innerWidth, window.innerHeight);
                renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

                // Mouse interaction state
                const mouse = new THREE.Vector2(-10, -10); // Start off-screen
                let mouseActive = 0;
                let isHovering = false;
                const clock = new THREE.Clock();

                // Mouse listeners
                const updateMouse = (e: MouseEvent) => {
                    const rect = canvas.getBoundingClientRect();
                    // Normalize to 0..1, flip Y
                    const x = (e.clientX - rect.left) / rect.width;
                    const y = 1.0 - (e.clientY - rect.top) / rect.height;
                    mouse.set(x, y);
                    if (!isHovering) isHovering = true;
                };

                // Add listener to the parent container
                const onMouseEnter = () => { isHovering = true; };
                const onMouseLeave = () => { isHovering = false; };

                if (canvas.parentElement) {
                    canvas.parentElement.addEventListener('mousemove', updateMouse);
                    canvas.parentElement.addEventListener('mouseenter', onMouseEnter);
                    canvas.parentElement.addEventListener('mouseleave', onMouseLeave);

                    removeMouseListeners = () => {
                        canvas.parentElement?.removeEventListener('mousemove', updateMouse);
                        canvas.parentElement?.removeEventListener('mouseenter', onMouseEnter);
                        canvas.parentElement?.removeEventListener('mouseleave', onMouseLeave);
                    };
                }

                shaderMaterial = new THREE.ShaderMaterial({
                    uniforms: {
                        uTexture1: { value: null }, uTexture2: { value: null }, uProgress: { value: 0 },
                        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
                        uTexture1Size: { value: new THREE.Vector2(1, 1) }, uTexture2Size: { value: new THREE.Vector2(1, 1) },
                        uZoom1: { value: 1.0 }, uZoom2: { value: 1.0 },
                        uGrain: { value: 0.0 },
                        uBrightness: { value: 1.0 },

                        // New Uniforms
                        uTime: { value: 0 },
                        uMouse: { value: mouse },
                        uMouseActive: { value: 0 },

                        // Config (User defaults)
                        uRevealRadius: { value: 0.2 },
                        uRevealSoftness: { value: 0.5 },
                        uPixelSize: { value: 3.0 },
                        uWaveSpeed: { value: 0.5 },
                        uWaveFrequency: { value: 3.0 },
                        uWaveAmplitude: { value: 0.05 },
                        uMouseRadius: { value: 0.2 }
                    },
                    vertexShader,
                    fragmentShader: fullFragmentShader
                });
                scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), shaderMaterial));

                for (const s of slides) { try { slideTextures.push(await loadImageTexture(s.media)); } catch (e) { console.warn("Failed texture", e); } }
                if (slideTextures.length >= 2) {
                    shaderMaterial.uniforms.uTexture1.value = slideTextures[0];
                    shaderMaterial.uniforms.uTexture2.value = slideTextures[1];
                    shaderMaterial.uniforms.uTexture1Size.value = slideTextures[0].userData.size;
                    shaderMaterial.uniforms.uTexture2Size.value = slideTextures[1].userData.size;
                    shaderMaterial.uniforms.uZoom1.value = slides[0].zoom || 1.0;
                    shaderMaterial.uniforms.uZoom2.value = slides[1].zoom || 1.0;
                    shaderMaterial.uniforms.uGrain.value = slides[0].grain || 0.0;
                    shaderMaterial.uniforms.uBrightness.value = slides[0].brightness || 1.0;
                    texturesLoaded = true; sliderEnabled = true;

                    safeStartTimer(500);
                }

                const render = () => {
                    requestAnimationFrame(render);

                    // Update Time
                    shaderMaterial.uniforms.uTime.value = clock.getElapsedTime();

                    // Smooth Mouse Active
                    const targetActive = isHovering ? 1.0 : 0.0;
                    // Lerp factor 0.08 from user code
                    mouseActive += (targetActive - mouseActive) * 0.08;
                    shaderMaterial.uniforms.uMouseActive.value = mouseActive;
                    shaderMaterial.uniforms.uMouse.value.copy(mouse);

                    renderer.render(scene, camera);
                };
                render();
            };

            createSlidesNavigation(); updateCounter(0);

            // Init text content
            const tEl = document.getElementById('mainTitle');
            const dEl = document.getElementById('mainDesc');
            if (tEl && dEl) {
                tEl.innerHTML = splitText(slides[0].title);
                dEl.textContent = slides[0].description;
                gsap.fromTo(tEl.children, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.03, ease: "power3.out", delay: 0.5 });
                gsap.fromTo(dEl, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.8 });
            }

            initRenderer();

            const onVisibilityChange = () => document.hidden ? stopAutoSlideTimer() : (!isTransitioning && safeStartTimer());
            const onWindowResize = () => { if (renderer) { renderer.setSize(window.innerWidth, window.innerHeight); shaderMaterial.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight); } };

            document.addEventListener("visibilitychange", onVisibilityChange);
            window.addEventListener("resize", onWindowResize);

            // Cleanup Closure
            return () => {
                stopAutoSlideTimer();
                document.removeEventListener("visibilitychange", onVisibilityChange);
                window.removeEventListener("resize", onWindowResize);
                if (removeMouseListeners) removeMouseListeners();

                if (window.gsap) window.gsap.killTweensOf("*");

                if (renderer) {
                    renderer.dispose();
                    if (renderer.forceContextLoss) renderer.forceContextLoss();
                }
                if (scene) {
                    scene.traverse((object: any) => {
                        if (object.geometry) object.geometry.dispose();
                        if (object.material) {
                            if (object.material.map) object.material.map.dispose();
                            object.material.dispose();
                        }
                    });
                }
            };
        };

        loadScripts();

        return () => {
            isMounted = false;
            if (cleanupRef) cleanupRef();
        };
    }, []);

    return (
        <div className="relative w-full h-full bg-black text-white overflow-hidden" ref={containerRef}>
            {/* Canvas Layer */}
            <canvas className="webgl-canvas absolute inset-0 w-full h-full z-0 block"></canvas>

            {/* Visibility Overlay: Shaded layer between canvas and text */}
            <div className="absolute inset-0 z-0 bg-black/40 pointer-events-none"></div>

            {/* Overlay: Counters */}
            <div className="absolute top-8 left-8 z-10 font-mono text-xs tracking-widest hidden">
                <span id="slideNumber">01</span> / <span id="slideTotal">03</span>
            </div>

            {/* Overlay: Content */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-8 pointer-events-none">
                <div className="text-center slide-content max-w-sm mt-[-100px]">
                    <h1 className="text-5xl md:text-6xl font-serif tracking-tight mb-4 text-white drop-shadow-xl" id="mainTitle"></h1>
                    <p className="text-zinc-200 text-sm md:text-base leading-relaxed max-w-[280px] mx-auto drop-shadow-md" id="mainDesc"></p>
                </div>
            </div>

            {/* Action Overlay: Buttons passed from parent */}
            <div className="absolute bottom-12 left-0 right-0 z-30 px-8 flex flex-col items-center gap-6">
                {/* Navigation - Horizontal Bottom */}
                <nav className="flex justify-center gap-2 w-full mb-6" id="slidesNav"></nav>

                {children}
            </div>
        </div>
    );
}
