import { NativeModules } from 'react-native';
import {
  TikTokBusiness,
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

describe('Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete user flow', () => {
    it('should handle a complete e-commerce user journey', async () => {
      // Setup mocks
      mockTikTokBusinessModule.initializeSdk.mockResolvedValue('initialized');
      mockTikTokBusinessModule.identify.mockResolvedValue('identified');
      mockTikTokBusinessModule.trackEvent.mockResolvedValue('tracked');
      mockTikTokBusinessModule.trackContentEvent.mockResolvedValue('tracked');
      mockTikTokBusinessModule.trackCustomEvent.mockResolvedValue('tracked');
      mockTikTokBusinessModule.logout.mockResolvedValue('logged out');

      // 1. Initialize SDK
      await TikTokBusiness.initializeSdk(
        'com.example.app',
        '123456',
        'test-token',
        true
      );

      // 2. User registration
      await TikTokBusiness.trackEvent(TikTokEventName.REGISTRATION);

      // 3. User login and identification
      await TikTokBusiness.identify(
        'user123',
        'john_doe',
        '+1234567890',
        'john@example.com'
      );

      // 4. User searches for products
      await TikTokBusiness.trackEvent(TikTokEventName.SEARCH, 'search_123', {
        query: 'coffee makers',
      });

      // 5. User views product
      await TikTokBusiness.trackContentEvent(
        TikTokContentEventName.VIEW_CONTENT,
        {
          [TikTokContentEventParameter.CONTENT_TYPE]: 'product',
          [TikTokContentEventParameter.CONTENT_ID]: 'coffee_maker_123',
          [TikTokContentEventParameter.CURRENCY]: 'USD',
          [TikTokContentEventParameter.VALUE]: '99.99',
        }
      );

      // 6. User adds to cart
      await TikTokBusiness.trackContentEvent(
        TikTokContentEventName.ADD_TO_CART,
        {
          [TikTokContentEventParameter.CURRENCY]: 'USD',
          [TikTokContentEventParameter.VALUE]: '99.99',
          [TikTokContentEventParameter.CONTENTS]: [
            {
              [TikTokContentEventContentsParameter.CONTENT_ID]:
                'coffee_maker_123',
              [TikTokContentEventContentsParameter.CONTENT_NAME]:
                'Premium Coffee Maker',
              [TikTokContentEventContentsParameter.PRICE]: '99.99',
              [TikTokContentEventContentsParameter.QUANTITY]: 1,
              [TikTokContentEventContentsParameter.BRAND]: 'KitchenPro',
            },
          ],
        }
      );

      // 7. User adds payment info
      await TikTokBusiness.trackEvent(TikTokEventName.ADD_PAYMENT_INFO);

      // 8. User checks out
      await TikTokBusiness.trackContentEvent(TikTokContentEventName.CHECK_OUT, {
        [TikTokContentEventParameter.CURRENCY]: 'USD',
        [TikTokContentEventParameter.VALUE]: '99.99',
        [TikTokContentEventParameter.CONTENTS]: [
          {
            [TikTokContentEventContentsParameter.CONTENT_ID]:
              'coffee_maker_123',
            [TikTokContentEventContentsParameter.CONTENT_NAME]:
              'Premium Coffee Maker',
            [TikTokContentEventContentsParameter.PRICE]: '99.99',
            [TikTokContentEventContentsParameter.QUANTITY]: 1,
          },
        ],
      });

      // 9. User completes purchase
      await TikTokBusiness.trackContentEvent(TikTokContentEventName.PURCHASE, {
        [TikTokContentEventParameter.CURRENCY]: 'USD',
        [TikTokContentEventParameter.VALUE]: '99.99',
        [TikTokContentEventParameter.ORDER_ID]: 'order_789',
        [TikTokContentEventParameter.CONTENTS]: [
          {
            [TikTokContentEventContentsParameter.CONTENT_ID]:
              'coffee_maker_123',
            [TikTokContentEventContentsParameter.CONTENT_NAME]:
              'Premium Coffee Maker',
            [TikTokContentEventContentsParameter.PRICE]: '99.99',
            [TikTokContentEventContentsParameter.QUANTITY]: 1,
          },
        ],
      });

      // 10. Custom event for order confirmation
      await TikTokBusiness.trackCustomEvent('order_confirmation_viewed', {
        contents: {
          price: 99.99,
          quantity: 1,
          content_type: 'product',
          content_id: 'coffee_maker_123',
          brand: 'KitchenPro',
          content_name: 'Premium Coffee Maker',
        },
        currency: 'USD',
        value: 99.99,
        description: 'Order confirmation for order_789',
        query: 'order_789',
      });

      // 11. User logout
      await TikTokBusiness.logout();

      // Verify all calls were made
      expect(mockTikTokBusinessModule.initializeSdk).toHaveBeenCalledTimes(1);
      expect(mockTikTokBusinessModule.identify).toHaveBeenCalledTimes(1);
      expect(mockTikTokBusinessModule.trackEvent).toHaveBeenCalledTimes(3);
      expect(mockTikTokBusinessModule.trackContentEvent).toHaveBeenCalledTimes(
        4
      );
      expect(mockTikTokBusinessModule.trackCustomEvent).toHaveBeenCalledTimes(
        1
      );
      expect(mockTikTokBusinessModule.logout).toHaveBeenCalledTimes(1);
    });

    it('should handle a gaming app user journey', async () => {
      // Setup mocks
      mockTikTokBusinessModule.initializeSdk.mockResolvedValue('initialized');
      mockTikTokBusinessModule.identify.mockResolvedValue('identified');
      mockTikTokBusinessModule.trackEvent.mockResolvedValue('tracked');
      mockTikTokBusinessModule.trackCustomEvent.mockResolvedValue('tracked');

      // 1. Initialize SDK
      await TikTokBusiness.initializeSdk(
        'com.example.game',
        '654321',
        'test-token',
        false
      );

      // 2. User registration
      await TikTokBusiness.trackEvent(TikTokEventName.REGISTRATION);

      // 3. User completes tutorial
      await TikTokBusiness.trackEvent(TikTokEventName.COMPLETE_TUTORIAL);

      // 4. User achieves first level
      await TikTokBusiness.trackEvent(
        TikTokEventName.ACHIEVE_LEVEL,
        'level_1',
        {
          description: 'Completed Level 1',
        }
      );

      // 5. User creates a group
      await TikTokBusiness.trackEvent(TikTokEventName.CREATE_GROUP);

      // 6. User joins another group
      await TikTokBusiness.trackEvent(TikTokEventName.JOIN_GROUP);

      // 7. User spends in-game credits
      await TikTokBusiness.trackEvent(
        TikTokEventName.SPEND_CREDITS,
        'credits_spent',
        {
          description: 'Spent 100 in-game credits',
          value: 100,
          currency: 'USD',
        }
      );

      // 8. Custom event for game session
      await TikTokBusiness.trackCustomEvent('game_session_completed', {
        description: 'User completed a game session',
        value: 1,
        query: 'session_123',
      });

      // 9. User unlocks achievement
      await TikTokBusiness.trackEvent(
        TikTokEventName.UNLOCK_ACHIEVEMENT,
        'achievement_1',
        {
          description: 'Unlocked First Achievement',
        }
      );

      // 10. User starts trial subscription
      await TikTokBusiness.trackEvent(TikTokEventName.START_TRIAL);

      // Verify all calls were made
      expect(mockTikTokBusinessModule.initializeSdk).toHaveBeenCalledTimes(1);
      expect(mockTikTokBusinessModule.trackEvent).toHaveBeenCalledTimes(8);
      expect(mockTikTokBusinessModule.trackCustomEvent).toHaveBeenCalledTimes(
        1
      );
    });
  });

  describe('Error recovery scenarios', () => {
    it('should handle partial failures in user flow', async () => {
      // Setup mocks with some failures
      mockTikTokBusinessModule.initializeSdk.mockResolvedValue('initialized');
      mockTikTokBusinessModule.identify.mockRejectedValue(
        new Error('Network error')
      );
      mockTikTokBusinessModule.trackEvent.mockResolvedValue('tracked');
      mockTikTokBusinessModule.trackContentEvent.mockResolvedValue('tracked');

      // 1. Initialize SDK (succeeds)
      await TikTokBusiness.initializeSdk(
        'com.example.app',
        '123456',
        'test-token'
      );

      // 2. Try to identify user (fails)
      await expect(
        TikTokBusiness.identify(
          'user123',
          'john_doe',
          '+1234567890',
          'john@example.com'
        )
      ).rejects.toThrow('Network error');

      // 3. Continue with tracking (should still work)
      await TikTokBusiness.trackEvent(TikTokEventName.REGISTRATION);

      // 4. Track content event (should still work)
      await TikTokBusiness.trackContentEvent(
        TikTokContentEventName.VIEW_CONTENT,
        {
          [TikTokContentEventParameter.CONTENT_TYPE]: 'product',
        }
      );

      // Verify calls were made as expected
      expect(mockTikTokBusinessModule.initializeSdk).toHaveBeenCalledTimes(1);
      expect(mockTikTokBusinessModule.identify).toHaveBeenCalledTimes(1);
      expect(mockTikTokBusinessModule.trackEvent).toHaveBeenCalledTimes(1);
      expect(mockTikTokBusinessModule.trackContentEvent).toHaveBeenCalledTimes(
        1
      );
    });

    it('should handle initialization failure gracefully', async () => {
      // Setup mock with initialization failure
      mockTikTokBusinessModule.initializeSdk.mockRejectedValue(
        new Error('SDK initialization failed')
      );
      mockTikTokBusinessModule.trackEvent.mockResolvedValue('tracked');

      // 1. Try to initialize SDK (fails)
      await expect(
        TikTokBusiness.initializeSdk('com.example.app', '123456', 'test-token')
      ).rejects.toThrow('SDK initialization failed');

      // 2. Try to track event anyway (should still work at JS level)
      await TikTokBusiness.trackEvent(TikTokEventName.REGISTRATION);

      // Verify calls were made as expected
      expect(mockTikTokBusinessModule.initializeSdk).toHaveBeenCalledTimes(1);
      expect(mockTikTokBusinessModule.trackEvent).toHaveBeenCalledTimes(1);
    });
  });

  describe('High-volume scenarios', () => {
    it('should handle rapid consecutive events', async () => {
      mockTikTokBusinessModule.trackEvent.mockResolvedValue('tracked');

      // Send 50 events rapidly
      const promises = [];
      for (let i = 0; i < 50; i++) {
        promises.push(
          TikTokBusiness.trackEvent(TikTokEventName.REGISTRATION, `event_${i}`)
        );
      }

      await Promise.all(promises);

      expect(mockTikTokBusinessModule.trackEvent).toHaveBeenCalledTimes(50);
    });

    it('should handle mixed event types rapidly', async () => {
      mockTikTokBusinessModule.trackEvent.mockResolvedValue('tracked');
      mockTikTokBusinessModule.trackContentEvent.mockResolvedValue('tracked');
      mockTikTokBusinessModule.trackCustomEvent.mockResolvedValue('tracked');

      const promises = [];
      for (let i = 0; i < 30; i++) {
        // Mix different event types
        if (i % 3 === 0) {
          promises.push(
            TikTokBusiness.trackEvent(TikTokEventName.REGISTRATION)
          );
        } else if (i % 3 === 1) {
          promises.push(
            TikTokBusiness.trackContentEvent(
              TikTokContentEventName.VIEW_CONTENT
            )
          );
        } else {
          promises.push(TikTokBusiness.trackCustomEvent(`custom_event_${i}`));
        }
      }

      await Promise.all(promises);

      expect(mockTikTokBusinessModule.trackEvent).toHaveBeenCalledTimes(10);
      expect(mockTikTokBusinessModule.trackContentEvent).toHaveBeenCalledTimes(
        10
      );
      expect(mockTikTokBusinessModule.trackCustomEvent).toHaveBeenCalledTimes(
        10
      );
    });
  });

  describe('Data consistency', () => {
    it('should maintain parameter consistency across calls', async () => {
      mockTikTokBusinessModule.trackContentEvent.mockResolvedValue('tracked');

      const consistentProperties = {
        [TikTokContentEventParameter.CURRENCY]: 'USD',
        [TikTokContentEventParameter.VALUE]: '100.00',
        [TikTokContentEventParameter.CONTENTS]: [
          {
            [TikTokContentEventContentsParameter.CONTENT_ID]: 'item_123',
            [TikTokContentEventContentsParameter.PRICE]: '100.00',
            [TikTokContentEventContentsParameter.QUANTITY]: 1,
          },
        ],
      };

      // Make multiple calls with same data
      await TikTokBusiness.trackContentEvent(
        TikTokContentEventName.VIEW_CONTENT,
        consistentProperties
      );
      await TikTokBusiness.trackContentEvent(
        TikTokContentEventName.ADD_TO_CART,
        consistentProperties
      );
      await TikTokBusiness.trackContentEvent(
        TikTokContentEventName.PURCHASE,
        consistentProperties
      );

      // Verify all calls received the same data structure
      expect(mockTikTokBusinessModule.trackContentEvent).toHaveBeenCalledTimes(
        3
      );
      expect(
        mockTikTokBusinessModule.trackContentEvent
      ).toHaveBeenNthCalledWith(
        1,
        TikTokContentEventName.VIEW_CONTENT,
        consistentProperties
      );
      expect(
        mockTikTokBusinessModule.trackContentEvent
      ).toHaveBeenNthCalledWith(
        2,
        TikTokContentEventName.ADD_TO_CART,
        consistentProperties
      );
      expect(
        mockTikTokBusinessModule.trackContentEvent
      ).toHaveBeenNthCalledWith(
        3,
        TikTokContentEventName.PURCHASE,
        consistentProperties
      );
    });

    it('should handle parameter mutations correctly', async () => {
      mockTikTokBusinessModule.trackCustomEvent.mockResolvedValue('tracked');

      const mutableProperties = {
        contents: {
          price: 50,
          quantity: 2,
          content_type: 'product',
          content_id: 'item_456',
          brand: 'BrandX',
          content_name: 'Product X',
        },
        currency: 'USD',
        value: 100,
        description: 'Initial event',
        query: 'initial_query',
      };

      // Track event with original properties
      await TikTokBusiness.trackCustomEvent(
        'original_event',
        mutableProperties
      );

      // Mutate the properties
      mutableProperties.contents.brand = 'BrandY';
      mutableProperties.value = 200;
      mutableProperties.description = 'Mutated event';

      // Track event with mutated properties
      await TikTokBusiness.trackCustomEvent('mutated_event', mutableProperties);

      // Verify both calls were made with their respective data
      expect(mockTikTokBusinessModule.trackCustomEvent).toHaveBeenCalledTimes(
        2
      );
      expect(mockTikTokBusinessModule.trackCustomEvent).toHaveBeenNthCalledWith(
        1,
        'original_event',
        expect.objectContaining({
          contents: {
            price: 50,
            quantity: 2,
            content_type: 'product',
            content_id: 'item_456',
            brand: 'BrandY',
            content_name: 'Product X',
          },
          currency: 'USD',
          value: 200,
          description: 'Mutated event',
          query: 'initial_query',
        })
      );
      expect(mockTikTokBusinessModule.trackCustomEvent).toHaveBeenNthCalledWith(
        2,
        'mutated_event',
        expect.objectContaining({
          contents: {
            price: 50,
            quantity: 2,
            content_type: 'product',
            content_id: 'item_456',
            brand: 'BrandY',
            content_name: 'Product X',
          },
          currency: 'USD',
          value: 200,
          description: 'Mutated event',
          query: 'initial_query',
        })
      );
    });
  });

  describe('Multiple TikTok App IDs', () => {
    it('should initialize SDK with array of App IDs and track events', async () => {
      // Setup mocks
      mockTikTokBusinessModule.initializeSdk.mockResolvedValue('initialized');
      mockTikTokBusinessModule.trackEvent.mockResolvedValue('tracked');
      mockTikTokBusinessModule.trackContentEvent.mockResolvedValue('tracked');

      // 1. Initialize SDK with array of App IDs
      await TikTokBusiness.initializeSdk(
        'com.example.multiapp',
        ['11', '22', '33'],
        'test-token',
        true
      );

      // Verify native module received comma-separated string
      expect(mockTikTokBusinessModule.initializeSdk).toHaveBeenCalledWith(
        'com.example.multiapp',
        '11,22,33',
        'test-token',
        true
      );

      // 2. Track events after initialization
      await TikTokBusiness.trackEvent(TikTokEventName.REGISTRATION);
      await TikTokBusiness.trackContentEvent(
        TikTokContentEventName.ADD_TO_CART,
        {
          [TikTokContentEventParameter.CURRENCY]: 'USD',
          [TikTokContentEventParameter.VALUE]: '49.99',
        }
      );

      // Verify events were tracked
      expect(mockTikTokBusinessModule.trackEvent).toHaveBeenCalledWith(
        TikTokEventName.REGISTRATION,
        null,
        null
      );
      expect(mockTikTokBusinessModule.trackContentEvent).toHaveBeenCalledWith(
        TikTokContentEventName.ADD_TO_CART,
        {
          [TikTokContentEventParameter.CURRENCY]: 'USD',
          [TikTokContentEventParameter.VALUE]: '49.99',
        }
      );
    });

    it('should work with single App ID in array format', async () => {
      mockTikTokBusinessModule.initializeSdk.mockResolvedValue('initialized');

      await TikTokBusiness.initializeSdk(
        'com.example.singleapp',
        ['123456'],
        'test-token',
        false
      );

      // Verify native module received single App ID without comma
      expect(mockTikTokBusinessModule.initializeSdk).toHaveBeenCalledWith(
        'com.example.singleapp',
        '123456',
        'test-token',
        false
      );
    });

    it('should work with comma-separated string (backward compatibility)', async () => {
      mockTikTokBusinessModule.initializeSdk.mockResolvedValue('initialized');

      await TikTokBusiness.initializeSdk(
        'com.example.legacyapp',
        '11,22,33',
        'test-token',
        true
      );

      // Verify native module received the string as-is
      expect(mockTikTokBusinessModule.initializeSdk).toHaveBeenCalledWith(
        'com.example.legacyapp',
        '11,22,33',
        'test-token',
        true
      );
    });
  });
});
