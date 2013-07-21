{{{
  "title" : "Hacking V8 Redux: 'await' in node.js",
  "date": "7-20-2013"
}}}

![](yield-await-v8/borat.jpg)

A few months ago, I [blogged about hacking V8](http://koush.com/post/yield-await-v8) to add support for await.
Since then, V8 has finally gotten around to adding [native support for generators/yield](https://code.google.com/p/v8/issues/detail?id=2355).

Rewriting await on top of yield has proven to be extremely easy. Roughly [130 lines of code](https://github.com/koush/node/commit/28ff643c578ee60ae0406d9d26e47bf56fba9660) over the course of a couple hours.
Whereas, the original implementation I did over a year ago took 1600 lines of code over the course of several weeks.

The "await" keyword works with legacy synchronous functions that take a final callback argument:

```javascript
function callback(cb) {
  process.nexttick(function() {
    cb(3);
  });
}

function* asyncfunction() {
  await value = callback();
  console.log(value);
}

// this is a generator, so invoke it as such
asyncfunction().next();

// previous async function is equivalent to:
function syncfunction() {
  cb(function(value) {
    console.log(value);
  });
}

syncfunction();

// prints:
// 3
// 3
```

And the "await*" keyword works with new generator functions:


```javascript
function wait(time, cb) {
  setTimeout(function() {
    cb(time, 'epic meal time');
  }, time);
}

function* asyncwait(time) {
  await f, str = wait(time);
  return str + f;
}

function* run() {
  await f, str = wait(1);
  console.log(f,str);
  // await* will wait for the generator function to complete
  // in entirety.
  await* str = asyncwait(2);
  console.log(str);
  console.log('done');
}

run().next();

// prints:
// 1 'epic meal time'
// epic meal time2
// done
```

The code is up on [my fork on Github](https://github.com/koush/node) for anyone to grab. Enjoy!