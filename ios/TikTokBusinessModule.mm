#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(TikTokBusinessModule, NSObject)

RCT_EXTERN_METHOD(identify:(NSString *)externalId
                  externalUserName:(NSString *)externalUserName
                  phoneNumber:(NSString *)phoneNumber
                  email:(NSString *)email
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(logout:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(flush:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(trackEvent:(NSString *)eventName
                  eventId:(NSString *)eventId
                  parameters:(NSDictionary *)parameters
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(trackContentEvent:(NSString *)eventType
                  properties:(NSDictionary *)properties
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(trackCustomEvent:(NSString *)eventName
                  properties:(NSDictionary *)properties
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(trackAdRevenueEvent:(NSDictionary *)adRevenueJson
                  eventId:(NSString *)eventId
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(initializeSdk:(NSString *)appId
                  ttAppId:(NSString *)ttAppId
                  accessToken:(NSString *)accessToken
                  debug:(nonnull NSNumber *)debug
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end