import Foundation
import React
import UIKit
import TikTokBusinessSDK

@objc(TikTokBusinessModule)
class TikTokBusinessModule: NSObject, RCTBridgeModule {
  
  // MARK: - RCTBridgeModule Protocol
  
  static func moduleName() -> String! {
    return "TikTokBusinessModule"
  }
  
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
  
  // MARK: - Public Methods Exposed to JS
  
  /// Identifies the user (login, signup, profile update, etc.).
  @objc func identify(_ externalId: String,
                      externalUserName: String?,
                      phoneNumber: String?,
                      email: String,
                      resolver: @escaping RCTPromiseResolveBlock,
                      rejecter: @escaping RCTPromiseRejectBlock) {
    do {
      TikTokBusiness.identify(withExternalID: externalId,
                              externalUserName: externalUserName,
                              phoneNumber: phoneNumber,
                              email: email)
      resolver("User identified successfully")
    } catch {
      rejecter("IDENTIFY_ERROR", "Failed to identify user", error)
    }
  }
  
  /// Logs out the user.
  @objc func logout(_ resolver: @escaping RCTPromiseResolveBlock,
                    rejecter: @escaping RCTPromiseRejectBlock) {
    do {
      TikTokBusiness.logout()
      resolver("User logged out successfully")
    } catch {
      rejecter("LOGOUT_ERROR", "Failed to logout user", error)
    }
  }
  
  /// Reports a standard event.
  /// If `parameters` is nil or empty, the event is reported without additional properties.
  /// Otherwise, a TTBaseEvent is built with the provided properties.
  /// Expects the eventName to match one of the values in the EventName enum.
  @objc func trackEvent(_ eventName: String,
                        eventId: String?,
                        parameters: NSDictionary?,
                        resolver: @escaping RCTPromiseResolveBlock,
                        rejecter: @escaping RCTPromiseRejectBlock) {
    do {
      let event = TikTokBaseEvent(eventName: eventName, eventId: eventId)
      
      if parameters != nil && (parameters?.count ?? 0) > 0 {
        for (key, value) in parameters! {
          guard let keyStr = key as? String else { continue }
          if let stringValue = value as? String {
            event.addProperty(withKey: keyStr, value: stringValue)
          } else if let numberValue = value as? NSNumber {
            event.addProperty(withKey: keyStr, value: Double(numberValue))
          } else if let boolValue = value as? Bool {
            event.addProperty(withKey: keyStr, value: boolValue)
          }
        }
      }
      
      TikTokBusiness.trackTTEvent(event)
      resolver("Event tracked successfully")
    } catch {
      rejecter("TRACK_EVENT_ERROR", "Failed to track event", error)
    }
  }
  
  /// Reports a content event.
  /// Selects the appropriate event builder based on the eventType and iterates over the "CONTENTS" array to add all content items.
  @objc func trackContentEvent(_ eventType: String,
                               properties: NSDictionary?,
                               resolver: @escaping RCTPromiseResolveBlock,
                               rejecter: @escaping RCTPromiseRejectBlock) {
    do {
      let event: TikTokContentsEvent
      switch eventType {
      case "ADD_TO_CART":
        event = TikTokAddToCartEvent()
      case "ADD_TO_WISHLIST":
        event = TikTokAddToWishlistEvent()
      case "CHECK_OUT":
        event = TikTokCheckoutEvent()      
      case "PURCHASE":
        event = TikTokPurchaseEvent()
      case "VIEW_CONTENT":
        event = TikTokViewContentEvent()
      default:
        rejecter("UNSUPPORTED_EVENT_TYPE", "Unsupported content event type: \(eventType)", nil)
        return
      }
      
      if let props = properties, props.count > 0 {
        if let description = props["DESCRIPTION"] as? String {
          event.setDescription(description)
        }
        if let currencyStr = props["CURRENCY"] as? String {
          // Map currency string to TTCurrency enum - using USD as default
          let currency = TTCurrency.USD // You may want to add proper currency mapping
          event.setCurrency(currency)
        }
        if let value = props["VALUE"] as? NSNumber {
          event.setValue(value.stringValue)
        }
        if let contentType = props["CONTENT_TYPE"] as? String {
          event.setContentType(contentType)
        }
        if let contentId = props["CONTENT_ID"] as? String {
          event.setContentId(contentId)
        }
        
        // Process the "CONTENTS" array
        if let contentsArray = props["CONTENTS"] as? [NSDictionary] {
          var contentParamsList : [TikTokContentParams] = []
          for contentDict in contentsArray {
            let eventContent = TikTokContentParams()
            if let contentId = contentDict["CONTENT_ID"] as? String {
              eventContent.contentId = contentId
            }
            if let brand = contentDict["BRAND"] as? String {
              eventContent.brand = brand
            }
            if let price = contentDict["PRICE"] as? NSNumber {
              eventContent.price = NSNumber(value: price.doubleValue)
            }
            if let quantity = contentDict["QUANTITY"] as? NSNumber {
              eventContent.quantity = quantity.intValue
            }
            if let contentName = contentDict["CONTENT_NAME"] as? String {
              eventContent.contentName = contentName
            }
            contentParamsList.append(eventContent)
          }
          // Set all content items using the varargs setter
          event.setContents(contentParamsList)
        }
      }
      
      TikTokBusiness.trackTTEvent(event)
      resolver("Content event tracked successfully")
    } catch {
      rejecter("TRACK_CONTENT_EVENT_ERROR", "Failed to track content event", error)
    }
  }
  
