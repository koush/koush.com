{{{
  "title" : "Fancy Android URL ImageView Animations",
  "date": "4-22-2003"
}}}

[UrlImageViewHelper](/UrlImageViewHelper) will fill an ImageView with an image that is found at a URL. Loading image from a url
into and showing it in a ImageView is nearly ubiquitous amongst Android apps. Any social media client will do this.
This library makes it easy.

How you normally load a url into an ImageView with the library:

```java
UrlImageViewHelper.setUrlDrawable(imageView, "http://example.com/image.png");
```

More polished apps will show a simple animation, generally a scale or pop in, as the image finishes loading.
It's a nice touch and pleasing eye candy. Here's how you can do that with the UrlImageViewHelper project.


#### The Code

```java
UrlImageViewHelper.setUrlDrawable(iv, getItem(position), R.drawable.transparent, new UrlImageViewCallback() {
    @Override
    public void onLoaded(ImageView imageView, Bitmap loadedBitmap,
                          String url, boolean loadedFromCache) {
        if (!loadedFromCache) {
            ScaleAnimation scale = new ScaleAnimation(0, 1, 0, 1,
                ScaleAnimation.RELATIVE_TO_SELF, .5f,
                ScaleAnimation.RELATIVE_TO_SELF, .5f);
            scale.setDuration(140);
            imageView.startAnimation(scale);
        }
    }
});
```

#### The Result

![](http://www.youtube.com/watch?v=LRdtz6p73rE&feature=youtu.be)

#### The Library

Head on over to the [download](/UrlImageViewHelper) page to grab the library.