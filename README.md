# Dynamic UI List (Expo)

Expo + React Native demo that highlights a dynamic user list, custom native modules for battery/device/face recognition, and a lightweight MVVM screen structure.

## Highlights
- Custom native modules: battery info (with event updates), device info caching, face recognition with detailed error mapping.
- Dynamic list (`src/components/DynamicList`) that adapts layout per user type: animated admin carousel, member grid, guest feed, and infinite scroll hook.
- Rich `UserCard` with gradients, avatars/initials, sound per role, haptics/vibration, and modal details with blur.
- Expo Router navigation samples for tabs, drawer, and stacked flows.

## Project Structure
```
.
├── app/                     # Expo Router entry points (tabs, drawer, feature stacks)
├── src/
│   ├── components/          # UI atoms/molecules (DynamicList, UserCard, Button, etc.)
│   ├── features/            # MVVM models/view-models per screen
│   ├── hooks/               # Theme + shared hooks
│   ├── native_modules/      # TS facades over platform modules (BatteryModule, DeviceInfoModule, FaceAPI)
│   ├── screens/             # Screen containers/views
│   ├── services/            # API service shell
│   ├── store/               # App state wiring
│   ├── theme/               # Colors & theming
│   └── utils/               # Helpers
├── assets/                  # Images/sound used by cards
├── android/                 # Native Android project
│   ├── app/src/main/java/.../MainApplication.java   # register packages
│   ├── app/src/main/java/.../modules/               # BatteryModule, DeviceInfoModule, FaceRecognizer + *Package
│   ├── app/src/main/AndroidManifest.xml             # permissions for battery/camera/network/storage
│   ├── app/src/main/res/raw/                         # ML models or bundled assets
│   ├── app/build.gradle | gradle.properties          # module deps/flags
│   └── gradle/                                       # gradle wrapper
├── ios/                      # Native iOS project (mirror registrations/bridging)
└── FACE_MODULE_TROUBLESHOOTING.md / ROUTE_TROUBLESHOOTING.md
```

## Native Modules
- **BatteryModule (`src/native_modules/BatteryModule.ts`)**
  - `getBatteryInfo()` returns `{ level, status, health, temperature, plugged }` with simple caching.
  - `addListener(cb)` subscribes to `DeviceEventEmitter` (`BatteryUpdated`) and keeps the cache in sync.
  - `refresh()` forces a native fetch when you need a hard refresh.
- **DeviceInfoModule (`src/native_modules/DeviceModule.ts`)**
  - Cached helpers: `getBatteryInfo`, `getStorageInfo`, `getMemoryInfo`, `getDeviceInfo`.
  - `refresh*` methods bypass the cache to re-read from native.
- **FaceAPI (`src/native_modules/FaceAPI.ts`)**
  - `addFace(imageUrl, personId)` uploads and stores a face (Cloudinary URL expected).
  - `recognize(imageUrl)` returns `{ personId, score }`.
  - `compare(storedUrl, localPath)` returns `{ match, score }` with strong validation and `FaceAPIError` mapping (validation, download/file/read/model/tflite issues).
  - See `src/native_modules/FaceAPI.example.ts` for usage patterns with error handling.

> Register these modules on the native side (Android/iOS) and use a Development Build/Dev Client; they are not available in Expo Go.

### Native module folder layout (overview)
- `src/native_modules/` – JS/TS facades you call from React Native.
  - `BatteryModule.ts` – wraps the native battery module and DeviceEventEmitter bridge.
  - `DeviceModule.ts` – wraps device/storage/memory info with caching.
  - `FaceAPI.ts` – wraps face recognition native module with validation/error mapping.
  - `FaceAPI.example.ts` – sample usage and error-handling patterns.
- `android/` – register modules in the native project (e.g., `BatteryModule.java`/`DeviceInfoModule.java`/`FaceRecognizerModule.java`, plus package/registry wiring).
- `ios/` – mirror registrations (e.g., `BatteryModule.swift`/`DeviceInfoModule.swift`/`FaceRecognizerModule.swift` and bridging headers if needed).
- `assets/` – store any model files or sound/image assets required by the modules.
- `app.json`/`eas.json` – ensure native modules are bundled in dev clients/builds.

### Android native project (where to wire modules)
- `android/app/src/main/java/.../MainApplication.java` – add your native module packages to `getPackages()`.
- `android/app/src/main/java/.../MainActivity.java` – usually no changes unless handling intents/permissions.
- `android/app/src/main/java/.../modules/` (recommended) – place `BatteryModule.java`, `DeviceInfoModule.java`, `FaceRecognizerModule.java` and their `*Package` classes.
- `android/app/src/main/AndroidManifest.xml` – declare permissions (e.g., battery stats, camera, storage/network for face downloads).
- `android/app/src/main/res/raw/` – drop ML models or asset files if needed by face recognition.
- `android/gradle.properties` / `android/app/build.gradle` – add dependency flags or native libs if your modules need them.

### Quick usage examples
```ts
import BatteryModule from "../src/native_modules/BatteryModule";
import FaceAPI from "../src/native_modules/FaceAPI";

const info = await BatteryModule.getBatteryInfo();
const remove = BatteryModule.addListener(setInfo); // unsubscribe: remove()

const { match, score } = await FaceAPI.compare(storedUrl, localImagePath);
```

## Dynamic List (custom FlatList)
`src/components/DynamicList/DynamicList.tsx` orchestrates multiple list styles in one feed:
- Admins: animated horizontal carousel (`Animated.FlatList`) with center scaling.
- Members: responsive two-column grid.
- Guests: vertical feed.
- Pass `loadMore` to append new data when scrolling (`onEndReached`).

Use it by passing user data with a `type` field and optional `avatar`:
```tsx
<DynamicList
  data={[
    { id: "1", name: "Ava Admin", email: "...", phone: "...", company: "...", type: "admin", avatar: "https://..." },
    { id: "2", name: "Mia Member", email: "...", phone: "...", company: "...", type: "member" },
    { id: "3", name: "Gus Guest", email: "...", phone: "...", company: "...", type: "guest" }
  ]}
  loadMore={fetchMoreUsers}
/>
```

`UserCard` (used inside the list) plays a short sound per role, vibrates on tap, shows an avatar/initial, and opens a modal with a blurred backdrop for details.

## Running the app
1) Install deps: `npm install`  
2) Start Metro: `npx expo start`  
3) Run on device/emulator:
   - Expo Go: good for UI work (native modules unavailable).
   - Dev Client/Development Build: `npm run android` or `npm run ios` to access native modules.

## Screenshot
![Dynamic list](Screenshot%20from%202025-11-24%2017-20-20.png)

## Troubleshooting
- Native face module issues: see `FACE_MODULE_TROUBLESHOOTING.md`.
- Navigation/routing quirks with Expo Router: see `ROUTE_TROUBLESHOOTING.md`.
