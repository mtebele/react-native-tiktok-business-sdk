import { NativeModules } from 'react-native';
import {
  TikTokBusiness,
  initializeSdk,
  identify,
  logout,
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

describe('TypeScript Type Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default resolved values for the types tests
    mockTikTokBusinessModule.initializeSdk.mockResolvedValue('success');
    mockTikTokBusinessModule.identify.mockResolvedValue('success');
    mockTikTokBusinessModule.logout.mockResolvedValue('success');
    mockTikTokBusinessModule.trackEvent.mockResolvedValue('success');
    mockTikTokBusinessModule.trackContentEvent.mockResolvedValue('success');
    mockTikTokBusinessModule.trackCustomEvent.mockResolvedValue('success');
  });

  describe('Function signatures', () => {
    it('should accept correct parameter types for initializeSdk', () => {
      // These should compile without TypeScript errors
      expect(() => {
        initializeSdk('app-id', '123456', 'test-token');
        initializeSdk('app-id', '123456', 'test-token', true);
        initializeSdk('app-id', '123456', 'test-token', false);
      }).not.toThrow();
    });

    it('should accept correct parameter types for identify', () => {
      expect(() => {
        identify('external-id', 'username', 'phone', 'email');
      }).not.toThrow();
    });

    it('should accept correct parameter types for trackEvent', () => {
      expect(() => {
        trackEvent(TikTokEventName.REGISTRATION);
        trackEvent(TikTokEventName.LOGIN, 'event-id');
        trackEvent(TikTokEventName.SEARCH, '', { query: 'query' });
      }).not.toThrow();
    });

    it('should accept correct parameter types for trackContentEvent', () => {
      expect(() => {
        trackContentEvent(TikTokContentEventName.ADD_TO_CART);
        trackContentEvent(TikTokContentEventName.PURCHASE, {
          [TikTokContentEventParameter.CURRENCY]: 'USD',
        });
        trackContentEvent(TikTokContentEventName.CHECK_OUT, {
          [TikTokContentEventParameter.VALUE]: '100.00',
          [TikTokContentEventParameter.CONTENTS]: [
            {
              [TikTokContentEventContentsParameter.CONTENT_ID]: 'item-1',
              [TikTokContentEventContentsParameter.QUANTITY]: 1,
            },
          ],
        });
      }).not.toThrow();
    });

    it('should accept correct parameter types for trackCustomEvent', () => {
      expect(() => {
        trackCustomEvent('custom-event');
        trackCustomEvent('custom-event', { description: 'value' });
        trackCustomEvent('custom-event', { value: 123, query: 'query' });
      }).not.toThrow();
    });
  });

  describe('Enum values', () => {
    it('should have correct TikTokEventName enum values', () => {
      expect(TikTokEventName.ACHIEVE_LEVEL).toBe('AchieveLevel');
      expect(TikTokEventName.ADD_PAYMENT_INFO).toBe('AddPaymentInfo');
      expect(TikTokEventName.COMPLETE_TUTORIAL).toBe('CompleteTutorial');
      expect(TikTokEventName.CREATE_GROUP).toBe('CreateGroup');
      expect(TikTokEventName.CREATE_ROLE).toBe('CreateRole');
      expect(TikTokEventName.GENERATE_LEAD).toBe('GenerateLead');
      expect(TikTokEventName.IN_APP_AD_CLICK).toBe('InAppADClick');
      expect(TikTokEventName.IN_APP_AD_IMPR).toBe('InAppADImpr');
      expect(TikTokEventName.INSTALL_APP).toBe('InstallApp');
      expect(TikTokEventName.JOIN_GROUP).toBe('JoinGroup');
      expect(TikTokEventName.LAUNCH_APP).toBe('LaunchAPP');
      expect(TikTokEventName.LOAN_APPLICATION).toBe('LoanApplication');
      expect(TikTokEventName.LOAN_APPROVAL).toBe('LoanApproval');
      expect(TikTokEventName.LOAN_DISBURSAL).toBe('LoanDisbursal');
      expect(TikTokEventName.LOGIN).toBe('Login');
      expect(TikTokEventName.RATE).toBe('Rate');
      expect(TikTokEventName.REGISTRATION).toBe('Registration');
      expect(TikTokEventName.SEARCH).toBe('Search');
      expect(TikTokEventName.SPEND_CREDITS).toBe('SpendCredits');
      expect(TikTokEventName.START_TRIAL).toBe('StartTrial');
      expect(TikTokEventName.SUBSCRIBE).toBe('Subscribe');
      expect(TikTokEventName.UNLOCK_ACHIEVEMENT).toBe('UnlockAchievement');
    });

    it('should have correct TikTokContentEventName enum values', () => {
      expect(TikTokContentEventName.ADD_TO_CART).toBe('ADD_TO_CART');
      expect(TikTokContentEventName.ADD_TO_WISHLIST).toBe('ADD_TO_WISHLIST');
      expect(TikTokContentEventName.CHECK_OUT).toBe('CHECK_OUT');
      expect(TikTokContentEventName.PURCHASE).toBe('PURCHASE');
      expect(TikTokContentEventName.VIEW_CONTENT).toBe('VIEW_CONTENT');
    });

    it('should have correct TikTokContentEventParameter enum values', () => {
      expect(TikTokContentEventParameter.CONTENT_TYPE).toBe('CONTENT_TYPE');
      expect(TikTokContentEventParameter.CONTENT_ID).toBe('CONTENT_ID');
      expect(TikTokContentEventParameter.DESCRIPTION).toBe('DESCRIPTION');
      expect(TikTokContentEventParameter.CURRENCY).toBe('CURRENCY');
      expect(TikTokContentEventParameter.VALUE).toBe('VALUE');
      expect(TikTokContentEventParameter.CONTENTS).toBe('CONTENTS');
      expect(TikTokContentEventParameter.ORDER_ID).toBe('ORDER_ID');
    });

    it('should have correct TikTokContentEventContentsParameter enum values', () => {
      expect(TikTokContentEventContentsParameter.CONTENT_ID).toBe('CONTENT_ID');
      expect(TikTokContentEventContentsParameter.CONTENT_CATEGORY).toBe(
        'CONTENT_CATEGORY'
      );
      expect(TikTokContentEventContentsParameter.BRAND).toBe('BRAND');
      expect(TikTokContentEventContentsParameter.PRICE).toBe('PRICE');
      expect(TikTokContentEventContentsParameter.QUANTITY).toBe('QUANTITY');
      expect(TikTokContentEventContentsParameter.CONTENT_NAME).toBe(
        'CONTENT_NAME'
      );
    });
  });

  describe('Return types', () => {
    it('should return Promise<string> for all async functions', async () => {
      // Test that all functions return the correct type
      const initResult = await initializeSdk('app', '123456', 'test-token');
      const identifyResult = await identify('id', 'name', 'phone', 'email');
      const logoutResult = await logout();
      const trackEventResult = await trackEvent(TikTokEventName.REGISTRATION);
      const trackContentEventResult = await trackContentEvent(
        TikTokContentEventName.ADD_TO_CART
      );
      const trackCustomEventResult = await trackCustomEvent('custom');

      expect(typeof initResult).toBe('string');
      expect(typeof identifyResult).toBe('string');
      expect(typeof logoutResult).toBe('string');
      expect(typeof trackEventResult).toBe('string');
      expect(typeof trackContentEventResult).toBe('string');
      expect(typeof trackCustomEventResult).toBe('string');
    });
  });

  describe('TikTokBusiness object structure', () => {
    it('should have all required methods', () => {
      expect(typeof TikTokBusiness.initializeSdk).toBe('function');
      expect(typeof TikTokBusiness.identify).toBe('function');
      expect(typeof TikTokBusiness.logout).toBe('function');
      expect(typeof TikTokBusiness.trackEvent).toBe('function');
      expect(typeof TikTokBusiness.trackContentEvent).toBe('function');
      expect(typeof TikTokBusiness.trackCustomEvent).toBe('function');
    });

    it('should have methods with correct signatures', () => {
      // Test that methods have the expected number of parameters
      expect(TikTokBusiness.initializeSdk.length).toBe(4);
      expect(TikTokBusiness.identify.length).toBe(4);
      expect(TikTokBusiness.logout.length).toBe(0);
      expect(TikTokBusiness.trackEvent.length).toBe(3);
      expect(TikTokBusiness.trackContentEvent.length).toBe(2);
      expect(TikTokBusiness.trackCustomEvent.length).toBe(2);
    });
  });

  describe('Complex type usage', () => {
    it('should handle complex content event parameters', () => {
      const complexProperties = {
        [TikTokContentEventParameter.CURRENCY]: 'USD',
        [TikTokContentEventParameter.VALUE]: '199.99',
        [TikTokContentEventParameter.CONTENT_TYPE]: 'product',
        [TikTokContentEventParameter.DESCRIPTION]: 'Premium product bundle',
        [TikTokContentEventParameter.ORDER_ID]: 'order-12345',
        [TikTokContentEventParameter.CONTENTS]: [
          {
            [TikTokContentEventContentsParameter.CONTENT_ID]: 'item-1',
            [TikTokContentEventContentsParameter.CONTENT_NAME]: 'Premium Item',
            [TikTokContentEventContentsParameter.CONTENT_CATEGORY]:
              'Electronics',
            [TikTokContentEventContentsParameter.BRAND]: 'BrandName',
            [TikTokContentEventContentsParameter.PRICE]: '99.99',
            [TikTokContentEventContentsParameter.QUANTITY]: 2,
          },
          {
            [TikTokContentEventContentsParameter.CONTENT_ID]: 'item-2',
            [TikTokContentEventContentsParameter.CONTENT_NAME]: 'Standard Item',
            [TikTokContentEventContentsParameter.PRICE]: '49.99',
            [TikTokContentEventContentsParameter.QUANTITY]: 1,
          },
        ],
      };

      expect(() => {
        trackContentEvent(TikTokContentEventName.PURCHASE, complexProperties);
      }).not.toThrow();
    });

    it('should handle mixed data types in custom events', () => {
      const mixedProperties = {
        contents: {
          price: 123.45,
          quantity: 2,
          content_type: 'product',
          content_id: 'item-123',
          brand: 'BrandX',
          content_name: 'Sample Product',
        },
        currency: 'USD',
        value: 99.99,
        description: 'Sample event with mixed properties',
        query: 'search term',
      };

      expect(() => {
        trackCustomEvent('mixed_event', mixedProperties);
      }).not.toThrow();
    });
  });
});
