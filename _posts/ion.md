{{{
  "title" : "ION - Android Networking Made Easy",
  "date": "7-1-2013"
}}}

I released [Ion](https://plus.google.com/103583939320326217147/posts/64ciSdeFaB5) nearly a month ago,
and completely forgot to blog about it. Whoops.

Ion is a general purpose networking library. Whether it is JSON, Strings, Files, Images (into ImageViews), etc; Ion
can handle it.

There were a few high level goals that I wanted to accomplish:

 * Thread management should be transparent. Automatic invocation back onto the UI thread.
 * Intuitive and flexible API.
 * Automatic http caching.
 * Activity and Service lifecycle aware. No more checking [isDestroyed](http://developer.android.com/reference/android/app/Activity.html#isDestroyed()).
 * All operations should return Futures (which are Cancelable).

The [Ion Github page](https://github.com/koush/ion) has a ton of samples that are worth checking out,
but here's a quick overview of the API. Suppose you want to download a http resource as a String:

```java
Ion.with(context, "http://example.com/thing.txt")
.asString()
.setCallback(new FutureCallback<String>() {
   @Override
    public void onCompleted(Exception e, String result) {
        // do stuff with the result or error
    }
});
```

Want to download JSON? Easy, just change the "asString" to "asJsonObject".

```java
Ion.with(context, "http://example.com/thing.json")
.asJsonObject()
.setCallback(new FutureCallback<JsonObject>() {
   @Override
    public void onCompleted(Exception e, JsonObject result) {
        // do stuff with the result or error
    }
});
```

Posting JSON is also easy:

```java
JsonObject json = new JsonObject();
json.addProperty("foo", "bar");

Ion.with(context, "http://example.com/post")
.setJsonObjectBody(json)
.asJsonObject()
.setCallback(new FutureCallback<JsonObject>() {
   @Override
    public void onCompleted(Exception e, String result) {
        // do stuff with the result or error
    }
});
```

Putting an image into an ImageView follows the same mechanics.

```java
Ion.with(imageView)
.placeholder(R.drawable.placeholder_image)
.error(R.drawable.error_image)
.load("http://example.com/image.png");
```

The image API also supports ListView recycling, caching, etc. Ion is a successor to [UrlImageViewHelper](http://koush.com/UrlImageViewHelper).

Ion's fluent API is meant to be intuitive, and easily extensible. As I mentioned, Ion offers a _ton_ of flexibility
and features. Check out the [README](https://github.com/koush/ion/blob/master/README.md) on the Github page for more samples, as this post barely scratches the surface of what is possible. If you find a feature is missing, let me know, and I'll add it.