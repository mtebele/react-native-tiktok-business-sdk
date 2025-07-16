package com.tiktokbusiness

import com.facebook.react.bridge.*
import com.tiktok.TikTokBusinessSdk
import com.tiktok.appevents.base.EventName
import com.tiktok.appevents.base.TTBaseEvent
import com.tiktok.appevents.contents.*

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
    externalId: String, externalUserName: String?, phoneNumber: String?, email: String?
  ) {
    TikTokBusinessSdk.identify(externalId, externalUserName, phoneNumber, email)
  }

  /**
   * Logs out the user.
   */
  @ReactMethod
  fun logout() {
    TikTokBusinessSdk.logout()
  }

  /**
   * Reports a standard event.
   * If 'parameters' is null or empty, the event is reported without additional properties.
   * Otherwise, it builds a TTBaseEvent with the provided properties.
   *
   * Expects the eventName to match one of the values in the EventName enum.
   */
  @ReactMethod
  fun trackEvent(
    eventName: String, eventId: String?, parameters: ReadableMap?
  ) {
    val eventEnum = EventName.valueOf(eventName)
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
  }

  /**
   * Reports a content event.
   * Selects the appropriate event builder based on the eventType and builds the event
   * using the provided properties. Iterates through the "CONTENTS" array and aggregates all items.
   */
  @ReactMethod
  fun trackContentEvent(eventType: String, properties: ReadableMap?) {
    val builder: TTContentsEvent.Builder = when (eventType) {
      "ADD_TO_CART" -> TTAddToCartEvent.newBuilder()
      "ADD_TO_WHISHLIST" -> TTAddToWishlistEvent.newBuilder()
      "CHECK_OUT" -> TTCheckoutEvent.newBuilder()
      "PURCHASE" -> TTPurchaseEvent.newBuilder()
      "VIEW_CONTENT" -> TTViewContentEvent.newBuilder()
      else -> throw Exception("Unsupported content event type: $eventType")
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
  }

  /**
   * Reports a custom event.
   * Builds the event using TTBaseEvent.newBuilder and adds the provided properties.
   */
  @ReactMethod
  fun trackCustomEvent(eventName: String, properties: ReadableMap?) {
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
  }

  @ReactMethod
  fun initializeSdk(appId: String, ttAppId: String, accessToken: String, debug: Boolean?) {
    val configBuilder =
      TikTokBusinessSdk.TTConfig(reactApplicationContext,accessToken).setAppId(appId).setTTAppId(ttAppId)
      
    if (debug == true) {
      configBuilder.openDebugMode().setLogLevel(TikTokBusinessSdk.LogLevel.DEBUG)
    }

    TikTokBusinessSdk.initializeSdk(configBuilder, object : TikTokBusinessSdk.TTInitCallback {
      override fun success() {
        TikTokBusinessSdk.startTrack()
      }

      override fun fail(code: Int, msg: String) {
      }
    })
  }

  companion object {
    const val NAME = "TikTokBusinessModule"
  }
}
