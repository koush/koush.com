{{{
  "title" : "I'm Back.",
  "date": "4-15-2013"
}}}

I stopped blogging a while ago, mostly because I started using [Google+](https://plus.google.com/103583939320326217147/posts) a lot more.
But, Google+ isn't the greatest place to write about code or technical posts. The formatting options are quite limited, and code formatting is nonexistent.

[My old website](http://www.koushikdutta.com) is hosted by Blogger, is a throwback to my time as a Windows developer.
[Windows Live Writer](http://www.live-writer.net/windows-live-writer-download/) is a pretty fantastic tool, and was what I'd use to publish my posts.
Along comes Android, spurring my switch to a Mac desktop environment. I'd run Windows in a VM to write to my blog. That workflow was fairly painful.
Not to mention that the templates and customization options for blogger are quite lackluster anyways.

I've been in love with [node.js](http://nodejs.org/), and found a lightweight blogging platform called [Poet](http://jsantell.github.io/poet/).
After some minor tweaking, it supports the main/minimal features I wanted:

##### File based posts and Markdown
I like being able to go to Github, create a new file at [koush.com](https://github.com/koush/koush.com), and edit it using their Markdown editor.
You can view/fork/edit [this post](https://github.com/koush/koush.com/blob/master/_posts/first.md) on Github.

##### Code snippets
I blog about code fairly often, so I need code snippets that look good. For example:

```java
for (int i = 0; i <10; i++) {
  // this is a comment
  System.out.println("hello world " + i);

  // this is a comment
  System.out.println("hello world 222 " + i);
}
```

##### Simple Scripting
Furthermore, static sites are limited. Sometimes I want to do some server side scripting in my posts.
This gives me the flexibility of being able to [hack on the site](https://github.com/koush/koush.com/blob/master/app.js)
and easily add dynamic content.

##### So...
Expect more posts here. I hope.

