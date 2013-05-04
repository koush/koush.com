{{{
  "title" : "Hiding Images from Android's MediaScanner",
  "date": "5-4-2013"
}}}

I've been dealing with a nasty bug in [Helium](https://play.google.com/store/apps/details?id=com.koushikdutta.backup) ([formerly Carbon](https://plus.google.com/103583939320326217147/posts/LUBoUuetNA8)) since the initial release:
The app icons that are saved to the SD Card during app backup pollute the user's Gallery.
I tore my hair out trying to fix this, as this was the number one complaint about the app, including:

* .nomedia file in all relevant directories. This does not work as of Android 4.0.
* Naming the image as a hidden file by dot prefixing it, ie ".com.package.png"
* Putting the hidden png file in a .nomedia _directory_.

Then the obvious solution hit me: look at the Android source code and see how the MediaScanner works, and figure out
how to bypass it.

Digging through [MediaScanner.java](https://github.com/CyanogenMod/android_frameworks_base/blob/cm-10.1/media/java/android/media/MediaScanner.java),
I found that any file designated as "isNoMediaFile" would not be scanned. But, I didn't want to name the image.png files,
.nomedia, as that is just hacky. Looking through the implementation of [isNoMedia](https://github.com/CyanogenMod/android_frameworks_base/blob/cm-10.1/media/java/android/media/MediaScanner.java#L1352), I found that not just .nomedia files fall
into this category...

```java
// special case certain file names
// I use regionMatches() instead of substring() below
// to avoid memory allocation
int lastSlash = path.lastIndexOf('/');
if (lastSlash >= 0 && lastSlash + 2 < path.length()) {
    // ignore those ._* files created by MacOS
    if (path.regionMatches(lastSlash + 1, "._", 0, 2)) {
        return true;
    }
```

Well, apparently '.\_' prefixed files are also considered "isNoMediaFile"! This is there because mounting the
external SD card on a Mac often results in the Mac creating '.\_' files in various directories. This is the Mac
convention for hidden system files, and Android needs to ignore those files as well!

So, the fix was to change "file.png" to "._file.png". Though, one should probably also keep a .nomedia file in the same
directory, ensure backwards compatibility with older versions of Android. Although I consider it a bug
that the MediaScanner is scanning directories with .nomedia files in them, I am relieved and happy to find a workaround.