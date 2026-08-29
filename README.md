# Dolphin360 Mobile App

A cross-platform React Native enterprise mobile application for Dolphin360Suite CRM & Business Operations.

## Features

- **Authentication & Security**
  - Enterprise login with work credentials
  - Forgot password and reset password flow
  - JWT token lifecycle management with automatic refresh interceptors
  - Secure hardware-backed credential storage using React Native Keychain
- **Executive CRM Dashboard**
  - Live workspace metrics & permission matrix overview
  - Multi-tenant workspace switcher and dynamic module launcher
- **Modules & Quick Access**
  - Dynamic CRM module discovery from API
  - Quick navigation drawer for workspace tools
- **Executive Profile & Account Settings**
  - Account information, tenant ID, and assigned role matrix
  - In-app password change

## Tech Stack

- **Framework**: React Native 0.87.1 (React 19)
- **Language**: TypeScript
- **Navigation**: React Navigation (Native Stack + Bottom Tabs)
- **HTTP Client**: Axios with interceptors
- **Secure Storage**: react-native-keychain
- **Icons**: lucide-react-native

## Getting Started

### Prerequisites

- Node.js >= 22.11.0
- JDK 17+ (for Android builds)
- Android SDK & Android Studio (for Android)
- Xcode & CocoaPods (for iOS on macOS)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Install iOS CocoaPods (iOS only):
   ```bash
   cd ios && bundle exec pod install && cd ..
   ```

### Running the App

1. Start the Metro bundler:
   ```bash
   npm start
   ```

2. Run on Android:
   ```bash
   npm run android
   ```

3. Run on iOS:
   ```bash
   npm run ios
   ```

---

## Redmi / Xiaomi (MIUI & HyperOS) Device Setup

To run and debug the application on physical Redmi / Xiaomi / POCO devices, follow the setup steps and commands below:

### 1. Enable Developer Options
1. Open **Settings** on your Redmi device.
2. Go to **About phone**.
3. Tap on **MIUI version** (or **OS version** on HyperOS) repeatedly **7 times** until you see *"You are now a developer!"*.

### 2. Enable Required MIUI Developer Settings
1. Go to **Settings** > **Additional settings** > **Developer options**.
2. Turn **ON** the following toggles:
   - **USB debugging**: `Enabled`
   - **Install via USB**: `Enabled` *(Crucial: Allows installing the debug APK via ADB)*
   - **USB debugging (Security settings)**: `Enabled` *(Allows permission management via ADB)*
   - *(Optional)*: If app installation fails with `INSTALL_FAILED_USER_RESTRICTED`, scroll to the bottom and turn **OFF** `MIUI Optimization` / `System Optimization`.

### 3. Connect & Run Commands

1. **Verify device connection:**
   ```bash
   adb devices
   ```
   *(Ensure your Redmi device appears as `device`, not `unauthorized`. Accept the USB debugging prompt on your phone if prompted).*

2. **Reverse Metro bundler port (Required for Redmi / MIUI):**
   ```bash
   adb reverse tcp:8081 tcp:8081
   ```

3. **Build and launch on your connected Redmi phone:**
   ```bash
   npm run android
   ```

4. **Restart ADB server (if device is offline/not detected):**
   ```bash
   adb kill-server && adb start-server
   ```

---

## Project Structure

```
src/
├── api/          # API client and service endpoints
├── assets/       # Static assets, branding, and images
├── components/   # Reusable UI components and drawers
├── context/      # React context providers (AuthContext)
├── navigation/   # Navigation stacks and tabs
├── screens/      # Screen components (Auth & Main)
├── storage/      # Secure keychain storage helpers
└── types.ts      # Global TypeScript definitions
```
