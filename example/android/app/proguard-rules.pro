# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# TikTok, see https://business-api.tiktok.com/portal/docs?id=1739585434183746
-keep class com.tiktok.** { *; }
-keep class com.android.billingclient.api.** { *; }
-keep interface com.android.billingclient.api.* { *; }
-keep class androidx.lifecycle.** { *; }