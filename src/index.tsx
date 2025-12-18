import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-tiktok-business' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const TikTokBusinessModule = NativeModules.TikTokBusinessModule
  ? NativeModules.TikTokBusinessModule
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

/**
 * TikTok event names as defined by the TikTok Business SDK.
 */
export enum TikTokEventName {
  ACHIEVE_LEVEL = 'AchieveLevel',
  ADD_PAYMENT_INFO = 'AddPaymentInfo',
  COMPLETE_TUTORIAL = 'CompleteTutorial',
  CREATE_GROUP = 'CreateGroup',
  CREATE_ROLE = 'CreateRole',
  GENERATE_LEAD = 'GenerateLead',
  IMPRESSION_LEVEL_AD_REVENUE = 'ImpressionLevelAdRevenue',
  IN_APP_AD_CLICK = 'InAppADClick',
  IN_APP_AD_IMPR = 'InAppADImpr',
  INSTALL_APP = 'InstallApp',
  JOIN_GROUP = 'JoinGroup',
  LAUNCH_APP = 'LaunchAPP',
  /** @deprecated */
  LOAN_APPLICATION = 'LoanApplication',
  /** @deprecated */
  LOAN_APPROVAL = 'LoanApproval',
  /** @deprecated */
  LOAN_DISBURSAL = 'LoanDisbursal',
  LOGIN = 'Login',
  RATE = 'Rate',
  REGISTRATION = 'Registration',
  SEARCH = 'Search',
  SPEND_CREDITS = 'SpendCredits',
  START_TRIAL = 'StartTrial',
  SUBSCRIBE = 'Subscribe',
  UNLOCK_ACHIEVEMENT = 'UnlockAchievement',
}

// Events that allow additional parameters:
export enum TikTokContentEventName {
  ADD_TO_CART = 'ADD_TO_CART',
  ADD_TO_WISHLIST = 'ADD_TO_WISHLIST',
  CHECK_OUT = 'CHECK_OUT',
  PURCHASE = 'PURCHASE',
  VIEW_CONTENT = 'VIEW_CONTENT',
}

/**
 * Standard event parameters.
 */
export enum TikTokContentEventParameter {
  CONTENT_TYPE = 'CONTENT_TYPE',
  CONTENT_ID = 'CONTENT_ID',
  DESCRIPTION = 'DESCRIPTION',
  CURRENCY = 'CURRENCY',
  VALUE = 'VALUE',
  CONTENTS = 'CONTENTS',
  ORDER_ID = 'ORDER_ID',
}

/**
 * Content parameters for events with detailed content information.
 */
export enum TikTokContentEventContentsParameter {
  CONTENT_ID = 'CONTENT_ID', // Unique product or content ID.
  CONTENT_CATEGORY = 'CONTENT_CATEGORY', // Product or page category.
  BRAND = 'BRAND', // Brand name.
  PRICE = 'PRICE', // Price of the item.
  QUANTITY = 'QUANTITY', // Number of items.
  CONTENT_NAME = 'CONTENT_NAME', // Name of the product or page.
}

type EventProps = {
  contents?: {
    price: number;
    quantity: number;
    content_type: string;
    content_id: string;
    brand: string;
    content_name: string;
  };
  currency: string;
  value: number;
  description: string;
  query: string;
};

/**
 * Validates and normalizes TikTok App ID(s) to comma-separated string format.
 * @param ttAppId - Single TikTok App ID or array of App IDs
 * @returns Normalized comma-separated string
 * @throws Error with specific code and message for validation failures
 */
function validateAndNormalizeTikTokAppId(ttAppId: string | string[]): string {
  // Validate empty ttAppId
  if (!ttAppId) {
    throw new Error('INVALID_TTAPPID_EMPTY: TikTok App ID cannot be empty');
  }

  // Handle array format
  if (Array.isArray(ttAppId)) {
    if (ttAppId.length === 0) {
      throw new Error('INVALID_TTAPPID_EMPTY: TikTok App ID cannot be empty');
    }
    // Validate each element
    for (let i = 0; i < ttAppId.length; i++) {
      const appId = ttAppId[i];
      if (!appId) {
        throw new Error('INVALID_TTAPPID_EMPTY: TikTok App ID cannot be empty');
      }
      if (!/^\d+$/.test(appId)) {
        throw new Error(
          `INVALID_TTAPPID_FORMAT: TikTok App ID must contain only numbers and commas (e.g., '123,456,789')`
        );
      }
    }

    // Join with commas
    return ttAppId.join(',');
  }

  // Check for spaces
  if (/\s/.test(ttAppId)) {
    throw new Error(
      'INVALID_TTAPPID_SPACES: TikTok App ID must contain only numbers and commas. Spaces are not allowed.'
    );
  }

  // Check for full-width commas
  if (ttAppId.includes('\uff0c')) {
    throw new Error(
      'INVALID_TTAPPID_FULLWIDTH_COMMA: TikTok App ID contains full-width comma. Please use standard comma (,)'
    );
  }

  // Check for trailing or leading commas
  if (ttAppId.startsWith(',') || ttAppId.endsWith(',')) {
    throw new Error(
      'INVALID_TTAPPID_TRAILING_COMMA: TikTok App ID cannot have trailing or leading commas'
    );
  }

  // Check for consecutive commas
  if (/,,/.test(ttAppId)) {
    throw new Error(
      'INVALID_TTAPPID_CONSECUTIVE_COMMAS: TikTok App ID cannot have consecutive commas'
    );
  }

  // Check format: only digits and commas
  if (!/^[\d,]+$/.test(ttAppId)) {
    throw new Error(
      `INVALID_TTAPPID_FORMAT: TikTok App ID must contain only numbers and commas (e.g., '123,456,789')`
    );
  }

  return ttAppId;
}

