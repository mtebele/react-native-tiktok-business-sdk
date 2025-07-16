# react-native-tiktok-business-sdk

[![npm version](https://img.shields.io/npm/v/react-native-tiktok-business-sdk.svg)](https://www.npmjs.com/package/react-native-tiktok-business-sdk)
[![Build Status](https://img.shields.io/github/actions/workflow/status/mtebele/react-native-tiktok-business-sdk/ci.yml)](https://github.com/mtebele/react-native-tiktok-business-sdk/actions)
[![npm downloads](https://img.shields.io/npm/dw/react-native-tiktok-business-sdk.svg)](https://www.npmjs.com/package/react-native-tiktok-business-sdk)
[![License](https://img.shields.io/npm/l/react-native-tiktok-business-sdk.svg)](https://github.com/mtebele/react-native-tiktok-business-sdk/blob/main/LICENSE)

A React Native bridge for the TikTok Business SDK

This library exposes native methods for initializing the TikTok SDK, identifying users, logging out, and tracking various events (standard, content, and custom events) via the TikTok Business SDK.

## Installation

Install the package using npm (or yarn):

```sh
npm install react-native-tiktok-business-sdk

yarn add react-native-tiktok-business-sdk
```

## Usage

Below are examples of how to use the various methods exposed by the library.

### Importing the Library

The package exposes a main object, TikTokBusiness, that aggregates all the methods and enums. For example:

```js
import { TikTokBusiness } from 'react-native-tiktok-business-sdk';
```

### Initialize the SDK

Before using any event tracking methods, you must initialize the SDK. You can call `initializeSdk` with your appId and tiktokAppId, and optionally set debug mode. (The debug parameter defaults to false if not provided).

```js
async function initializeTikTokSDK() {
  try {
    await TikTokBusiness.initializeSdk(
      'YOUR_APP_ID',
      'YOUR_TIKTOK_APP_ID',
      'YOUR_SECRET_TOKEN',
      true
    );
    // SDK is now initialized, and tracking is active.
  } catch (error) {
    console.error('Error initializing TikTok SDK:', error);
  }
}

initializeTikTokSDK();
```

### Identify a User

Call the `identify` method to report user information.

```js
async function identifyUser() {
  try {
    await TikTokBusiness.identify(
      'externalId',
      'externalUserName',
      'phoneNumber',
      'email@example.com'
    );
  } catch (error) {
    console.error('Error identifying user:', error);
  }
}
```

### Logout

Log out the user with the `logout` method:

```js
async function logoutUser() {
  try {
    await TikTokBusiness.logout();
  } catch (error) {
    console.error('Error logging out:', error);
  }
}
```

### Track a Standard Event

Use `trackEvent` to report standard events. You can optionally pass an event ID and additional properties.
For example, to track a "REGISTRATION" event:

```js
async function trackStandardEvent() {
  try {
    await TikTokBusiness.trackEvent(TikTokEventName.REGISTRATION);
  } catch (error) {
    console.error('Error tracking standard event:', error);
  }
}
```

### Track a Content Event

For events that require content details (e.g., “ADD_TO_CART”, “CHECK_OUT”, etc.), use `trackContentEvent`. The method accepts an event type string and a parameters object. The `CONTENTS` property should be an array of objects with keys defined in the `TikTokContentParameter` enum.

```js
TikTokBusiness.trackContentEvent(TikTokContentEventName.CHECK_OUT, {
  [TikTokContentEventParameter.CURRENCY]: 'USD',
  [TikTokContentEventParameter.VALUE]: '4.99',
  [TikTokContentEventParameter.CONTENT_TYPE]: 'Purchase',
  [TikTokContentEventParameter.CONTENTS]: [
    {
      [TikTokContentEventContentsParameter.CONTENT_ID]: 'ABC',
      [TikTokContentEventContentsParameter.CONTENT_NAME]: 'Coffee',
      [TikTokContentEventContentsParameter.PRICE]: '4.99',
      [TikTokContentEventContentsParameter.QUANTITY]: 1,
    },
  ],
});
```

### Track a Custom Event

If you need to report an event that isn’t standard, use `trackCustomEvent` and pass the event name and a properties object.

```js
async function trackCustomEvent() {
  try {
    await TikTokBusiness.trackCustomEvent('custom_event_name', {
      description: 'This is a custom event',
      value: 200,
      currency: 'USD',
    });
  } catch (error) {
    console.error('Error tracking custom event:', error);
  }
}
```

## Enums

The library exports the following enums to ensure consistency when reporting events:

- TikTokEventName – Standard event names.
- TikTokContentEventName – Content event names.
- TikTokContentEventParameter – Parameters for content events.
- TikTokContentEventContentsParameter – Parameters for the contents parameter of content events.

Example:

```js
import {
  TikTokBusiness,
  TikTokContentEventContentsParameter,
  TikTokEventName,
  TikTokContentEventParameter,
  TikTokContentEventName,
} from 'react-native-tiktok-business-sdk';
```

## Proguard

If you're using Proguard to optimize your app, you must add rules to prevent Proguard from removing classes.

```java
-keep class com.tiktok.** { *; }
-keep class com.android.billingclient.api.** { *; }
```

## Upcoming Features

- [ ] Add example app
- [ ] Unit and integration tests
- [ ] Add support for TurboModules
- [ ] Improve TypeScript declarations and documentation
- [ ] Enhance error handling and logging mechanisms
- [ ] Support additional TikTok Business SDK events

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and our development workflow.

## License

MIT
