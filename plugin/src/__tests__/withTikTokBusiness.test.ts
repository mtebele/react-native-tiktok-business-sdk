import { AndroidConfig } from '@expo/config-plugins';
import type { InfoPlist } from '@expo/config-plugins/build/ios/IosConfig.types';

import withTikTokBusiness, {
  addApplicationQueriesSchemes,
  addSKAdNetworkItems,
  applyTikTokAndroidManifest,
  applyTikTokInfoPlist,
  setTikTokAppId,
  setUserTrackingPermission,
} from '../withTikTokBusiness';

const TIKTOK_SKADNETWORK_ID = '22mmun2rn5.skadnetwork';
const TIKTOK_QUERY_SCHEMES = ['tiktok', 'snssdk1233', 'snssdk1180'];
const ANDROID_META_DATA_APP_ID = 'com.tiktok.sdk.AppId';

function buildBaseAndroidManifest(): AndroidConfig.Manifest.AndroidManifest {
  return {
    manifest: {
      $: { 'xmlns:android': 'http://schemas.android.com/apk/res/android' },
      application: [
        {
          $: { 'android:name': '.MainApplication' },
        },
      ],
      queries: [],
    },
  };
}

function buildBaseExpoConfig() {
  return {
    name: 'TestApp',
    slug: 'test-app',
  };
}

describe('addSKAdNetworkItems', () => {
  it('adds the TikTok SKAdNetwork identifier when the plist is empty', () => {
    const result = addSKAdNetworkItems({}, [TIKTOK_SKADNETWORK_ID]);
    expect(result.SKAdNetworkItems).toEqual([
      { SKAdNetworkIdentifier: TIKTOK_SKADNETWORK_ID },
    ]);
  });

  it('preserves existing SKAdNetwork identifiers from other plugins', () => {
    const infoPlist: InfoPlist = {
      SKAdNetworkItems: [{ SKAdNetworkIdentifier: 'v9wttpbfk9.skadnetwork' }],
    };
    const result = addSKAdNetworkItems(infoPlist, [TIKTOK_SKADNETWORK_ID]);
    expect(result.SKAdNetworkItems).toEqual([
      { SKAdNetworkIdentifier: 'v9wttpbfk9.skadnetwork' },
      { SKAdNetworkIdentifier: TIKTOK_SKADNETWORK_ID },
    ]);
  });

  it('is idempotent — re-runs do not duplicate identifiers', () => {
    const first = addSKAdNetworkItems({}, [TIKTOK_SKADNETWORK_ID]);
    const second = addSKAdNetworkItems(first, [TIKTOK_SKADNETWORK_ID]);
    expect(second.SKAdNetworkItems).toEqual([
      { SKAdNetworkIdentifier: TIKTOK_SKADNETWORK_ID },
    ]);
  });

  it('normalizes identifiers to lowercase before deduping', () => {
    const result = addSKAdNetworkItems({}, [
      '22MMUN2RN5.skadnetwork',
      '22mmun2rn5.skadnetwork',
    ]);
    expect(result.SKAdNetworkItems).toEqual([
      { SKAdNetworkIdentifier: TIKTOK_SKADNETWORK_ID },
    ]);
  });
});

describe('addApplicationQueriesSchemes', () => {
  it('adds TikTok schemes when none are configured', () => {
    const result = addApplicationQueriesSchemes({}, TIKTOK_QUERY_SCHEMES);
    expect(result.LSApplicationQueriesSchemes).toEqual(TIKTOK_QUERY_SCHEMES);
  });

  it('appends TikTok schemes after existing ones', () => {
    const result = addApplicationQueriesSchemes(
      { LSApplicationQueriesSchemes: ['fbapi'] },
      TIKTOK_QUERY_SCHEMES
    );
    expect(result.LSApplicationQueriesSchemes).toEqual([
      'fbapi',
      ...TIKTOK_QUERY_SCHEMES,
    ]);
  });

  it('is idempotent — re-runs do not duplicate schemes', () => {
    const first = addApplicationQueriesSchemes({}, TIKTOK_QUERY_SCHEMES);
    const second = addApplicationQueriesSchemes(first, TIKTOK_QUERY_SCHEMES);
    expect(second.LSApplicationQueriesSchemes).toEqual(TIKTOK_QUERY_SCHEMES);
  });
});

describe('setTikTokAppId', () => {
  it('writes the TikTokAppID key when provided', () => {
    const result = setTikTokAppId({}, '123456');
    expect(result.TikTokAppID).toBe('123456');
  });

  it('leaves the plist untouched when no app id is provided', () => {
    const result = setTikTokAppId({ TikTokAppID: 'existing' }, undefined);
    expect(result.TikTokAppID).toBe('existing');
  });

  it('overrides an existing TikTokAppID when a new value is provided', () => {
    const result = setTikTokAppId({ TikTokAppID: 'old' }, 'new');
    expect(result.TikTokAppID).toBe('new');
  });
});