  /// Reports a custom event.
  /// Builds the event using TTBaseEvent.newBuilder and adds the provided properties.
  @objc func trackCustomEvent(_ eventName: String,
                              properties: NSDictionary?,
                              resolver: @escaping RCTPromiseResolveBlock,
                              rejecter: @escaping RCTPromiseRejectBlock) {
    do {
      let customEvent = TikTokBaseEvent(name: eventName)
      if let props = properties, props.count > 0 {
        for (key, value) in props {
          guard let keyStr = key as? String else { continue }
          if let stringValue = value as? String {
            customEvent.addProperty(withKey: keyStr, value: stringValue)
          } else if let numberValue = value as? NSNumber {
            customEvent.addProperty(withKey: keyStr, value: numberValue)
          } else if let boolValue = value as? Bool {
            customEvent.addProperty(withKey: keyStr, value: boolValue)
          }
        }
      }
      
      TikTokBusiness.trackTTEvent(customEvent)
      resolver("Custom event tracked successfully")
    } catch {
      rejecter("TRACK_CUSTOM_EVENT_ERROR", "Failed to track custom event", error)
    }
  }
  
  /// Reports an ad revenue event.
  /// Uses TikTokAdRevenueEvent to track impression-level ad revenue data.
  @objc func trackAdRevenueEvent(_ adRevenueJson: NSDictionary,
                                 eventId: String?,
                                 resolver: @escaping RCTPromiseResolveBlock,
                                 rejecter: @escaping RCTPromiseRejectBlock) {
    do {
      guard let adRevenueDict = adRevenueJson as? [AnyHashable: Any] else {
        rejecter("INVALID_AD_REVENUE_DATA", "Failed to convert ad revenue data", nil)
        return
      }
      
      let adRevenueEvent: TikTokBaseEvent
      if let eventId = eventId, !eventId.isEmpty {
        adRevenueEvent = TikTokAdRevenueEvent(adRevenue: adRevenueDict, eventId: eventId)
      } else {
        adRevenueEvent = TikTokAdRevenueEvent(adRevenue: adRevenueDict, eventId: "")
      }
      
      TikTokBusiness.trackTTEvent(adRevenueEvent)
      resolver("Ad revenue event tracked successfully")
    } catch {
      rejecter("TRACK_AD_REVENUE_ERROR", "Failed to track ad revenue event", error)
    }
  }
  
  /// Initializes the TikTok SDK.
  /// Accepts appId, ttAppId, accessToken, and an optional debug flag.
  @objc func initializeSdk(_ appId: String, 
                          ttAppId: String, 
                          accessToken: String, 
                          debug: NSNumber, 
                          resolver: @escaping RCTPromiseResolveBlock,
                          rejecter: @escaping RCTPromiseRejectBlock) {
    let config = TikTokConfig(accessToken: accessToken, appId: appId, tiktokAppId: ttAppId)
    
    let debugValue = debug.boolValue
    if debugValue {
      config?.enableDebugMode()
      config?.setLogLevel(TikTokLogLevelDebug)
    }
    
    TikTokBusiness.initializeSdk(config) { success, error in
      if success {
        print("[TikTokBusiness] TikTokBusiness initialized OK")
        resolver("SDK initialized successfully")
      } else {
        print("[TikTokBusiness] Initialization failed: \(error?.localizedDescription ?? "Unknown error")")
        rejecter("INIT_ERROR", "Failed to initialize TikTok SDK", error)
      }
    }
  }
}