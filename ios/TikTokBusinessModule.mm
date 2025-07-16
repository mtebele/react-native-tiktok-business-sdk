#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(TikTokBusinessModule, NSObject)

RCT_EXTERN_METHOD(identify:(NSString *)externalId
                  externalUserName:(NSString *)externalUserName
                  phoneNumber:(NSString *)phoneNumber
                  email:(NSString *)email)

RCT_EXTERN_METHOD(logout)

RCT_EXTERN_METHOD(trackEvent:(NSString *)eventName
                  eventId:(NSString *)eventId
                  parameters:(NSDictionary *)parameters)

RCT_EXTERN_METHOD(trackContentEvent:(NSString *)eventType
                  properties:(NSDictionary *)properties)

RCT_EXTERN_METHOD(trackCustomEvent:(NSString *)eventName
                  properties:(NSDictionary *)properties)

RCT_EXTERN_METHOD(initializeSdk:(NSString *)appId
                  ttAppId:(NSString *)ttAppId
                  accessToken:(NSString *)accessToken
                  debug:(nonnull NSNumber *)debug)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end