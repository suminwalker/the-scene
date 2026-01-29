# The Scene

**The Scene** is a social discovery platform designed to help you find the best places to go out, connect with friends, and discover what's happening in your city right now.

![The Scene Banner](public/avatars/presets/avatar10.png)
*(Note: Replace with an actual hero screenshot of your app)*

## 🚀 Features

- **Social Discovery**: See where your friends are heading and get real-time tailored recommendations.
- **Interactive Maps**: Hyper-local maps to explore neighborhoods and venues.
- **Curated Lists**: Discover the best bars, clubs, and lounges curated by the community.
- **Vibrant Profiles**: Showcase your social life with a sleek, meaningful profile.
- **Seamless Onboarding**: A smooth, step-by-step signup flow to personalize your experience.

## 🛠 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & Vanilla CSS
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Maps**: [Leaflet](https://leafletjs.com/) & [React Leaflet](https://react-leaflet.js.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🏃‍♂️ Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/suminwalker/the-scene.git
   cd the-scene
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to view the app.

## 📦 Project Structure

```bash
├── public/          # Static assets (avatars, icons)
├── src/
│   ├── app/         # Next.js App Router pages
│   ├── components/  # Reusable UI components
│   │   ├── domain/  # Feature-specific components (Feed, Review)
│   │   ├── layout/  # Layout components (TopBar, BottomNav)
│   │   └── map/     # Map related components
│   ├── lib/         # Utility functions and data
│   └── styles/      # Global styles
└── ...
```

## 🚀 Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=github&utm_campaign=the-scene-readme).

---

Built with ❤️ by Sumin Walker.
