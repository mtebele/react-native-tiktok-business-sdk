package com.tiktokbusiness

import com.facebook.react.bridge.*
import com.tiktok.TikTokBusinessSdk
import com.tiktok.appevents.base.EventName
import com.tiktok.appevents.base.TTAdRevenueEvent
import com.tiktok.appevents.base.TTBaseEvent
import com.tiktok.appevents.contents.*
import org.json.JSONObject

class TikTokBusinessModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String {
    return NAME
  }

  /**
   * Identifies the user when user information changes (login, signup, profile update, etc.).
   */
  @ReactMethod
  fun identify(
    externalId: String, externalUserName: String?, phoneNumber: String?, email: String?,
    promise: Promise
  ) {
    try {
      TikTokBusinessSdk.identify(externalId, externalUserName, phoneNumber, email)
      promise.resolve("User identified successfully")
    } catch (e: Exception) {
      promise.reject("IDENTIFY_ERROR", "Failed to identify user", e)
    }
  }

  /**
   * Logs out the user.
   */
  @ReactMethod
  fun logout(promise: Promise) {
    try {
      TikTokBusinessSdk.logout()
      promise.resolve("User logged out successfully")
    } catch (e: Exception) {
      promise.reject("LOGOUT_ERROR", "Failed to logout user", e)
    }
  }

  /**
   * Flushes pending events to TikTok's servers.
   */
  @ReactMethod
  fun flush(promise: Promise) {
    try {
      TikTokBusinessSdk.flush()
      promise.resolve("Events flushed successfully")
    } catch (e: Exception) {
      promise.reject("FLUSH_ERROR", "Failed to flush events", e)
    }
  }

  /**
   * Maps event name strings to EventName enums.
   */
  private fun getEventNameEnum(eventName: String): EventName? {
    return EventName.values().find { it.toString() == eventName }
  }

  /**
   * Reports a standard event.
   * If 'parameters' is null or empty, the event is reported without additional properties.
   * Otherwise, it builds a TTBaseEvent with the provided properties.
   *
   * Expects the eventName to match one of the string values in the EventName enum.
   */
  @ReactMethod
  fun trackEvent(
    eventName: String, eventId: String?, parameters: ReadableMap?, promise: Promise
  ) {
    try {
      val eventEnum = getEventNameEnum(eventName)
      if (eventEnum == null) {
        promise.reject("INVALID_EVENT_NAME", "Unknown event name: $eventName", null)
        return
      }
      if (parameters == null || !parameters.keySetIterator().hasNextKey()) {
        if (eventId.isNullOrEmpty()) {
          TikTokBusinessSdk.trackTTEvent(eventEnum)
        } else {
          TikTokBusinessSdk.trackTTEvent(eventEnum, eventId)
        }
      } else {
        val builder = TTBaseEvent.newBuilder(eventEnum.toString())
        val iterator = parameters.keySetIterator()
        while (iterator.hasNextKey()) {
          val key = iterator.nextKey()
          when (parameters.getType(key)) {
            ReadableType.String -> builder.addProperty(key, parameters.getString(key))
            ReadableType.Number -> builder.addProperty(key, parameters.getDouble(key))
            ReadableType.Boolean -> builder.addProperty(key, parameters.getBoolean(key))
            else -> {
              // Ignore other types if not needed
            }
          }
        }
        val event = builder.build()
        TikTokBusinessSdk.trackTTEvent(event)
      }
      promise.resolve("Event tracked successfully")
    } catch (e: Exception) {
      promise.reject("TRACK_EVENT_ERROR", "Failed to track event", e)
    }
  }

  /**
   * Reports a content event.
   * Selects the appropriate event builder based on the eventType and builds the event
   * using the provided properties. Iterates through the "CONTENTS" array and aggregates all items.
   */
  @ReactMethod
  fun trackContentEvent(eventType: String, properties: ReadableMap?, promise: Promise) {
    try {
      val builder: TTContentsEvent.Builder = when (eventType) {
        "ADD_TO_CART" -> TTAddToCartEvent.newBuilder()
        "ADD_TO_WISHLIST" -> TTAddToWishlistEvent.newBuilder()
        "CHECK_OUT" -> TTCheckoutEvent.newBuilder()
        "PURCHASE" -> TTPurchaseEvent.newBuilder()
        "VIEW_CONTENT" -> TTViewContentEvent.newBuilder()
        else -> {
          promise.reject("UNSUPPORTED_EVENT_TYPE", "Unsupported content event type: $eventType", null)
          return
        }
      }
      if (properties != null && properties.keySetIterator().hasNextKey()) {
        if (properties.hasKey("DESCRIPTION") && properties.getType("DESCRIPTION") == ReadableType.String) {
          builder.setDescription(properties.getString("DESCRIPTION"))
        }
        if (properties.hasKey("CURRENCY") && properties.getType("CURRENCY") == ReadableType.String) {
          val currencyStr = properties.getString("CURRENCY")
          if (!currencyStr.isNullOrEmpty()) {
            builder.setCurrency(TTContentsEventConstants.Currency.valueOf(currencyStr))
          }
        }
        if (properties.hasKey("VALUE") && properties.getType("VALUE") == ReadableType.Number) {
          builder.setValue(properties.getDouble("VALUE"))
        }
        if (properties.hasKey("CONTENT_TYPE") && properties.getType("CONTENT_TYPE") == ReadableType.String) {
          builder.setContentType(properties.getString("CONTENT_TYPE"))
        }
        // Iterate over the CONTENTS array and accumulate all content items.
        if (properties.hasKey("CONTENTS") && properties.getType("CONTENTS") != ReadableType.Null) {
          val contentsArray = properties.getArray("CONTENTS")
          if (contentsArray != null && contentsArray.size() > 0) {
            val contentsList = mutableListOf<TTContentParams>()
            for (i in 0 until contentsArray.size()) {
              val contentMap = contentsArray.getMap(i)
              if (contentMap != null) {
                val contentBuilder = TTContentParams.newBuilder()
                if (contentMap.hasKey("CONTENT_ID") && contentMap.getType("CONTENT_ID") == ReadableType.String) {
                  contentBuilder.setContentId(contentMap.getString("CONTENT_ID"))
                }
                if (contentMap.hasKey("CONTENT_CATEGORY") && contentMap.getType("CONTENT_CATEGORY") == ReadableType.String) {
                  contentBuilder.setContentCategory(contentMap.getString("CONTENT_CATEGORY"))
                }
                if (contentMap.hasKey("BRAND") && contentMap.getType("BRAND") == ReadableType.String) {
                  contentBuilder.setBrand(contentMap.getString("BRAND"))
                }
                if (contentMap.hasKey("PRICE") && contentMap.getType("PRICE") == ReadableType.Number) {
                  contentBuilder.setPrice(contentMap.getDouble("PRICE").toFloat())
                }
                if (contentMap.hasKey("QUANTITY") && contentMap.getType("QUANTITY") == ReadableType.Number) {
                  contentBuilder.setQuantity(contentMap.getInt("QUANTITY"))
                }
                if (contentMap.hasKey("CONTENT_NAME") && contentMap.getType("CONTENT_NAME") == ReadableType.String) {
                  contentBuilder.setContentName(contentMap.getString("CONTENT_NAME"))
                }
                contentsList.add(contentBuilder.build())
              }
            }
            // Set all content items via varargs
            builder.setContents(*contentsList.toTypedArray())
          }
        }
      }
      val event = builder.build()
      TikTokBusinessSdk.trackTTEvent(event)
      promise.resolve("Content event tracked successfully")
    } catch (e: Exception) {
      promise.reject("TRACK_CONTENT_EVENT_ERROR", "Failed to track content event", e)
    }
  }

  /**
   * Reports a custom event.
   * Builds the event using TTBaseEvent.newBuilder and adds the provided properties.
   */
  @ReactMethod
  fun trackCustomEvent(eventName: String, properties: ReadableMap?, promise: Promise) {
    try {
      val builder = TTBaseEvent.newBuilder(eventName)
      if (properties != null && properties.keySetIterator().hasNextKey()) {
        val iterator = properties.keySetIterator()
        while (iterator.hasNextKey()) {
          val key = iterator.nextKey()
          when (properties.getType(key)) {
            ReadableType.String -> builder.addProperty(key, properties.getString(key))
            ReadableType.Number -> builder.addProperty(key, properties.getDouble(key))
            ReadableType.Boolean -> builder.addProperty(key, properties.getBoolean(key))
            else -> {
              // Ignore other types if not needed
            }
          }
        }
      }
      val event = builder.build()
      TikTokBusinessSdk.trackTTEvent(event)
      promise.resolve("Custom event tracked successfully")
    } catch (e: Exception) {
      promise.reject("TRACK_CUSTOM_EVENT_ERROR", "Failed to track custom event", e)
    }
  }

  /**
   * Reports an ad revenue event.
   * Uses TTAdRevenueEvent to track impression-level ad revenue data.
   */
  @ReactMethod
  fun trackAdRevenueEvent(adRevenueJson: ReadableMap, eventId: String?, promise: Promise) {
    try {
      val jsonObject = JSONObject()
      val iterator = adRevenueJson.keySetIterator()
      while (iterator.hasNextKey()) {
        val key = iterator.nextKey()
        when (adRevenueJson.getType(key)) {
          ReadableType.String -> jsonObject.put(key, adRevenueJson.getString(key))
          ReadableType.Number -> jsonObject.put(key, adRevenueJson.getDouble(key))
          ReadableType.Boolean -> jsonObject.put(key, adRevenueJson.getBoolean(key))
          else -> {
            // Skip unsupported types
          }
        }
      }

      val event = if (eventId.isNullOrEmpty()) {
        TTAdRevenueEvent.newBuilder(jsonObject).build()
      } else {
        TTAdRevenueEvent.newBuilder(jsonObject, eventId).build()
      }

      TikTokBusinessSdk.trackTTEvent(event)
      promise.resolve("Ad revenue event tracked successfully")
    } catch (e: Exception) {
      promise.reject("TRACK_AD_REVENUE_ERROR", "Failed to track ad revenue event", e)
    }
  }

  @ReactMethod
  fun initializeSdk(appId: String, ttAppId: String, accessToken: String, debug: Boolean?, promise: Promise) {
    try {
      val configBuilder =
        TikTokBusinessSdk.TTConfig(reactApplicationContext, accessToken).setAppId(appId).setTTAppId(ttAppId)

      if (debug == true) {
        configBuilder.openDebugMode().setLogLevel(TikTokBusinessSdk.LogLevel.DEBUG)
      }

      TikTokBusinessSdk.initializeSdk(configBuilder, object : TikTokBusinessSdk.TTInitCallback {
        override fun success() {
          TikTokBusinessSdk.startTrack()
          promise.resolve("SDK initialized successfully")
        }

        override fun fail(code: Int, msg: String) {
          promise.reject("INIT_ERROR", "Failed to initialize TikTok SDK: $msg (code: $code)", null)
        }
      })
    } catch (e: Exception) {
      promise.reject("INIT_ERROR", "Failed to initialize TikTok SDK", e)
    }
  }

  companion object {
    const val NAME = "TikTokBusinessModule"
  }
}
