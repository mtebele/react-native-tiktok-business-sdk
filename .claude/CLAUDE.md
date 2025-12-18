# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native bridge for the TikTok Business SDK v1.6.0, enabling JavaScript apps to initialize the TikTok SDK, identify users, track various events (standard, content, and custom events), and manually flush pending events. The library supports both iOS and Android platforms with promise-based async APIs.

## Development Commands

### Basic Commands
- **Build**: `yarn prepare` (uses react-native-builder-bob)
- **Test**: `yarn test` (Jest with 93.75% coverage)
- **Lint**: `yarn lint` (ESLint on JS/TS/TSX files)
- **Type Check**: `yarn typecheck` (TypeScript compiler)
- **Clean**: `yarn clean` (removes build artifacts)
- **Release**: `yarn release` (uses release-it)

### Testing Commands
- **All tests**: `yarn test`
- **With coverage**: `yarn test --coverage`
- **Watch mode**: `yarn test --watch`
- **Specific test file**: `yarn test src/__tests__/index.test.tsx`
- **Exclude error handling tests**: `yarn test --testPathIgnorePatterns="error-handling.test.tsx"`
- **Run quality checks**: `yarn test && yarn lint && yarn typecheck`

## Project Architecture

### Core Structure
- **src/index.tsx**: Main entry point exposing the TikTokBusiness module and all enums
- **android/**: Kotlin implementation (TikTokBusinessModule.kt, TikTokBusinessPackage.kt)
- **ios/**: Swift implementation (TikTokBusinessModule.swift)
- **example/**: Demo app showing SDK usage

### Key Components

#### JavaScript Bridge (src/index.tsx)
- Exports main `TikTokBusiness` object with methods: `initializeSdk`, `identify`, `logout`, `flush`, `trackEvent`, `trackContentEvent`, `trackCustomEvent`
- All methods return promises for proper async/await handling
- **initializeSdk**: Requires appId, ttAppId (string or array), accessToken (mandatory in v1.4.1), and optional debug flag
  - **ttAppId** supports: single App ID string, array of App IDs (converted to comma-separated string), or comma-separated string
  - Includes validation utility function that enforces strict formatting rules
- **identify**: Takes 4 parameters: externalId, externalUserName, phoneNumber, email (uses `identifyWithExternalID` internally)
- **flush**: No parameters, forces immediate flush of pending events to network
- Defines enums for event names and parameters:
  - `TikTokEventName`: Standard events (REGISTRATION, LOGIN, etc.)
  - `TikTokContentEventName`: Content events (ADD_TO_CART, PURCHASE, etc.)
  - `TikTokContentEventParameter`: Event parameters
  - `TikTokContentEventContentsParameter`: Content item parameters

#### Native Modules
- **Android**: `android/src/main/java/com/tiktokbusiness/TikTokBusinessModule.kt` (TikTok Business SDK v1.6.0)
- **iOS**: `ios/TikTokBusinessModule.swift` (TikTok Business SDK v1.6.0)
- **iOS Bridge**: `ios/TikTokBusinessModule.mm` (Objective-C bridge declarations)
- Both implement promise-based async methods using RCTPromiseResolveBlock/RCTPromiseRejectBlock
- **iOS Implementation Notes**:
  - Uses modern TikTok SDK APIs: `identifyWithExternalID`, `trackTTEvent`, `initializeSdk` with completionHandler, `explicitlyFlush`
  - Avoids deprecated methods like `trackEvent` (use `trackTTEvent` instead)
  - Proper error handling with specific error codes (INIT_ERROR, IDENTIFY_ERROR, FLUSH_ERROR, etc.)
  - Uses `TikTokConfig(accessToken:appId:tiktokAppId:)` constructor pattern
  - **Critical**: `.mm` bridge file must declare `resolver` and `rejecter` parameters for all promise-based methods
- **Android Implementation Notes**:
  - Uses promise-based async methods with proper error handling
  - Implements `TTInitCallback` for initialization success/failure handling
  - Uses `TTConfig.setAccessToken()` for mandatory access token
  - Calls `TikTokBusinessSdk.flush()` for manual event synchronization
  - Proper try-catch blocks around all native SDK calls

### Build System
- Uses `react-native-builder-bob` for building CommonJS, ES Module, and TypeScript definitions
- Outputs to `lib/` directory with separate commonjs, module, and typescript folders
- TypeScript configuration in `tsconfig.json` with strict mode enabled

### Testing Architecture
- **Comprehensive test suite** with 70+ tests achieving 93.75% coverage
- **Test files structure**:
  - `index.test.tsx`: Core functionality unit tests for all SDK methods
  - `edge-cases.test.tsx`: Edge cases, error handling, and performance scenarios
  - `integration.test.tsx`: Complete user flow tests (e-commerce, gaming scenarios)
  - `types.test.ts`: TypeScript type validation and enum testing
  - `error-handling.test.tsx`: Native module linking error scenarios
  - `setup.ts`: Test configuration, mocking utilities, and custom matchers
- **Native module mocking**: Comprehensive mock setup for React Native bridge testing
- **Coverage configuration**: Excludes test files, includes TypeScript sources
- **Custom Jest matchers**: Extended assertions for event tracking validation

### Code Quality
- ESLint with React Native and Prettier configs
- Commitlint for conventional commits
- Lefthook for git hooks
- Release-it for automated releases with conventional changelog

## Key Development Patterns

### Error Handling
- Main module uses Proxy pattern for graceful failure when native module isn't linked
- All native methods are async and return promises
- Error handling tests use `await expect(async () => {...}).rejects.toThrow()` pattern

### Event Tracking Architecture
- **Standard events**: Use `TikTokEventName` enum with optional properties
- **Content events**: Use `TikTokContentEventName` with structured parameters via enums
- **Custom events**: Accept any event name with flexible properties
- **Parameter validation**: TypeScript enums ensure consistent parameter naming

### Testing Best Practices
- Mock native modules in `setup.ts` for consistent test environment
- Use `jest.resetModules()` for testing module linking errors
- Test both success and failure scenarios for all methods
- Include integration tests for complete user flows

## Important Notes

### SDK Version and Compatibility
- Updated to TikTok Business SDK v1.6.0 (iOS and Android)
- **Breaking Change**: `accessToken` is now mandatory in `initializeSdk` (required by v1.4.1+)
- Uses modern, non-deprecated APIs throughout (future-proof implementation)
- **New in v1.6.0**: Manual event flushing via `flush()` method

### Development Requirements
- The library requires native linking (not compatible with Expo Go)
- iOS: Uses CocoaPods with TikTokBusinessSDK v1.6.0 dependency
- Android: Uses Gradle with tiktok-business-android-sdk v1.6.0 dependency
- Android requires ProGuard rules for TikTok classes: `-keep class com.tiktok.** { *; }`

### API Signatures
- All native methods are async and return promises with proper error handling
- `initializeSdk(appId, ttAppId: string | string[], accessToken, debug?)` - ttAppId accepts array or string, accessToken is required
- `identify(externalId, externalUserName, phoneNumber, email)` - all 4 parameters required
- `flush()` - manually flush pending events (no parameters required)
- Error handling tests may show expected errors in console - this is normal behavior

### TikTok App ID Validation
- **Multiple App IDs Support** (SDK v1.3.1+): Pass array `['11', '22', '33']` or comma-separated string `'11,22,33'`
- **Validation rules enforced**:
  - Only numeric characters and commas allowed
  - No spaces (common mistake - error code: `INVALID_TTAPPID_SPACES`)
  - No full-width commas (common in Asian locales - error code: `INVALID_TTAPPID_FULLWIDTH_COMMA`)
  - No trailing or leading commas (error code: `INVALID_TTAPPID_TRAILING_COMMA`)
  - No consecutive commas (error code: `INVALID_TTAPPID_CONSECUTIVE_COMMAS`)
  - Cannot be empty (error code: `INVALID_TTAPPID_EMPTY`)
- **Array format recommended**: Better type safety and automatic conversion to comma-separated string
- **Validation function**: `validateAndNormalizeTikTokAppId()` in src/index.tsx handles all validation before native call

### Bridge Configuration Critical Notes
- **iOS Bridge Synchronization**: The `ios/TikTokBusinessModule.mm` file must exactly match the Swift implementation
- **Promise Parameters**: All methods returning promises must declare `resolver:(RCTPromiseResolveBlock)` and `rejecter:(RCTPromiseRejectBlock)` in the `.mm` file
- **Parameter Count Matching**: React Native will throw "got X arguments, expected Y" errors if `.mm` declarations don't match Swift method signatures
- **Common Fix**: If you add/remove parameters in Swift, update the corresponding `RCT_EXTERN_METHOD` declaration in `.mm`

### Testing and Quality
- Run `yarn test && yarn lint && yarn typecheck` before commits
- 93.75% test coverage with comprehensive integration scenarios
- Native module mocking handles React Native bridge testing complexities