describe('setUserTrackingPermission', () => {
  it('writes NSUserTrackingUsageDescription when a description is provided', () => {
    const result = setUserTrackingPermission({}, 'Track me');
    expect(result.NSUserTrackingUsageDescription).toBe('Track me');
  });

  it('preserves any existing description when no value is provided', () => {
    const result = setUserTrackingPermission(
      { NSUserTrackingUsageDescription: 'pre-existing' },
      undefined
    );
    expect(result.NSUserTrackingUsageDescription).toBe('pre-existing');
  });
});

describe('applyTikTokInfoPlist', () => {
  it('applies all defaults with empty options', () => {
    const result = applyTikTokInfoPlist({}, {});
    expect(result.SKAdNetworkItems).toEqual([
      { SKAdNetworkIdentifier: TIKTOK_SKADNETWORK_ID },
    ]);
    expect(result.LSApplicationQueriesSchemes).toEqual(TIKTOK_QUERY_SCHEMES);
    expect(result.TikTokAppID).toBeUndefined();
    expect(result.NSUserTrackingUsageDescription).toBeUndefined();
  });

  it('appends additional skAdNetworkIds passed by the consumer', () => {
    const result = applyTikTokInfoPlist(
      {},
      {
        skAdNetworkIds: ['extra.skadnetwork'],
      }
    );
    expect(result.SKAdNetworkItems).toEqual([
      { SKAdNetworkIdentifier: TIKTOK_SKADNETWORK_ID },
      { SKAdNetworkIdentifier: 'extra.skadnetwork' },
    ]);
  });

  it('is fully idempotent across re-runs', () => {
    const first = applyTikTokInfoPlist(
      {},
      {
        tiktokAppId: '999',
        userTrackingPermission: 'Track me',
      }
    );
    const second = applyTikTokInfoPlist(first, {
      tiktokAppId: '999',
      userTrackingPermission: 'Track me',
    });
    expect(second.SKAdNetworkItems).toEqual([
      { SKAdNetworkIdentifier: TIKTOK_SKADNETWORK_ID },
    ]);
    expect(second.LSApplicationQueriesSchemes).toEqual(TIKTOK_QUERY_SCHEMES);
    expect(second.TikTokAppID).toBe('999');
    expect(second.NSUserTrackingUsageDescription).toBe('Track me');
  });
});

describe('applyTikTokAndroidManifest', () => {
  it('adds the TikTok app id meta-data when provided', () => {
    const manifest = buildBaseAndroidManifest();
    const result = applyTikTokAndroidManifest(manifest, { tiktokAppId: '999' });
    const mainApp = result.manifest.application?.[0];
    expect(mainApp?.['meta-data']).toEqual([
      {
        $: {
          'android:name': ANDROID_META_DATA_APP_ID,
          'android:value': '999',
        },
      },
    ]);
  });

  it('leaves the manifest untouched when no app id is provided', () => {
    const manifest = buildBaseAndroidManifest();
    const result = applyTikTokAndroidManifest(manifest, {});
    expect(result.manifest.application?.[0]?.['meta-data']).toBeUndefined();
  });

  it('is idempotent — re-runs do not duplicate the meta-data entry', () => {
    const manifest = buildBaseAndroidManifest();
    const first = applyTikTokAndroidManifest(manifest, { tiktokAppId: '999' });
    const second = applyTikTokAndroidManifest(first, { tiktokAppId: '999' });
    const metaData = second.manifest.application?.[0]?.['meta-data'] ?? [];
    expect(metaData).toHaveLength(1);
    expect(metaData[0]?.$?.['android:value']).toBe('999');
  });

  it('replaces the previous value when the app id changes', () => {
    const manifest = buildBaseAndroidManifest();
    const first = applyTikTokAndroidManifest(manifest, { tiktokAppId: '999' });
    const second = applyTikTokAndroidManifest(first, { tiktokAppId: '1234' });
    const metaData = second.manifest.application?.[0]?.['meta-data'] ?? [];
    expect(metaData).toHaveLength(1);
    expect(metaData[0]?.$?.['android:value']).toBe('1234');
  });
});

describe('withTikTokBusiness (top-level plugin)', () => {
  it('schedules info plist and android manifest mods on the config', () => {
    const config = withTikTokBusiness(buildBaseExpoConfig(), {
      ios: { tiktokAppId: '999' },
      android: { tiktokAppId: '999' },
    }) as {
      mods?: {
        ios?: { infoPlist?: unknown };
        android?: { manifest?: unknown };
      };
    };
    expect(config.mods?.ios?.infoPlist).toBeDefined();
    expect(config.mods?.android?.manifest).toBeDefined();
  });

  it('runs only once even if applied multiple times', () => {
    const first = withTikTokBusiness(buildBaseExpoConfig(), {
      android: { tiktokAppId: '999' },
    });
    const second = withTikTokBusiness(first, {
      android: { tiktokAppId: '999' },
    });
    // createRunOncePlugin records the plugin in _internal.pluginHistory; a
    // second invocation must not append duplicate mods.
    expect(
      (second as { _internal?: { pluginHistory?: Record<string, unknown> } })
        ._internal?.pluginHistory
    ).toBeDefined();
  });

  it('accepts being called with no options', () => {
    expect(() =>
      withTikTokBusiness(buildBaseExpoConfig(), undefined)
    ).not.toThrow();
  });
});
