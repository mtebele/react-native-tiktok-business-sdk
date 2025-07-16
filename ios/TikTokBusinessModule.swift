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
                      email: String) {
    TikTokBusiness.identify(withExternalID: externalId,
                               externalUserName: externalUserName,
                               phoneNumber: phoneNumber,
                               email: email)
  }
  
  /// Logs out the user.
  @objc func logout() {
    TikTokBusiness.logout()
  }
  
  /// Reports a standard event.
  /// If `parameters` is nil or empty, the event is reported without additional properties.
  /// Otherwise, a TTBaseEvent is built with the provided properties.
  /// Expects the eventName to match one of the values in the EventName enum.
  @objc func trackEvent(_ eventName: String,
                        eventId: String?,
                        parameters: NSDictionary?) {
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
      TikTokBusiness.trackTTEvent(event)
    }
  }
  
  /// Reports a content event.
  /// Selects the appropriate event builder based on the eventType and iterates over the "CONTENTS" array to add all content items.
  @objc func trackContentEvent(_ eventType: String,
                               properties: NSDictionary?) {
    let event: TikTokContentsEvent
    switch eventType {
    case "ADD_TO_CART":
      event = TikTokAddToCartEvent()
    case "ADD_TO_WHISHLIST":
      event = TikTokAddToWishlistEvent()
    case "CHECK_OUT":
      event = TikTokCheckoutEvent()      
    case "PURCHASE":
      event = TikTokPurchaseEvent()
    case "VIEW_CONTENT":
      event = TikTokViewContentEvent()
    default:
      print("Unsupported content event type: \(eventType)")
      return
    }
    
    if let props = properties, props.count > 0 {
      if let description = props["DESCRIPTION"] as? String {
        event.setDescription(description)
      }
      if let currencyStr = props["CURRENCY"] as? String {
        event.setCurrency(TTCurrency.CLP)
      }
      if let value = props["VALUE"] as? NSNumber {
        event.setValue(value.stringValue)
      }
      if let contentType = props["CONTENT_TYPE"] as? String {
        event.setContentType(contentType)
      }
      if let contentType = props["CONTENT_ID"] as? String {
        event.setContentId(contentType)
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
  }
  
  /// Reports a custom event.
  /// Builds the event using TTBaseEvent.newBuilder and adds the provided properties.
  @objc func trackCustomEvent(_ eventName: String,
                              properties: NSDictionary?) {
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
  }
  
  /// Initializes the TikTok SDK.
  /// Accepts appId, ttAppId, and an optional debug flag.
  @objc func initializeSdk(_ appId: String, ttAppId: String, accessToken: String, debug: NSNumber) {
    let config = TikTokConfig(accessToken: accessToken, appId: appId, tiktokAppId: ttAppId)
    let debugValue = debug.boolValue
    if debugValue {
      config?.enableDebugMode()
      config?.setLogLevel(TikTokLogLevelDebug)
    }
    TikTokBusiness.initializeSdk(config) { success, error in
      if success {
        print("[TikTokBusiness] TikTokBusiness initialized OK")
      } else {
        print("[TikTokBusiness] Initialization failed: \(error!.localizedDescription)")
      }
    }
  }
}