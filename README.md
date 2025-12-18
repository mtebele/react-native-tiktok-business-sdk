# react-native-tiktok-business-sdk

[![npm version](https://img.shields.io/npm/v/react-native-tiktok-business-sdk.svg)](https://www.npmjs.com/package/react-native-tiktok-business-sdk)
[![Build Status](https://img.shields.io/github/actions/workflow/status/mtebele/react-native-tiktok-business-sdk/ci.yml)](https://github.com/mtebele/react-native-tiktok-business-sdk/actions)
[![npm downloads](https://img.shields.io/npm/dw/react-native-tiktok-business-sdk.svg)](https://www.npmjs.com/package/react-native-tiktok-business-sdk)
[![License](https://img.shields.io/npm/l/react-native-tiktok-business-sdk.svg)](https://github.com/mtebele/react-native-tiktok-business-sdk/blob/main/LICENSE)

A React Native bridge for the TikTok Business SDK

This library provides a modern, promise-based interface for the TikTok Business SDK, enabling JavaScript apps to initialize the SDK, identify users, and track various events (standard, content, and custom events) with full TypeScript support and comprehensive error handling.

## ✨ Features

- 📱 **Cross-platform** - iOS and Android support
- 🎯 **Promise-based API** - Modern async/await support
- 🔒 **TypeScript** - Full type safety and IntelliSense
- 🧪 **Comprehensive testing** - 100% test coverage with 100+ tests
- 📊 **Event tracking** - Standard, content, custom events, and ad revenue tracking
- 🛡️ **Error handling** - Robust error handling with specific error codes
- 🎨 **Developer friendly** - Simple API with detailed documentation

## Installation

Install the package using npm (or yarn):

```sh
npm install react-native-tiktok-business-sdk

yarn add react-native-tiktok-business-sdk
```

### iOS Setup

1. Run pod install in your `ios` directory:
```sh
cd ios && pod install
```

2. The SDK will automatically link the TikTok Business SDK dependency.

### Android Setup

1. The SDK dependency is automatically included via Gradle.

2. Add ProGuard rules to prevent code obfuscation (see [ProGuard section](#proguard-android) below).

## Usage

Below are examples of how to use the various methods exposed by the library.

### Importing the Library

The package exposes a main object, TikTokBusiness, that aggregates all the methods and enums. For example:

```js
import { TikTokBusiness } from 'react-native-tiktok-business-sdk';
```

### Initialize the SDK

Before using any event tracking methods, you must initialize the SDK. You can call `initializeSdk` with your appId, tiktokAppId, accessToken, and optionally set debug mode.

#### Single TikTok App ID

```js
async function initializeTikTokSDK() {
  try {
    await TikTokBusiness.initializeSdk(
      'YOUR_APP_ID',         // Your app ID (e.g., Android package name or iOS bundle ID)
      'YOUR_TIKTOK_APP_ID',  // Your TikTok App ID from TikTok Events Manager
      'YOUR_ACCESS_TOKEN',   // Your access token from TikTok Events Manager (REQUIRED)
      true                   // Enable debug mode (optional, defaults to false)
    );
    console.log('TikTok SDK initialized successfully!');
    // SDK is now initialized, and tracking is active.
  } catch (error) {
    console.error('Error initializing TikTok SDK:', error);
    // Handle initialization errors (network issues, invalid credentials, etc.)
  }
}

initializeTikTokSDK();
```

#### Multiple TikTok App IDs

Starting from SDK v1.3.1, you can track events with multiple TikTok App IDs by passing an array:

```js
async function initializeTikTokSDKWithMultipleAppIds() {
  try {
    await TikTokBusiness.initializeSdk(
      'YOUR_APP_ID',
      ['TIKTOK_APP_ID_1', 'TIKTOK_APP_ID_2', 'TIKTOK_APP_ID_3'],  // Array of TikTok App IDs
      'YOUR_ACCESS_TOKEN',
      true
    );
    console.log('TikTok SDK initialized with multiple App IDs!');
  } catch (error) {
    console.error('Error initializing TikTok SDK:', error);
  }
}
```

Alternatively, you can still use comma-separated string format:

```js
await TikTokBusiness.initializeSdk(
  'YOUR_APP_ID',
  '11,22,33',  // Comma-separated App IDs (no spaces)
  'YOUR_ACCESS_TOKEN',
  true
);
```

**Important Validation Rules:**
- App IDs must be numeric strings
- No spaces allowed in comma-separated format
- No trailing or leading commas
- Array format is recommended for better readability and type safety
- All TikTok App IDs must match your App ID (SDK requirement)

### Identify a User

Call the `identify` method to report user information. All parameters are required.

```js
async function identifyUser() {
  try {
    await TikTokBusiness.identify(
      'user_12345',           // External user ID (required)
      'john_doe',             // External user name (required)
      '+1234567890',          // Phone number (required)
      'john@example.com'      // Email address (required)
    );
    console.log('User identified successfully!');
  } catch (error) {
    console.error('Error identifying user:', error);
    // Handle identification errors
  }
}
```

### Logout

Log out the user with the `logout` method:

```js
async function logoutUser() {
  try {
    await TikTokBusiness.logout();
    console.log('User logged out successfully!');
  } catch (error) {
    console.error('Error logging out:', error);
    // Handle logout errors
  }
}
```

### Track a Standard Event

Use `trackEvent` to report standard events. You can optionally pass an event ID and additional properties.

```js
import { TikTokBusiness, TikTokEventName } from 'react-native-tiktok-business-sdk';

async function trackStandardEvent() {
  try {
    // Simple event tracking
    await TikTokBusiness.trackEvent(TikTokEventName.REGISTRATION);
    
    // Event with custom ID and properties
    await TikTokBusiness.trackEvent(
      TikTokEventName.SEARCH,
      'search_001',                    // Optional event ID
      {                               // Optional properties
        query: 'coffee',
      }
    );
    
    console.log('Standard event tracked successfully!');
  } catch (error) {
    console.error('Error tracking standard event:', error);
  }
}
```

### Track a Content Event

For events that require content details (e.g., "ADD_TO_CART", "CHECK_OUT", etc.), use `trackContentEvent`. The method accepts an event type string and a parameters object.

```js
import { 
  TikTokBusiness, 
  TikTokContentEventName, 
  TikTokContentEventParameter, 
  TikTokContentEventContentsParameter 
} from 'react-native-tiktok-business-sdk';

async function trackContentEvent() {
  try {
    await TikTokBusiness.trackContentEvent(TikTokContentEventName.PURCHASE, {
      [TikTokContentEventParameter.CURRENCY]: 'USD',
      [TikTokContentEventParameter.VALUE]: '29.99',
      [TikTokContentEventParameter.CONTENT_TYPE]: 'product',
      [TikTokContentEventParameter.DESCRIPTION]: 'Premium coffee purchase',
      [TikTokContentEventParameter.CONTENTS]: [
        {
          [TikTokContentEventContentsParameter.CONTENT_ID]: 'coffee_001',
          [TikTokContentEventContentsParameter.CONTENT_NAME]: 'Premium Coffee',
          [TikTokContentEventContentsParameter.BRAND]: 'Coffee Brand',
          [TikTokContentEventContentsParameter.PRICE]: 29.99,
          [TikTokContentEventContentsParameter.QUANTITY]: 1,
        },
      ],
    });
    
    console.log('Content event tracked successfully!');
  } catch (error) {
    console.error('Error tracking content event:', error);
  }
}
```

### Track a Custom Event

If you need to report an event that isn't standard, use `trackCustomEvent` and pass the event name and a properties object.

```js
async function trackCustomEvent() {
  try {
    await TikTokBusiness.trackCustomEvent('user_achievement', {
      description: 'Level Completed!',
    });
    
    console.log('Custom event tracked successfully!');
  } catch (error) {
    console.error('Error tracking custom event:', error);
  }
}
```

### Track Ad Revenue Events

Track impression-level ad revenue data using the `trackAdRevenueEvent` method. This is useful for monetization tracking with ad networks like AdMob, Unity, IronSource, etc.

```js
import { TikTokBusiness, trackAdRevenueEvent } from 'react-native-tiktok-business-sdk';
import type { AdRevenueData } from 'react-native-tiktok-business-sdk';

async function trackAdRevenue() {
  try {
    const adRevenueData: AdRevenueData = {
      revenue: 0.05,              // Revenue amount
      currency: 'USD',            // Currency code
      adNetwork: 'AdMob',         // Ad network name
      adUnit: 'banner_main',      // Ad unit identifier
      adFormat: 'banner',         // Ad format (banner, interstitial, rewarded)
      placement: 'home_screen',   // Placement in your app
      country: 'US',              // Country code
      precision: 'exact',         // Precision level
    };

    // Track ad revenue with optional event ID
    await trackAdRevenueEvent(adRevenueData, 'ad-revenue-001');
    
    console.log('Ad revenue tracked successfully!');
  } catch (error) {
    console.error('Error tracking ad revenue:', error);
  }
}

// Alternative: Use standard event tracking
async function trackImpressionEvent() {
  try {
    await TikTokBusiness.trackEvent(TikTokEventName.IMPRESSION_LEVEL_AD_REVENUE);
    console.log('Impression event tracked successfully!');
  } catch (error) {
    console.error('Error tracking impression event:', error);
  }
}
```

### Flush Events

Manually flush pending events to TikTok's servers. This is useful when you want to ensure events are sent immediately, such as before the app terminates.

```js
async function flushEvents() {
  try {
    await TikTokBusiness.flush();
    console.log('Events flushed successfully!');
  } catch (error) {
    console.error('Error flushing events:', error);
  }
}
```

> **Note:** Events are normally sent automatically at regular intervals. Only use flush when you need immediate synchronization.

## API Reference

### Available Methods

All methods return promises and support async/await pattern:

```typescript
// Initialize SDK (required before any other calls)
initializeSdk(appId: string, ttAppId: string | string[], accessToken: string, debug?: boolean): Promise<string>

// User management
identify(externalId: string, externalUserName: string, phoneNumber: string, email: string): Promise<string>
logout(): Promise<string>

// Event tracking
trackEvent(eventName: TikTokEventName, eventId?: string, properties?: object): Promise<string>
trackContentEvent(eventName: TikTokContentEventName, properties?: object): Promise<string>
trackCustomEvent(eventName: string, properties?: object): Promise<string>
trackAdRevenueEvent(adRevenueData: AdRevenueData, eventId?: string): Promise<string>

// Other
flush(): Promise<string>
```

### Types

#### AdRevenueData Interface

```typescript
interface AdRevenueData {
  revenue?: number;        // Revenue amount in specified currency
  currency?: string;       // Currency code (e.g., 'USD', 'EUR')
  adNetwork?: string;      // Ad network name (e.g., 'AdMob', 'Unity', 'IronSource')
  adUnit?: string;         // Ad unit identifier
  adFormat?: string;       // Ad format (e.g., 'banner', 'interstitial', 'rewarded')
  placement?: string;      // Placement identifier in your app
  country?: string;        // Country code where ad was shown
  precision?: string;      // Precision level of revenue data
  [key: string]: string | number | boolean | undefined; // Additional custom properties
}
```

### Enums

The library exports the following enums to ensure consistency when reporting events:

- **TikTokEventName** – Standard event names (LOGIN, REGISTRATION, PURCHASE, etc.)
- **TikTokContentEventName** – Content event names (ADD_TO_CART, VIEW_CONTENT, etc.)
- **TikTokContentEventParameter** – Parameters for content events (CURRENCY, VALUE, etc.)
- **TikTokContentEventContentsParameter** – Parameters for content items (CONTENT_ID, PRICE, etc.)

### Complete Import Example

```js
import {
  TikTokBusiness,
  trackAdRevenueEvent,
  TikTokEventName,
  TikTokContentEventName,
  TikTokContentEventParameter,
  TikTokContentEventContentsParameter,
} from 'react-native-tiktok-business-sdk';
import type { AdRevenueData } from 'react-native-tiktok-business-sdk';
```

## Error Handling

The SDK provides comprehensive error handling with specific error codes:

```js
try {
  await TikTokBusiness.initializeSdk(appId, ttAppId, accessToken, debug);
} catch (error) {
  switch (error.code) {
    case 'INIT_ERROR':
      console.error('Failed to initialize SDK:', error.message);
      break;
    case 'IDENTIFY_ERROR':
      console.error('Failed to identify user:', error.message);
      break;
    case 'TRACK_EVENT_ERROR':
      console.error('Failed to track event:', error.message);
      break;
    default:
      console.error('Unknown error:', error.message);
  }
}
```

## Requirements

- React Native 0.60+
- iOS 11.0+
- Android API level 16+

## ProGuard (Android)

If you're using ProGuard for code obfuscation, add these rules to your `proguard-rules.pro`:

```java
-keep class com.tiktok.** { *; }
-keep class com.android.billingclient.api.** { *; }
-keep class androidx.lifecycle.** { *; }
-keep class com.android.installreferrer.** { *; }
```

## Troubleshooting

### Common Issues

1. **"TikTokBusinessModule.initializeSdk got X arguments, expected Y"**
   - Ensure you're passing all required parameters including the new `accessToken`
   - Check that you're using the latest version of the library

2. **"The package doesn't seem to be linked"**
   - Run `npx react-native clean` and rebuild your project
   - For iOS: `cd ios && pod install && cd ..`
   - For Android: `cd android && ./gradlew clean && cd ..`

3. **Events not appearing in TikTok Events Manager**
   - Verify your `accessToken` is correct and has proper permissions
   - Check that your app ID and TikTok App ID are correctly configured
   - Enable debug mode to see detailed logging

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and our development workflow.

## License

MIT

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for detailed release notes and version history.
