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

## Getting Started & Setup

### Prerequisites

- Node.js >= 22.11.0
- JDK 17+ (for Android builds)
- Android SDK & Android Studio (for Android)
- Xcode & CocoaPods (for iOS on macOS)

### 1. Installation

Install project dependencies:
```bash
npm install
```

For iOS, install CocoaPods dependencies:
```bash
cd ios && bundle exec pod install && cd ..
```

### 2. Running the App

1. **Start Metro Bundler:**
   ```bash
   npm start
   ```

2. **Run on Android:**
   ```bash
   npm run android
   ```

3. **Run on iOS:**
   ```bash
   npm run ios
   ```

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
