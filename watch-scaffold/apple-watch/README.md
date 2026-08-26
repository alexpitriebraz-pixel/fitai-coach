# Apple Watch Integration Scaffold

## Status: Planned (Post-MVP)

This directory is reserved for the Apple Watch companion app.

## Planned Features
- Rest timer display on watch face
- Log sets with digital crown (weight/reps)
- Haptic feedback on rest timer completion
- Quick workout start from watch

## Implementation Path

### Option A: react-native-watch-connectivity
```bash
npm install react-native-watch-connectivity
```
- Enables WatchKit communication over BLE
- Works with WatchKit app written in Swift
- Send workout state to watch, receive logged sets back

### Option B: Expo Config Plugin (Custom Native Module)
- Create `plugins/withAppleWatch.js`
- Add WatchKit extension target to Xcode project
- Build WatchKit app separately in Xcode

### Directory Structure (to be created)
```
apple-watch/
├── WatchApp/
│   ├── ContentView.swift          # Main watch UI
│   ├── RestTimerView.swift        # Timer on watch face
│   ├── WorkoutLogView.swift       # Quick set logger
│   └── WatchConnectivity.swift    # Comms with phone
└── plugins/
    └── withAppleWatch.js          # Expo config plugin
```

### TODOs
- [ ] Create WatchKit extension target
- [ ] Implement WCSession for phone<->watch communication
- [ ] Build rest timer UI in SwiftUI
- [ ] Build set logger with digital crown input
- [ ] Add workout state sync (active exercise, current set)
- [ ] Haptic feedback on timer completion
- [ ] Submit companion app with main app binary
