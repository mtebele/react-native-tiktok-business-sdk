// Mock React Native's NativeModules globally
const mockTikTokBusinessModule = {
  initializeSdk: jest.fn(),
  identify: jest.fn(),
  logout: jest.fn(),
  flush: jest.fn(),
  trackEvent: jest.fn(),
  trackContentEvent: jest.fn(),
  trackCustomEvent: jest.fn(),
  trackAdRevenueEvent: jest.fn(),
};

// Mock React Native Platform
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  select: jest.fn((config) => config.default || config.android || config.ios),
  OS: 'ios',
}));

// Mock React Native's NativeModules
jest.mock('react-native', () => ({
  NativeModules: {
    TikTokBusinessModule: mockTikTokBusinessModule,
  },
  Platform: {
    select: jest.fn((config) => config.default || config.android || config.ios),
    OS: 'ios',
  },
}));

// Global test utilities
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveBeenCalledWithEventName(eventName: string): R;
      toHaveBeenCalledWithProperties(properties: any): R;
    }
  }
}

// Custom matchers for better test assertions
expect.extend({
  toHaveBeenCalledWithEventName(
    received: jest.MockedFunction<any>,
    eventName: string
  ) {
    const calls = received.mock.calls;
    const pass = calls.some((call: string[]) => call[0] === eventName);

    if (pass) {
      return {
        message: () =>
          `Expected mock not to have been called with event name "${eventName}"`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `Expected mock to have been called with event name "${eventName}"`,
        pass: false,
      };
    }
  },

  toHaveBeenCalledWithProperties(
    received: jest.MockedFunction<any>,
    properties: any
  ) {
    const calls = received.mock.calls;
    const pass = calls.some((call: any[]) => {
      const callProperties = call[1] || call[2]; // properties might be second or third parameter
      return JSON.stringify(callProperties) === JSON.stringify(properties);
    });

    if (pass) {
      return {
        message: () =>
          `Expected mock not to have been called with properties ${JSON.stringify(properties)}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `Expected mock to have been called with properties ${JSON.stringify(properties)}`,
        pass: false,
      };
    }
  },
});

// Test utilities
export const createMockResponse = (success = true, data?: any) => {
  return success
    ? Promise.resolve(data || 'success')
    : Promise.reject(new Error('Mock error'));
};

export const resetAllMocks = () => {
  Object.values(mockTikTokBusinessModule).forEach((mock) => {
    if (jest.isMockFunction(mock)) {
      mock.mockReset();
    }
  });
};

export const setupMockSuccess = () => {
  Object.values(mockTikTokBusinessModule).forEach((mock) => {
    if (jest.isMockFunction(mock)) {
      mock.mockResolvedValue('success');
    }
  });
};

export const setupMockFailure = (error = new Error('Mock error')) => {
  Object.values(mockTikTokBusinessModule).forEach((mock) => {
    if (jest.isMockFunction(mock)) {
      mock.mockRejectedValue(error);
    }
  });
};

export { mockTikTokBusinessModule };
