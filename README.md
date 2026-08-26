# FitAI Coach

An AI-powered personal fitness coaching app for iOS and Android. Built with Expo (managed workflow), TypeScript, and Claude AI.

## Features

- **AI Coach** — Chat with Claude to get personalized workout plans, nutrition tips, and exercise guidance
- **Workout Tracking** — Log sets, reps, and weight with a built-in rest timer
- **Exercise Library** — 50+ exercises with instructions, organized by category
- **Progress Charts** — Visual workout streak and frequency tracking
- **Freemium Model** — Free tier with 3 AI messages/day; Premium via RevenueCat
- **3 Languages** — English, Brazilian Portuguese, and Spanish (i18next)
- **Dark/Light Mode** — Dark by default, toggleable in Settings
- **Compliance** — Privacy Policy, Terms of Service, data deletion flow (App Store / Play Store ready)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Expo SDK 51 (managed workflow) |
| Language | TypeScript |
| Navigation | React Navigation 6 (bottom tabs + native stack) |
| State | Zustand |
| AI | Anthropic Claude API (`claude-haiku-4-5`) |
| Subscriptions | RevenueCat (`react-native-purchases`) |
| i18n | i18next + react-i18next |
| Storage | AsyncStorage |
| Notifications | Expo Notifications |

## Project Structure

```
FitAI/
├── App.tsx                        # Entry point, hydration, init
├── app.json                       # Expo config
├── assets/                        # Icons, splash screens
├── watch-scaffold/
│   ├── apple-watch/               # WatchKit scaffold (future)
│   └── galaxy-watch/             # Wear OS scaffold (future)
└── src/
    ├── components/
    │   ├── common/                # Button, Card, SafeView, LoadingSpinner
    │   ├── coach/                 # ChatMessage, MessageInput
    │   └── workout/               # RestTimer
    ├── constants/
    │   ├── colors.ts              # Design tokens (accent: #FF6B2C)
    │   ├── exercises.ts           # 50+ exercise definitions
    │   └── index.ts               # App constants, system prompt, DB schema
    ├── hooks/
    │   └── useTheme.ts            # Theme-aware color hook
    ├── localization/
    │   ├── index.ts               # i18next setup
    │   ├── en.json
    │   ├── pt-BR.json
    │   └── es.json
    ├── navigation/
    │   ├── RootNavigator.tsx      # Root: Onboarding ↔ Main + Modals
    │   ├── OnboardingNavigator.tsx
    │   ├── BottomTabNavigator.tsx
    │   └── WorkoutStackNavigator.tsx
    ├── screens/
    │   ├── onboarding/            # Welcome, Goal, Profile, Equipment, Disclaimer
    │   ├── main/                  # Home, Coach, Workouts, Progress, Settings
    │   ├── workout/               # Detail, Active, ExerciseLibrary, Detail, RestTimer
    │   ├── paywall/               # PaywallScreen
    │   └── legal/                 # PrivacyPolicy, TermsOfService, DataDeletion
    ├── services/
    │   ├── claudeApi.ts           # Anthropic SDK, streaming, plan generation
    │   ├── revenueCat.ts          # Purchases, offerings, mock mode
    │   └── notifications.ts       # Expo Notifications wrapper
    ├── store/
    │   ├── useAppStore.ts         # Profile + settings, AsyncStorage persistence
    │   ├── useWorkoutStore.ts     # Plans, logs, streak, weekly count
    │   ├── useSubscriptionStore.ts# isPremium, daily message quota
    │   └── useChatStore.ts        # Chat history
    ├── types/
    │   ├── index.ts               # All domain types
    │   └── navigation.ts          # Typed navigation params
    └── utils/
        └── nanoid.ts              # Lightweight ID generator
```

## Setup

### 1. Prerequisites

- Node.js 20+
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Xcode) or Android Emulator (Android Studio)

### 2. Clone and install

```bash
git clone <repo>
cd FitAI
npm install
```

### 3. Environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in:

| Variable | Where to get it |
|----------|----------------|
| `EXPO_PUBLIC_ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) |
| `EXPO_PUBLIC_REVENUECAT_IOS_KEY` | RevenueCat dashboard → iOS app |
| `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` | RevenueCat dashboard → Android app |

> **Note:** The app runs without the RevenueCat keys — it falls back to a mock offering so you can test the paywall flow. The Anthropic key is required for live AI chat; without it, the coach will return an API error.

### 4. Add assets

Place the following in `/assets/`:
- `icon.png` — 1024×1024 PNG app icon
- `splash.png` — 1284×2778 PNG splash screen (dark background `#0D0D0D`)
- `adaptive-icon.png` — 1024×1024 foreground for Android adaptive icon
- `notification-icon.png` — PNG for Android notification icon

### 5. Run

```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Expo Go (scan QR with Expo Go app)
npm start
```

## RevenueCat Setup

1. Create an account at [revenuecat.com](https://revenuecat.com)
2. Create a new project → add iOS and Android apps
3. Create an entitlement named **`premium`** (must match `PREMIUM_ENTITLEMENT_ID` in `constants/index.ts`)
4. Create products in App Store Connect / Google Play Console:
   - Monthly: `com.fitaicoach.app.monthly`
   - Annual: `com.fitaicoach.app.annual`
5. Create an Offering named **`default`** with those packages
6. Add your API keys to `.env`

Until real products are configured, the paywall uses mock data — sufficient for UI testing.

## Backend Path (Supabase / Firebase)

The `SUPABASE_SCHEMA` constant in `src/constants/index.ts` documents the database schema. To add a backend:

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the schema SQL (tables: `users`, `workout_logs`, `chat_messages`, `workout_plans`)
3. Add `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` to `.env`
4. Replace AsyncStorage calls in the stores with Supabase queries

All stores are written with clear persistence boundaries — swapping backends only requires changing the read/write calls, not the store logic.

## Smartwatch Integration

See:
- `watch-scaffold/apple-watch/README.md` for WatchKit (Apple Watch)
- `watch-scaffold/galaxy-watch/README.md` for Wear OS (Galaxy Watch)

Both include implementation paths, directory structures, and a full TODO list.

## Building for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure (first time)
eas build:configure

# Build
eas build --platform ios
eas build --platform android
```

Update `extra.eas.projectId` in `app.json` with your EAS project ID.

## App Store Compliance Checklist

- [x] Health disclaimer on onboarding
- [x] AI medical disclaimer in coach header
- [x] Privacy Policy screen
- [x] Terms of Service screen
- [x] Data deletion flow (Settings → Delete Account)
- [x] Age confirmation in health disclaimer (13+)
- [x] No medical diagnosis claims
- [ ] Add actual Privacy Policy / ToS URLs before submission
- [ ] Complete App Store privacy questionnaire
- [ ] Add ATT (App Tracking Transparency) prompt if using analytics

## License

MIT
