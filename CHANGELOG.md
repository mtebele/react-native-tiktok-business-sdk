# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.7.1] - 2026-07-27

### 🚀 Major Updates

- **Updated to TikTok Business SDK v1.7.1 (iOS) / v1.7.0 (Android)**

### ✨ Features

- **Added `disableSKAdNetworkSupport` option to `TikTokSdkConfig`** (iOS only): disables the SDK's automatic SKAdNetwork support, i.e. registering the app for ad attribution and updating conversion values. Has no effect on Android. Fully backward-compatible — existing calls without the option are unaffected.

### 📱 Platform Updates

- **Android**: bumped `com.android.billingclient:billing` from `7.1.1` to `8.0.0`
- **Android**: added `-keep interface com.android.billingclient.api.* { *; }` ProGuard rule (root and example app) required by the updated billing client

### 📚 Documentation

- **Updated README** with the `disableSKAdNetworkSupport` usage example and the additional ProGuard rule

## [1.6.2] - 2026-05-18

### 🐛 Bug Fixes

- **Fixed iOS compilation error with TikTokBusinessSDK 1.6.1**: `TTCurrency` is now declared as `NS_STRING_ENUM` in the SDK, which Swift bridges as a struct rather than a plain `String`. Updated the `setCurrency` call to use `TTCurrency(rawValue:)` instead of the `as TTCurrency` coercion that no longer compiles.

## [1.6.1] - 2026-05-18

### 🚀 Major Updates

- **Updated to TikTok Business SDK v1.6.1** (iOS and Android)

### ✨ Features

- **Added `TikTokSdkConfig` options to `initializeSdk`** for disabling automatic event tracking at initialization time
  - `disableAutoTracking`: disables all automatic events at once
  - `disableInstallTracking`: disables install event reporting
  - `disableLaunchTracking`: disables app launch event reporting
  - `disableRetentionTracking`: disables 2D-retention event reporting
  - `disablePaymentTracking`: disables automatic in-app purchase event reporting
  - Fully backward-compatible — existing calls without `options` are unaffected

### 🐛 Bug Fixes

- **Fixed currency mapping on iOS**: content events now correctly pass the provided currency string (e.g., `EUR`, `ARS`, `BRL`) instead of always defaulting to `USD`.

### 📚 Documentation

- **Added iOS 14+ tracking permission note**: `NSUserTrackingUsageDescription` must be set in `Info.plist` for install and automatic events to work on iOS 14+

## [1.6.0] - 2025-12-18

### 🚀 Major Updates

- **Updated to TikTok Business SDK v1.6.0** (iOS and Android)

### ✨ Features

- **Added `flush()` method** for manual event synchronization

### 📚 Documentation

- **Added JSDoc annotations** for identify, logout, and flush methods

### 🗑️ Deprecations

- **Deprecated loan-related events**:
  - `LOAN_APPLICATION` (deprecated)
  - `LOAN_APPROVAL` (deprecated)
  - `LOAN_DISBURSAL` (deprecated)

### 📱 Platform Updates

- **iOS**: Updated to TikTokBusinessSDK v1.6.0 via CocoaPods
- **Android**: Updated to tiktok-business-android-sdk v1.6.0 via Gradle

## [1.5.0] - 2025-09-09

### 🚀 Major Updates

- **Updated to TikTok Business SDK v1.5.0** (iOS and Android)

### ✨ Features

- **Added impression-level ad revenue tracking** with new `trackAdRevenueEvent()` method
- **New `IMPRESSION_LEVEL_AD_REVENUE` event type** in `TikTokEventName` enum

### 🐛 Bug Fixes

- **Fixed event name values** to match official TikTok Business SDK format (now uses camelCase instead of UPPER_CASE)

### ⚠️ Breaking Changes

**Event Name Format Update**
Event names now use camelCase format to match the official TikTok Business SDK:

```js
// Before (v1.4.1 and earlier)
TikTokEventName.START_TRIAL = 'START_TRIAL'
TikTokEventName.ADD_PAYMENT_INFO = 'ADD_PAYMENT_INFO'

// After (v1.5.0)
TikTokEventName.START_TRIAL = 'StartTrial'
TikTokEventName.ADD_PAYMENT_INFO = 'AddPaymentInfo'
```

**Migration**: No code changes needed if using the enum constants. Only affects you if using hardcoded string values.

## [1.4.1] - 2025-07-16

### 🚀 Major Updates

- **Updated to TikTok Business SDK v1.4.1** (iOS and Android)
- **Added mandatory `accessToken` parameter** to `initializeSdk()` (Breaking Change)
- **Implemented promise-based API** for all methods with comprehensive error handling
- **Enhanced error handling** with specific error codes (INIT_ERROR, IDENTIFY_ERROR, etc.)

### ✨ Features

- **Full TypeScript support** with improved type definitions
- **Comprehensive test coverage** (93.75% with 70+ tests)
- **Modern SDK APIs usage** (avoiding deprecated methods)
- **Improved developer experience** with better error messages and logging

### 🔧 Technical Improvements

- **iOS Implementation**: Uses modern TikTok SDK APIs (`identifyWithExternalID`, `trackTTEvent`, `initializeSdk` with completionHandler)
- **Android Implementation**: Promise-based async methods with `TTInitCallback` for initialization
- **Error Handling**: Robust try-catch blocks around all native SDK calls

### 🐛 Bug Fixes

- **Fixed ADD_TO_WISHLIST event name** (was incorrectly named ADD_TO_WHISHLIST)

### 📱 Platform Updates

- **iOS**: Updated to TikTokBusinessSDK v1.4.1 via CocoaPods
- **Android**: Updated to tiktok-business-android-sdk v1.4.1 via Gradle
- **Updated ProGuard rules** for Android with additional required classes

### 🧪 Testing

- **Added comprehensive test suite** with 70+ tests covering:
  - Unit tests for all SDK methods
  - Integration tests for user flows
  - Edge case and error handling tests
  - TypeScript type validation tests
  - Native module linking error tests

### 📚 Documentation

- **Updated README** with comprehensive usage examples
- **Added API reference** with TypeScript signatures
- **Included migration guide** for upgrading from v1.3.x
- **Added troubleshooting section** with common issues and solutions
- **Enhanced code examples** with proper error handling

### ⚠️ Breaking Changes

1. **Access Token Required**: 
   ```js
   // Before (v1.3.x)
   await TikTokBusiness.initializeSdk(appId, ttAppId, debug);
   
   // After (v1.4.1)
   await TikTokBusiness.initializeSdk(appId, ttAppId, accessToken, debug);
   ```

2. **Promise-based API**: All methods now return promises
   ```js
   // Before (v1.3.x)
   TikTokBusiness.trackEvent(TikTokEventName.LOGIN); // void
   
   // After (v1.4.1)
   await TikTokBusiness.trackEvent(TikTokEventName.LOGIN); // Promise<string>
   ```

### 🔄 Migration

To upgrade from v1.3.x to v1.4.1:

1. Update your `initializeSdk` calls to include the `accessToken` parameter
2. Add proper error handling with try-catch blocks
3. Update your ProGuard rules if using Android
4. Test your implementation with the new promise-based API

## [1.3.x] - Previous Versions

### Features
- Basic TikTok Business SDK integration
- iOS and Android support
- Standard event tracking
- Content event tracking
- Custom event tracking
- User identification and logout

### Technical Details
- TikTok Business SDK v1.3.x
- Callback-based API
- Basic error handling
- TypeScript support