import {
  AndroidConfig,
  type ConfigPlugin,
  createRunOncePlugin,
  withAndroidManifest,
  withInfoPlist,
} from '@expo/config-plugins';
import type { InfoPlist } from '@expo/config-plugins/build/ios/IosConfig.types';

const pkg = require('react-native-tiktok-business-sdk/package.json');

const TIKTOK_SKADNETWORK_ID = '22mmun2rn5.skadnetwork';
const TIKTOK_QUERY_SCHEMES = ['tiktok', 'snssdk1233', 'snssdk1180'];
const ANDROID_META_DATA_APP_ID = 'com.tiktok.sdk.AppId';

const {
  addMetaDataItemToMainApplication,
  getMainApplicationOrThrow,
  removeMetaDataItemFromMainApplication,
} = AndroidConfig.Manifest;

export type TikTokBusinessPluginProps = {
  /**
   * Optional iOS-specific configuration.
   */
  ios?: {
    /**
     * Extra SKAdNetwork identifiers to append to `Info.plist`. TikTok's
     * default identifier (`22mmun2rn5.skadnetwork`) is always added.
     */
    skAdNetworkIds?: string[];
    /**
     * TikTok App ID to embed in `Info.plist` under the `TikTokAppID` key.
     */
    tiktokAppId?: string;
    /**
     * Sets `NSUserTrackingUsageDescription` in `Info.plist`. Leave undefined
     * if another plugin (e.g. `expo-tracking-transparency`) already manages it.
     */
    userTrackingPermission?: string;
  };
  /**
   * Optional Android-specific configuration.
   */
  android?: {
    /**
     * TikTok App ID to embed in `AndroidManifest.xml` as `com.tiktok.sdk.AppId`
     * meta-data. Omit to leave the manifest untouched.
     */
    tiktokAppId?: string;
  };
};

export function addSKAdNetworkItems(
  infoPlist: InfoPlist,
  identifiers: string[]
): InfoPlist {
  const existing = Array.isArray(infoPlist.SKAdNetworkItems)
    ? infoPlist.SKAdNetworkItems
    : [];
  const seen = new Set(
    existing
      .map((item) => item?.SKAdNetworkIdentifier)
      .filter((id): id is string => typeof id === 'string')
  );
  const additions: { SKAdNetworkIdentifier: string }[] = [];
  for (const raw of identifiers) {
    const id = raw.toLowerCase();
    if (seen.has(id)) {
      continue;
    }
    seen.add(id);
    additions.push({ SKAdNetworkIdentifier: id });
  }
  if (additions.length === 0) {
    return infoPlist;
  }
  return {
    ...infoPlist,
    SKAdNetworkItems: [...existing, ...additions],
  };
}

export function addApplicationQueriesSchemes(
  infoPlist: InfoPlist,
  schemes: string[]
): InfoPlist {
  const existing = Array.isArray(infoPlist.LSApplicationQueriesSchemes)
    ? [...infoPlist.LSApplicationQueriesSchemes]
    : [];
  const seen = new Set(existing);
  for (const scheme of schemes) {
    if (!seen.has(scheme)) {
      seen.add(scheme);
      existing.push(scheme);
    }
  }
  return {
    ...infoPlist,
    LSApplicationQueriesSchemes: existing,
  };
}

export function setTikTokAppId(
  infoPlist: InfoPlist,
  tiktokAppId: string | undefined
): InfoPlist {
  if (!tiktokAppId) {
    return infoPlist;
  }
  return {
    ...infoPlist,
    TikTokAppID: tiktokAppId,
  };
}

export function setUserTrackingPermission(
  infoPlist: InfoPlist,
  description: string | undefined
): InfoPlist {
  if (!description) {
    return infoPlist;
  }
  return {
    ...infoPlist,
    NSUserTrackingUsageDescription: description,
  };
}

export function applyTikTokInfoPlist(
  infoPlist: InfoPlist,
  ios: TikTokBusinessPluginProps['ios'] = {}
): InfoPlist {
  const extraIds = Array.isArray(ios.skAdNetworkIds) ? ios.skAdNetworkIds : [];
  let next = addSKAdNetworkItems(infoPlist, [
    TIKTOK_SKADNETWORK_ID,
    ...extraIds,
  ]);
  next = addApplicationQueriesSchemes(next, TIKTOK_QUERY_SCHEMES);
  next = setTikTokAppId(next, ios.tiktokAppId);
  next = setUserTrackingPermission(next, ios.userTrackingPermission);
  return next;
}

export function applyTikTokAndroidManifest(
  androidManifest: AndroidConfig.Manifest.AndroidManifest,
  android: TikTokBusinessPluginProps['android'] = {}
): AndroidConfig.Manifest.AndroidManifest {
  if (!android.tiktokAppId) {
    return androidManifest;
  }
  const mainApplication = getMainApplicationOrThrow(androidManifest);
  // Remove any pre-existing entry to avoid duplicates on re-runs.
  removeMetaDataItemFromMainApplication(
    mainApplication,
    ANDROID_META_DATA_APP_ID
  );
  addMetaDataItemToMainApplication(
    mainApplication,
    ANDROID_META_DATA_APP_ID,
    android.tiktokAppId
  );
  return androidManifest;
}

const withTikTokBusiness: ConfigPlugin<TikTokBusinessPluginProps | void> = (
  config,
  props
) => {
  const options = props ?? {};

  let next = withInfoPlist(config, (modConfig) => {
    modConfig.modResults = applyTikTokInfoPlist(
      modConfig.modResults,
      options.ios
    );
    return modConfig;
  });

  next = withAndroidManifest(next, (modConfig) => {
    modConfig.modResults = applyTikTokAndroidManifest(
      modConfig.modResults,
      options.android
    );
    return modConfig;
  });

  return next;
};

export default createRunOncePlugin(withTikTokBusiness, pkg.name, pkg.version);
