import { NativeModules } from 'react-native';
import {
  initializeSdk,
  identify,
  trackEvent,
  trackContentEvent,
  trackCustomEvent,
  TikTokEventName,
  TikTokContentEventName,
  TikTokContentEventParameter,
  TikTokContentEventContentsParameter,
} from '../index';

// Get the mocked module
const mockTikTokBusinessModule =
  NativeModules.TikTokBusinessModule as jest.Mocked<
    typeof NativeModules.TikTokBusinessModule
  >;

describe('Edge Cases and Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initializeSdk edge cases', () => {
    it('should reject empty string TikTok App IDs', async () => {
      await expect(initializeSdk('', '', 'test-token')).rejects.toThrow(
        'INVALID_TTAPPID_EMPTY'
      );
    });

    it('should reject special characters in TikTok App IDs', async () => {
      const appId = 'com.example.app-123!@#';
      const ttAppId = 'tt-app-456$%^';
      const accessToken = 'test-token';

      await expect(initializeSdk(appId, ttAppId, accessToken)).rejects.toThrow(
        'INVALID_TTAPPID_FORMAT'
      );
    });

    it('should accept very long numeric TikTok App IDs', async () => {
      const longAppId = 'a'.repeat(1000);
      const longTtAppId = '1'.repeat(1000);
      const accessToken = 'test-token';
      mockTikTokBusinessModule.initializeSdk.mockResolvedValue('success');

      await initializeSdk(longAppId, longTtAppId, accessToken);

      expect(mockTikTokBusinessModule.initializeSdk).toHaveBeenCalledWith(
        longAppId,
        longTtAppId,
        accessToken,
        false
      );
    });
  });

  describe('identify edge cases', () => {
    it('should handle empty string parameters', async () => {
      mockTikTokBusinessModule.identify.mockResolvedValue('success');

      await identify('', '', '', '');

      expect(mockTikTokBusinessModule.identify).toHaveBeenCalledWith(
        '',
        '',
        '',
        ''
      );
    });

    it('should handle very long user data', async () => {
      const longString = 'x'.repeat(1000);
      mockTikTokBusinessModule.identify.mockResolvedValue('success');

      await identify(longString, longString, longString, longString);

      expect(mockTikTokBusinessModule.identify).toHaveBeenCalledWith(
        longString,
        longString,
        longString,
        longString
      );
    });

    it('should handle special characters in user data', async () => {
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      mockTikTokBusinessModule.identify.mockResolvedValue('success');

      await identify(
        specialChars,
        specialChars,
        '+1-555-123-4567',
        'test@example.com'
      );

      expect(mockTikTokBusinessModule.identify).toHaveBeenCalledWith(
        specialChars,
        specialChars,
        '+1-555-123-4567',
        'test@example.com'
      );
    });

    it('should handle international characters', async () => {
      const unicode = 'ñüžčęś测试用户';
      mockTikTokBusinessModule.identify.mockResolvedValue('success');

      await identify(unicode, unicode, '+86-138-0013-8000', 'test@例え.テスト');

      expect(mockTikTokBusinessModule.identify).toHaveBeenCalledWith(
        unicode,
        unicode,
        '+86-138-0013-8000',
        'test@例え.テスト'
      );
    });
  });

  describe('trackEvent edge cases', () => {
    it('should handle empty event properties', async () => {
      mockTikTokBusinessModule.trackEvent.mockResolvedValue('success');

      await trackEvent(TikTokEventName.REGISTRATION, '', {});

      expect(mockTikTokBusinessModule.trackEvent).toHaveBeenCalledWith(
        TikTokEventName.REGISTRATION,
        null,
        {}
      );
    });

    it('should handle properties with undefined values', async () => {
      const properties = {
        currency: undefined,
        value: undefined,
        description: undefined,
      };
      mockTikTokBusinessModule.trackEvent.mockResolvedValue('success');

      await trackEvent(TikTokEventName.SEARCH, undefined, properties);

      expect(mockTikTokBusinessModule.trackEvent).toHaveBeenCalledWith(
        TikTokEventName.SEARCH,
        null,
        properties
      );
    });

    it('should handle mixed data types in properties', async () => {
      const properties = {
        currency: 'test',
        value: 123,
        description: '',
        contents: {
          price: 0,
          quantity: -1,
          content_type: 'testType',
          content_id: 'testId',
          brand: 'testBrand',
          content_name: 'testName',
        },
      };
      mockTikTokBusinessModule.trackEvent.mockResolvedValue('success');

      await trackEvent(TikTokEventName.SEARCH, undefined, properties);

      expect(mockTikTokBusinessModule.trackEvent).toHaveBeenCalledWith(
        TikTokEventName.SEARCH,
        null,
        properties
      );
    });
  });

  describe('trackContentEvent edge cases', () => {
    it('should handle empty contents array', async () => {
      const properties = {
        [TikTokContentEventParameter.CURRENCY]: 'USD',
        [TikTokContentEventParameter.VALUE]: '0',
        [TikTokContentEventParameter.CONTENTS]: [],
      };
      mockTikTokBusinessModule.trackContentEvent.mockResolvedValue('success');

      await trackContentEvent(TikTokContentEventName.ADD_TO_CART, properties);

      expect(mockTikTokBusinessModule.trackContentEvent).toHaveBeenCalledWith(
        TikTokContentEventName.ADD_TO_CART,
        properties
      );
    });

    it('should handle contents with missing properties', async () => {
      const properties = {
        [TikTokContentEventParameter.CONTENTS]: [
          {
            [TikTokContentEventContentsParameter.CONTENT_ID]: 'ABC',
            // Missing other properties
          },
          {
            [TikTokContentEventContentsParameter.CONTENT_NAME]: 'Test Product',
            // Missing other properties
          },
        ],
      };
      mockTikTokBusinessModule.trackContentEvent.mockResolvedValue('success');

      await trackContentEvent(TikTokContentEventName.VIEW_CONTENT, properties);

      expect(mockTikTokBusinessModule.trackContentEvent).toHaveBeenCalledWith(
        TikTokContentEventName.VIEW_CONTENT,
        properties
      );
    });

    it('should handle very large contents array', async () => {
      const largeContentsArray = Array.from({ length: 1000 }, (_, index) => ({
        [TikTokContentEventContentsParameter.CONTENT_ID]: `item-${index}`,
        [TikTokContentEventContentsParameter.CONTENT_NAME]: `Product ${index}`,
        [TikTokContentEventContentsParameter.PRICE]: `${index * 10}`,
        [TikTokContentEventContentsParameter.QUANTITY]: index + 1,
      }));

      const properties = {
        [TikTokContentEventParameter.CONTENTS]: largeContentsArray,
      };
      mockTikTokBusinessModule.trackContentEvent.mockResolvedValue('success');

      await trackContentEvent(TikTokContentEventName.PURCHASE, properties);

      expect(mockTikTokBusinessModule.trackContentEvent).toHaveBeenCalledWith(
        TikTokContentEventName.PURCHASE,
        properties
      );
    });

    it('should handle zero and negative values', async () => {
      const properties = {
        [TikTokContentEventParameter.VALUE]: '0',
        [TikTokContentEventParameter.CONTENTS]: [
          {
            [TikTokContentEventContentsParameter.CONTENT_ID]: 'zero-item',
            [TikTokContentEventContentsParameter.PRICE]: '0',
            [TikTokContentEventContentsParameter.QUANTITY]: 0,
          },
          {
            [TikTokContentEventContentsParameter.CONTENT_ID]: 'negative-item',
            [TikTokContentEventContentsParameter.PRICE]: '-10',
            [TikTokContentEventContentsParameter.QUANTITY]: -1,
          },
        ],
      };
      mockTikTokBusinessModule.trackContentEvent.mockResolvedValue('success');

      await trackContentEvent(TikTokContentEventName.ADD_TO_CART, properties);

      expect(mockTikTokBusinessModule.trackContentEvent).toHaveBeenCalledWith(
        TikTokContentEventName.ADD_TO_CART,
        properties
      );
    });
  });

  describe('trackCustomEvent edge cases', () => {
    it('should handle empty custom event name', async () => {
      mockTikTokBusinessModule.trackCustomEvent.mockResolvedValue('success');

      await trackCustomEvent('');

      expect(mockTikTokBusinessModule.trackCustomEvent).toHaveBeenCalledWith(
        '',
        undefined
      );
    });

    it('should handle very long custom event name', async () => {
      const longEventName = 'custom_event_'.repeat(100);
      mockTikTokBusinessModule.trackCustomEvent.mockResolvedValue('success');

      await trackCustomEvent(longEventName);

      expect(mockTikTokBusinessModule.trackCustomEvent).toHaveBeenCalledWith(
        longEventName,
        undefined
      );
    });

    it('should handle custom event name with special characters', async () => {
      const specialEventName = 'custom!@#$%^&*()_+-=[]{}|;:,.<>?event';
      mockTikTokBusinessModule.trackCustomEvent.mockResolvedValue('success');

      await trackCustomEvent(specialEventName);

      expect(mockTikTokBusinessModule.trackCustomEvent).toHaveBeenCalledWith(
        specialEventName,
        undefined
      );
    });

    it('should handle deeply nested properties', async () => {
      const complexProperties = {
        currency: 'test',
        value: 123,
        description: '',
        contents: {
          price: 0,
          quantity: -1,
          content_type: 'testType',
          content_id: 'testId',
          brand: 'testBrand',
          content_name: 'testName',
        },
      };
      mockTikTokBusinessModule.trackCustomEvent.mockResolvedValue('success');

      await trackCustomEvent('complex_event', complexProperties);

      expect(mockTikTokBusinessModule.trackCustomEvent).toHaveBeenCalledWith(
        'complex_event',
        complexProperties
      );
    });
  });

  describe('Concurrent operations', () => {
    it('should handle multiple simultaneous SDK operations', async () => {
      mockTikTokBusinessModule.initializeSdk.mockResolvedValue('success');
      mockTikTokBusinessModule.identify.mockResolvedValue('success');
      mockTikTokBusinessModule.trackEvent.mockResolvedValue('success');
      mockTikTokBusinessModule.trackContentEvent.mockResolvedValue('success');
      mockTikTokBusinessModule.trackCustomEvent.mockResolvedValue('success');

      const operations = [
        initializeSdk('app1', '1', 'test-token'),
        identify('user1', 'name1', 'phone1', 'email1'),
        trackEvent(TikTokEventName.REGISTRATION),
        trackContentEvent(TikTokContentEventName.ADD_TO_CART),
        trackCustomEvent('custom1'),
      ];

      await Promise.all(operations);

      expect(mockTikTokBusinessModule.initializeSdk).toHaveBeenCalledTimes(1);
      expect(mockTikTokBusinessModule.identify).toHaveBeenCalledTimes(1);
      expect(mockTikTokBusinessModule.trackEvent).toHaveBeenCalledTimes(1);
      expect(mockTikTokBusinessModule.trackContentEvent).toHaveBeenCalledTimes(
        1
      );
      expect(mockTikTokBusinessModule.trackCustomEvent).toHaveBeenCalledTimes(
        1
      );
    });

    it('should handle race conditions gracefully', async () => {
      let callCount = 0;
      mockTikTokBusinessModule.trackEvent.mockImplementation(async () => {
        callCount++;
        await new Promise((resolve) =>
          setTimeout(resolve, Math.random() * 100)
        );
        return `success-${callCount}`;
      });

      const promises = Array.from({ length: 10 }, (_, i) =>
        trackEvent(TikTokEventName.REGISTRATION, `event-${i}`)
      );

      await Promise.all(promises);

      expect(mockTikTokBusinessModule.trackEvent).toHaveBeenCalledTimes(10);
    });
  });

  describe('Memory and performance', () => {
    it('should handle large property objects', async () => {
      const largeProperties: { [key: string]: string } = {};
      for (let i = 0; i < 1000; i++) {
        largeProperties[`property_${i}`] = `value_${i}`;
      }

      mockTikTokBusinessModule.trackCustomEvent.mockResolvedValue('success');

      await trackCustomEvent('large_event', largeProperties);

      expect(mockTikTokBusinessModule.trackCustomEvent).toHaveBeenCalledWith(
        'large_event',
        largeProperties
      );
    });

    it('should handle repeated calls with same parameters', async () => {
      mockTikTokBusinessModule.trackEvent.mockResolvedValue('success');

      const sameParams = [
        TikTokEventName.REGISTRATION,
        'event123',
        { value: 100 },
      ] as Parameters<typeof trackEvent>;

      for (let i = 0; i < 100; i++) {
        await trackEvent(...sameParams);
      }

      expect(mockTikTokBusinessModule.trackEvent).toHaveBeenCalledTimes(100);
    });
  });
});
