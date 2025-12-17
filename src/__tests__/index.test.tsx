import { NativeModules } from 'react-native';
import {
  TikTokBusiness,
  initializeSdk,
  identify,
  logout,
  trackEvent,
  trackContentEvent,
  trackCustomEvent,
  trackAdRevenueEvent,
  TikTokEventName,
  TikTokContentEventName,
  TikTokContentEventParameter,
  TikTokContentEventContentsParameter,
} from '../index';
import type { AdRevenueData } from '../index';

// Get the mocked module
const mockTikTokBusinessModule =
  NativeModules.TikTokBusinessModule as jest.Mocked<
    typeof NativeModules.TikTokBusinessModule
  >;

describe('TikTokBusiness', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initializeSdk', () => {
    it('should call native module with correct parameters', async () => {
      const appId = 'test-app-id';
      const ttAppId = '123456';
      const accessToken = 'test-token';
      const debug = true;

      mockTikTokBusinessModule.initializeSdk.mockResolvedValue('success');

      await initializeSdk(appId, ttAppId, accessToken, debug);

      expect(mockTikTokBusinessModule.initializeSdk).toHaveBeenCalledWith(
        appId,
        ttAppId,
        accessToken,
        debug
      );
    });

    it('should default debug to false when not provided', async () => {
      const appId = 'test-app-id';
      const ttAppId = '123456';
      const accessToken = 'test-token';

      mockTikTokBusinessModule.initializeSdk.mockResolvedValue('success');

      await initializeSdk(appId, ttAppId, accessToken);

      expect(mockTikTokBusinessModule.initializeSdk).toHaveBeenCalledWith(
        appId,
        ttAppId,
        accessToken,
        false
      );
    });

    it('should handle initialization errors', async () => {
      const appId = 'test-app-id';
      const ttAppId = '123456';
      const accessToken = 'test-token';
      const error = new Error('Initialization failed');

      mockTikTokBusinessModule.initializeSdk.mockRejectedValue(error);

      await expect(initializeSdk(appId, ttAppId, accessToken)).rejects.toThrow(
        'Initialization failed'
      );
    });

    // Multiple TikTok App IDs support - Valid inputs
    describe('Multiple TikTok App IDs - Valid Inputs', () => {
      it('should accept single string App ID (backward compatibility)', async () => {
        mockTikTokBusinessModule.initializeSdk.mockResolvedValue('success');

        await initializeSdk('app-id', '123456', 'token');

        expect(mockTikTokBusinessModule.initializeSdk).toHaveBeenCalledWith(
          'app-id',
          '123456',
          'token',
          false
        );
      });

      it('should accept comma-separated string (backward compatibility)', async () => {
        mockTikTokBusinessModule.initializeSdk.mockResolvedValue('success');

        await initializeSdk('app-id', '11,22,33', 'token');

        expect(mockTikTokBusinessModule.initializeSdk).toHaveBeenCalledWith(
          'app-id',
          '11,22,33',
          'token',
          false
        );
      });

      it('should accept array of App IDs and convert to comma-separated string', async () => {
        mockTikTokBusinessModule.initializeSdk.mockResolvedValue('success');

        await initializeSdk('app-id', ['11', '22', '33'], 'token');

        expect(mockTikTokBusinessModule.initializeSdk).toHaveBeenCalledWith(
          'app-id',
          '11,22,33',
          'token',
          false
        );
      });

      it('should accept array with single element', async () => {
        mockTikTokBusinessModule.initializeSdk.mockResolvedValue('success');

        await initializeSdk('app-id', ['123456'], 'token');

        expect(mockTikTokBusinessModule.initializeSdk).toHaveBeenCalledWith(
          'app-id',
          '123456',
          'token',
          false
        );
      });

      it('should accept array with many elements', async () => {
        mockTikTokBusinessModule.initializeSdk.mockResolvedValue('success');

        await initializeSdk(
          'app-id',
          ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
          'token'
        );

        expect(mockTikTokBusinessModule.initializeSdk).toHaveBeenCalledWith(
          'app-id',
          '1,2,3,4,5,6,7,8,9,10',
          'token',
          false
        );
      });
    });

    // Multiple TikTok App IDs support - Invalid inputs
    describe('Multiple TikTok App IDs - Invalid Inputs', () => {
      it('should reject empty string', async () => {
        await expect(initializeSdk('app-id', '', 'token')).rejects.toThrow(
          'INVALID_TTAPPID_EMPTY'
        );
      });

      it.only('should reject empty array', async () => {
        await expect(initializeSdk('app-id', [], 'token')).rejects.toThrow(
          'INVALID_TTAPPID_EMPTY'
        );
      });

      it('should reject string with spaces', async () => {
        await expect(
          initializeSdk('app-id', '11, 22, 33', 'token')
        ).rejects.toThrow('INVALID_TTAPPID_SPACES');
      });

      it('should reject string with full-width comma', async () => {
        await expect(
          initializeSdk('app-id', '11\uff0c22\uff0c33', 'token')
        ).rejects.toThrow('INVALID_TTAPPID_FULLWIDTH_COMMA');
      });

      it('should reject string with trailing comma', async () => {
        await expect(
          initializeSdk('app-id', '11,22,33,', 'token')
        ).rejects.toThrow('INVALID_TTAPPID_TRAILING_COMMA');
      });

      it('should reject string with leading comma', async () => {
        await expect(
          initializeSdk('app-id', ',11,22,33', 'token')
        ).rejects.toThrow('INVALID_TTAPPID_TRAILING_COMMA');
      });

      it('should reject string with consecutive commas', async () => {
        await expect(
          initializeSdk('app-id', '11,,22,,33', 'token')
        ).rejects.toThrow('INVALID_TTAPPID_CONSECUTIVE_COMMAS');
      });

      it('should reject array with empty string element', async () => {
        await expect(
          initializeSdk('app-id', ['11', '', '33'], 'token')
        ).rejects.toThrow('INVALID_TTAPPID_EMPTY');
      });

      it('should reject array with non-numeric element', async () => {
        await expect(
          initializeSdk('app-id', ['11', 'abc', '33'], 'token')
        ).rejects.toThrow('INVALID_TTAPPID_FORMAT');
      });

      it('should reject string with letters', async () => {
        await expect(
          initializeSdk('app-id', 'abc,def', 'token')
        ).rejects.toThrow('INVALID_TTAPPID_FORMAT');
      });

      it('should reject string with special characters', async () => {
        await expect(
          initializeSdk('app-id', '11@22#33', 'token')
        ).rejects.toThrow('INVALID_TTAPPID_FORMAT');
      });
    });
  });

  describe('identify', () => {
    it('should call native module with user information', async () => {
      const externalId = 'user123';
      const externalUserName = 'testuser';
      const phoneNumber = '+1234567890';
      const email = 'test@example.com';

      mockTikTokBusinessModule.identify.mockResolvedValue('success');

      await identify(externalId, externalUserName, phoneNumber, email);

      expect(mockTikTokBusinessModule.identify).toHaveBeenCalledWith(
        externalId,
        externalUserName,
        phoneNumber,
        email
      );
    });

    it('should handle identify errors', async () => {
      const error = new Error('Identify failed');
      mockTikTokBusinessModule.identify.mockRejectedValue(error);

      await expect(
        identify('user123', 'testuser', '+1234567890', 'test@example.com')
      ).rejects.toThrow('Identify failed');
    });
  });

  describe('logout', () => {
    it('should call native module logout', async () => {
      mockTikTokBusinessModule.logout.mockResolvedValue('success');

      await logout();

      expect(mockTikTokBusinessModule.logout).toHaveBeenCalled();
    });

    it('should handle logout errors', async () => {
      const error = new Error('Logout failed');
      mockTikTokBusinessModule.logout.mockRejectedValue(error);

      await expect(logout()).rejects.toThrow('Logout failed');
    });
  });

  describe('trackEvent', () => {
    it('should track standard event without properties', async () => {
      mockTikTokBusinessModule.trackEvent.mockResolvedValue('success');

      await trackEvent(TikTokEventName.REGISTRATION);

      expect(mockTikTokBusinessModule.trackEvent).toHaveBeenCalledWith(
        TikTokEventName.REGISTRATION,
        null,
        null
      );
    });

    it('should track standard event with event ID', async () => {
      const eventId = 'event123';
      mockTikTokBusinessModule.trackEvent.mockResolvedValue('success');

      await trackEvent(TikTokEventName.LOGIN, eventId);

      expect(mockTikTokBusinessModule.trackEvent).toHaveBeenCalledWith(
        TikTokEventName.LOGIN,
        eventId,
        null
      );
    });

    it('should track standard event with properties', async () => {
      const properties = {
        currency: 'USD',
        value: 100,
        description: 'Test event',
      };
      mockTikTokBusinessModule.trackEvent.mockResolvedValue('success');

      await trackEvent(TikTokEventName.SEARCH, undefined, properties);

      expect(mockTikTokBusinessModule.trackEvent).toHaveBeenCalledWith(
        TikTokEventName.SEARCH,
        null,
        properties
      );
    });

    it('should handle trackEvent errors', async () => {
      const error = new Error('Track event failed');
      mockTikTokBusinessModule.trackEvent.mockRejectedValue(error);

      await expect(trackEvent(TikTokEventName.REGISTRATION)).rejects.toThrow(
        'Track event failed'
      );
    });
  });

  describe('trackContentEvent', () => {
    it('should track content event without properties', async () => {
      mockTikTokBusinessModule.trackContentEvent.mockResolvedValue('success');

      await trackContentEvent(TikTokContentEventName.ADD_TO_CART);

      expect(mockTikTokBusinessModule.trackContentEvent).toHaveBeenCalledWith(
        TikTokContentEventName.ADD_TO_CART,
        undefined
      );
    });

    it('should track content event with complete properties', async () => {
      const properties = {
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
      };

      mockTikTokBusinessModule.trackContentEvent.mockResolvedValue('success');

      await trackContentEvent(TikTokContentEventName.CHECK_OUT, properties);

      expect(mockTikTokBusinessModule.trackContentEvent).toHaveBeenCalledWith(
        TikTokContentEventName.CHECK_OUT,
        properties
      );
    });

    it('should handle trackContentEvent errors', async () => {
      const error = new Error('Track content event failed');
      mockTikTokBusinessModule.trackContentEvent.mockRejectedValue(error);

      await expect(
        trackContentEvent(TikTokContentEventName.ADD_TO_CART)
      ).rejects.toThrow('Track content event failed');
    });
  });

  describe('trackCustomEvent', () => {
    it('should track custom event without properties', async () => {
      const eventName = 'custom_event';
      mockTikTokBusinessModule.trackCustomEvent.mockResolvedValue('success');

      await trackCustomEvent(eventName);

      expect(mockTikTokBusinessModule.trackCustomEvent).toHaveBeenCalledWith(
        eventName,
        undefined
      );
    });

    it('should track custom event with properties', async () => {
      const eventName = 'custom_event';
      const properties = {
        description: 'This is a custom event',
        value: 200,
        currency: 'USD',
      };
      mockTikTokBusinessModule.trackCustomEvent.mockResolvedValue('success');

      await trackCustomEvent(eventName, properties);

      expect(mockTikTokBusinessModule.trackCustomEvent).toHaveBeenCalledWith(
        eventName,
        properties
      );
    });

    it('should handle trackCustomEvent errors', async () => {
      const error = new Error('Track custom event failed');
      mockTikTokBusinessModule.trackCustomEvent.mockRejectedValue(error);

      await expect(trackCustomEvent('custom_event')).rejects.toThrow(
        'Track custom event failed'
      );
    });
  });

  describe('TikTokBusiness object', () => {
    it('should export all methods in TikTokBusiness object', () => {
      expect(TikTokBusiness).toHaveProperty('initializeSdk');
      expect(TikTokBusiness).toHaveProperty('identify');
      expect(TikTokBusiness).toHaveProperty('logout');
      expect(TikTokBusiness).toHaveProperty('trackEvent');
      expect(TikTokBusiness).toHaveProperty('trackContentEvent');
      expect(TikTokBusiness).toHaveProperty('trackCustomEvent');
    });

    it('should have methods that match standalone functions', () => {
      expect(TikTokBusiness.initializeSdk).toBe(initializeSdk);
      expect(TikTokBusiness.identify).toBe(identify);
      expect(TikTokBusiness.logout).toBe(logout);
      expect(TikTokBusiness.trackEvent).toBe(trackEvent);
      expect(TikTokBusiness.trackContentEvent).toBe(trackContentEvent);
      expect(TikTokBusiness.trackCustomEvent).toBe(trackCustomEvent);
    });
  });

  describe('Enums', () => {
    it('should export TikTokEventName enum with correct values', () => {
      expect(TikTokEventName.REGISTRATION).toBe('Registration');
      expect(TikTokEventName.LOGIN).toBe('Login');
      expect(TikTokEventName.SEARCH).toBe('Search');
      expect(TikTokEventName.ADD_PAYMENT_INFO).toBe('AddPaymentInfo');
    });

    it('should export TikTokContentEventName enum with correct values', () => {
      expect(TikTokContentEventName.ADD_TO_CART).toBe('ADD_TO_CART');
      expect(TikTokContentEventName.CHECK_OUT).toBe('CHECK_OUT');
      expect(TikTokContentEventName.PURCHASE).toBe('PURCHASE');
      expect(TikTokContentEventName.VIEW_CONTENT).toBe('VIEW_CONTENT');
    });

    it('should export TikTokContentEventParameter enum with correct values', () => {
      expect(TikTokContentEventParameter.CURRENCY).toBe('CURRENCY');
      expect(TikTokContentEventParameter.VALUE).toBe('VALUE');
      expect(TikTokContentEventParameter.CONTENT_TYPE).toBe('CONTENT_TYPE');
      expect(TikTokContentEventParameter.CONTENTS).toBe('CONTENTS');
    });

    it('should export TikTokContentEventContentsParameter enum with correct values', () => {
      expect(TikTokContentEventContentsParameter.CONTENT_ID).toBe('CONTENT_ID');
      expect(TikTokContentEventContentsParameter.CONTENT_NAME).toBe(
        'CONTENT_NAME'
      );
      expect(TikTokContentEventContentsParameter.PRICE).toBe('PRICE');
      expect(TikTokContentEventContentsParameter.QUANTITY).toBe('QUANTITY');
    });

    it('should include IMPRESSION_LEVEL_AD_REVENUE in TikTokEventName enum', () => {
      expect(TikTokEventName.IMPRESSION_LEVEL_AD_REVENUE).toBe(
        'ImpressionLevelAdRevenue'
      );
    });
  });

  describe('trackAdRevenueEvent', () => {
    it('should call native module with ad revenue data and no event ID', async () => {
      const adRevenueData: AdRevenueData = {
        revenue: 0.05,
        currency: 'USD',
        adNetwork: 'AdMob',
        adUnit: 'banner_main',
        adFormat: 'banner',
        placement: 'home_screen',
        country: 'US',
        precision: 'exact',
      };

      mockTikTokBusinessModule.trackAdRevenueEvent.mockResolvedValue('success');

      await trackAdRevenueEvent(adRevenueData);

      expect(mockTikTokBusinessModule.trackAdRevenueEvent).toHaveBeenCalledWith(
        adRevenueData,
        null
      );
    });

    it('should call native module with ad revenue data and event ID', async () => {
      const adRevenueData: AdRevenueData = {
        revenue: 0.12,
        currency: 'USD',
        adNetwork: 'Unity',
        adUnit: 'rewarded_video',
        adFormat: 'rewarded',
      };
      const eventId = 'test-event-id';

      mockTikTokBusinessModule.trackAdRevenueEvent.mockResolvedValue('success');

      await trackAdRevenueEvent(adRevenueData, eventId);

      expect(mockTikTokBusinessModule.trackAdRevenueEvent).toHaveBeenCalledWith(
        adRevenueData,
        eventId
      );
    });

    it('should work with minimal ad revenue data', async () => {
      const adRevenueData: AdRevenueData = {
        revenue: 0.01,
        currency: 'USD',
      };

      mockTikTokBusinessModule.trackAdRevenueEvent.mockResolvedValue('success');

      await trackAdRevenueEvent(adRevenueData);

      expect(mockTikTokBusinessModule.trackAdRevenueEvent).toHaveBeenCalledWith(
        adRevenueData,
        null
      );
    });

    it('should support custom properties in ad revenue data', async () => {
      const adRevenueData: AdRevenueData = {
        revenue: 0.25,
        currency: 'EUR',
        adNetwork: 'IronSource',
        customParam: 'test_value',
        instanceId: 12345,
      };

      mockTikTokBusinessModule.trackAdRevenueEvent.mockResolvedValue('success');

      await trackAdRevenueEvent(adRevenueData);

      expect(mockTikTokBusinessModule.trackAdRevenueEvent).toHaveBeenCalledWith(
        adRevenueData,
        null
      );
    });
  });
});
