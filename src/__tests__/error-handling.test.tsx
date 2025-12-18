/**
 * @jest-environment node
 */

describe('Error Handling - Module Not Linked', () => {
  beforeEach(() => {
    // Clear modules before each test
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw linking error when module is not available', async () => {
    // Mock NativeModules to return undefined for our module
    jest.doMock('react-native', () => ({
      NativeModules: {},
      Platform: {
        select: jest.fn(
          (config) => config.default || config.android || config.ios
        ),
        OS: 'ios',
      },
    }));

    // Re-require the module to get the proxy behavior
    const { initializeSdk } = require('../index');

    // Should throw the linking error immediately when trying to call
    await expect(async () => {
      await initializeSdk('test', '123456', 'test-token');
    }).rejects.toThrow('react-native-tiktok-business');
  });

  it('should throw linking error for identify when module is not available', async () => {
    // Mock NativeModules to return undefined for our module
    jest.doMock('react-native', () => ({
      NativeModules: {},
      Platform: {
        select: jest.fn(
          (config) => config.default || config.android || config.ios
        ),
        OS: 'ios',
      },
    }));

    // Re-require the module to get the proxy behavior
    const { identify } = require('../index');

    // Should throw the linking error immediately when trying to call
    await expect(async () => {
      await identify('user', 'name', 'phone', 'email');
    }).rejects.toThrow('react-native-tiktok-business');
  });

  it('should throw linking error for all methods when module is not available', async () => {
    // Mock NativeModules to return undefined for our module
    jest.doMock('react-native', () => ({
      NativeModules: {},
      Platform: {
        select: jest.fn(
          (config) => config.default || config.android || config.ios
        ),
        OS: 'ios',
      },
    }));

    // Re-require the module to get the proxy behavior
    const {
      initializeSdk,
      identify,
      logout,
      trackEvent,
      trackContentEvent,
      trackCustomEvent,
      TikTokEventName,
      TikTokContentEventName,
    } = require('../index');

    // All methods should throw the linking error
    await expect(async () => {
      await initializeSdk('test', '123456', 'test-token');
    }).rejects.toThrow('react-native-tiktok-business');

    await expect(async () => {
      await identify('user', 'name', 'phone', 'email');
    }).rejects.toThrow('react-native-tiktok-business');

    await expect(async () => {
      await logout();
    }).rejects.toThrow('react-native-tiktok-business');

    await expect(async () => {
      await trackEvent(TikTokEventName.REGISTRATION);
    }).rejects.toThrow('react-native-tiktok-business');

    await expect(async () => {
      await trackContentEvent(TikTokContentEventName.ADD_TO_CART);
    }).rejects.toThrow('react-native-tiktok-business');

    await expect(async () => {
      await trackCustomEvent('custom');
    }).rejects.toThrow('react-native-tiktok-business');
  });
});
