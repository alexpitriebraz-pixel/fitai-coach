# Samsung Galaxy Watch / Wear OS Integration Scaffold

## Status: Planned (Post-MVP)

This directory is reserved for the Samsung Galaxy Watch (Wear OS) companion app.

## Planned Features
- Rest timer on watch display
- Log sets via touch/rotary bezel
- Vibration alert when rest is done
- Heart rate monitoring during workouts

## Implementation Path

### Option A: react-native-wear-connectivity
```bash
npm install @visybl/react-native-wear-connectivity
```
- Wearable Data Layer API bridge
- Send/receive messages between phone and watch

### Option B: Standalone Wear OS App (Kotlin/Jetpack Compose)
- Build separate Wear OS module
- Use Wearable Data Layer API for sync
- Deploy as companion app on Google Play

### Directory Structure (to be created)
```
galaxy-watch/
├── WearApp/
│   ├── src/main/
│   │   ├── kotlin/com/fitaicoach/wear/
│   │   │   ├── MainActivity.kt           # Entry point
│   │   │   ├── RestTimerScreen.kt        # Timer tile
│   │   │   ├── WorkoutLogScreen.kt       # Set logger
│   │   │   └── DataLayerService.kt       # Phone comms
│   │   └── res/
│   │       └── layout/                   # Wear OS layouts
│   └── build.gradle
└── plugins/
    └── withWearOS.js                     # Expo config plugin
```

### TODOs
- [ ] Create Wear OS app module in Android project
- [ ] Implement Wearable Data Layer for phone sync
- [ ] Build Tiles for rest timer and quick workout log
- [ ] Add rotary input for weight/reps selection
- [ ] Implement vibration patterns for timer alerts
- [ ] Connect to Samsung Health SDK for heart rate (optional)
- [ ] Publish companion app alongside main Android app