/**
 * Initializes the TikTok SDK.
 * @param appId - Your app ID: Android package name or iOS listing ID, eg: com.sample.app (from Play Store) or 9876543 (from App Store)
 * @param ttAppId - Your TikTok App ID (string) or App IDs (array). Array format: ['11', '22', '33']. Comma-separated string format: '11,22,33'
 * @param accessToken - Your access token from TikTok Events Manager
 * @param debug - Whether to enable debug mode
 * @returns A promise that resolves when the SDK is initialized.
 */
export const initializeSdk = async (
  appId: string,
  ttAppId: string | string[],
  accessToken: string,
  debug?: Boolean
): Promise<string> => {
  const normalizedTtAppId = validateAndNormalizeTikTokAppId(ttAppId);
  return await TikTokBusinessModule.initializeSdk(
    appId,
    normalizedTtAppId,
    accessToken,
    debug || false
  );
};

/**
 * Identifies the user with their information for tracking purposes.
 * All parameters are required by the TikTok Business SDK.
 *
 * @param externalId - Unique external user ID from your system
 * @param externalUserName - User's username or display name
 * @param phoneNumber - User's phone number (e.g., '+1234567890')
 * @param email - User's email address
 * @returns A promise that resolves when the user is identified successfully
 *
 * @example
 * ```typescript
 * await TikTokBusiness.identify(
 *   'user_12345',
 *   'john_doe',
 *   '+1234567890',
 *   'john@example.com'
 * );
 * ```
 */
export const identify = async (
  externalId: string,
  externalUserName: string,
  phoneNumber: string,
  email: string
): Promise<string> =>
  await TikTokBusinessModule.identify(
    externalId,
    externalUserName,
    phoneNumber,
    email
  );

/**
 * Logs out the current user and clears their identification information.
 * Call this method when a user signs out of your application.
 *
 * @returns A promise that resolves when the user is logged out successfully
 *
 * @example
 * ```typescript
 * await TikTokBusiness.logout();
 * ```
 */
export const logout = async (): Promise<string> =>
  await TikTokBusinessModule.logout();

/**
 * Manually flushes pending events to TikTok's servers.
 *
 * Normally, events are batched and sent automatically based on time intervals
 * or event count thresholds. This method forces immediate synchronization of
 * all pending events, which is useful before app termination or at critical moments.
 *
 * @returns A promise that resolves when events are flushed successfully
 *
 * @example
 * ```typescript
 * await TikTokBusiness.flush();
 * ```
 */
export const flush = async (): Promise<string> =>
  await TikTokBusinessModule.flush();

/**
 * Reports a standard event.
 * Accepts an optional eventId and additional properties.
 */
export const trackEvent = async (
  eventName: TikTokEventName,
  eventId?: string,
  properties?: Partial<EventProps>
): Promise<string> =>
  await TikTokBusinessModule.trackEvent(
    eventName,
    eventId || null,
    properties || null
  );

/**
 * Reports a content event.
 * Accepts the event type (e.g., "ADD_TO_CART", "CHECK_OUT") and additional properties.
 */
export const trackContentEvent = async (
  eventName: TikTokContentEventName,
  properties?: Partial<
    Record<
      TikTokContentEventParameter,
      | string
      | number
      | boolean
      | Array<
          Partial<
            Record<
              TikTokContentEventContentsParameter,
              string | number | boolean
            >
          >
        >
    >
  >
): Promise<string> =>
  await TikTokBusinessModule.trackContentEvent(eventName, properties);

/**
 * Reports a custom event.
 * Builds the event using TTBaseEvent and adds provided properties.
 */
export const trackCustomEvent = async (
  eventName: string,
  properties?: Partial<EventProps>
): Promise<string> =>
  await TikTokBusinessModule.trackCustomEvent(eventName, properties);

/**
 * Ad revenue data structure for impression-level ad revenue tracking
 */
export interface AdRevenueData {
  /** Revenue amount in the specified currency */
  revenue?: number;
  /** Currency code (e.g., 'USD', 'EUR') */
  currency?: string;
  /** Ad network name (e.g., 'AdMob', 'Unity', 'IronSource') */
  adNetwork?: string;
  /** Ad unit identifier */
  adUnit?: string;
  /** Ad format (e.g., 'banner', 'interstitial', 'rewarded') */
  adFormat?: string;
  /** Placement identifier */
  placement?: string;
  /** Country code where ad was shown */
  country?: string;
  /** Precision level of the revenue data */
  precision?: string;
  /** Additional custom properties */
  [key: string]: string | number | boolean | undefined;
}

/**
 * Reports an ad revenue event for impression-level ad revenue tracking.
 * @param adRevenueData - Ad revenue data containing revenue, currency, network info, etc.
 * @param eventId - Optional event ID for tracking
 */
export const trackAdRevenueEvent = async (
  adRevenueData: AdRevenueData,
  eventId?: string
): Promise<string> =>
  await TikTokBusinessModule.trackAdRevenueEvent(
    adRevenueData,
    eventId || null
  );

export const TikTokBusiness = {
  initializeSdk,
  identify,
  logout,
  flush,
  trackEvent,
  trackContentEvent,
  trackCustomEvent,
  trackAdRevenueEvent,
};

export default TikTokBusiness;
