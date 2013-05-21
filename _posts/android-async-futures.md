{{{
  "title" : "Futures in AndroidAsync",
  "date": "5-20-2013"
}}}

If you haven't play with [AndroidAsync](http://koush.com/AndroidAsync) yet, you should. It's a powerful [NIO](http://en.wikipedia.org/wiki/New_I/O) based
socket and HTTP library for Android. Super fast, easy to use, and asynchronous.

The initial implementation was entirely callback based. So, you'd do something like, this:

```java
client.getString(url, new AsyncHttpClient.StringCallback() {
    // Callback is invoked with any exceptions/errors, and the result, if available.
    @Override
    public void onCompleted(Exception e, AsyncHttpResponse response, String result) {
        if (e != null) {
            e.printStackTrace();
            return;
        }
        System.out.println("I got a string: " + result);
    }
});
```

I got a few request for [Futures](http://en.wikipedia.org/wiki/Futures_and_promises), which are also a nice pattern.
So I added that transparently by making all the asynchronous calls return a Future instead of void.

So, now:

```java
Future<String> string = client.getString("http://foo.com/hello.txt");
// this may throw if there was an error getting the string!
String value = string.get();
```

Futures can also have callbacks...

```java
Future<String> string = client.getString("http://foo.com/hello.txt");
string.setCallback(new FutureCallback<String>() {
    @Override
    public void onCompleted(Exception e, String result) {
        System.out.println(result);
    }
});
```

For brevity...

```java
client.getString("http://foo.com/hello.txt")
.setCallback(new FutureCallback<String>() {
    @Override
    public void onCompleted(Exception e, String result) {
        System.out.println(result);
    }
});
```

Enjoy!