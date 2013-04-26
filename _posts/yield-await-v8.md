{{{
  "title" : "Hacking V8: 'yield' and 'await' in node.js",
  "date": "4-24-2013"
}}}

A little over a year ago, I [added 'await' support to node.js](https://github.com/koush/node/wiki/%22async%22-support-in-node.js)
(Chrome V8). I had also planned on adding support for 'yield', but never got around to it. But last night, I needed a break from
another project I'd been working on, and decided to try my hand at implementing 'yield'.

![](yield-await-v8/borat.jpg)

### A-wait? What are you talking about?

A quick summary: await is a syntax/runtime feature [from C# 5.0](http://msdn.microsoft.com/en-us/library/vstudio/hh191443.aspx)
that allows suspension execution of a function until a task (ie, a callback) is completed. The function _does not block_.

Here's an example of code without await. I want to download two text files in node.js, combine them, and return
them to the caller:

#### Normal Code

```javascript
// import common node.js request library method
// which takes a url and a callback.
// available via "npm install request".
var request = require('request');

function downloadThings(callback) {
  request('http://foo.com/file1.txt', function(err, res, data1) {
    if (err) {
      callback(err);
      return;
    }
    request('http://foo.com/file2.txt', function(err, res, data2) {
      if (err) {
        callback(err);
        return;
      }
      // return the two files as a single string
      callback(null, data1 + data2);
    });
  });
}

downloadThings(function(error, data) {
  if (error) {
    console.log('error: ' + error);
    return;
  }
  console.log('combined data: ' + data);
});
```

Om nom nom, callback spaghetti!

#### Await

What's this same function look like with 'await'?

```javascript
var request = require('request');
// mark the function as suspendable via the added '$function' keyword
$function downloadThings() {
  await err, res, data1 = request('http://foo.com/file1.txt');
  if (err)
    return err;
  await err, res, data2 = request('http://foo.com/file1.txt');
  return null, data1 + data2;
}

downloadThings(function(error, data) {
  if (error) {
    console.log('error: ' + error);
    return;
  }
  console.log('combined data: ' + data);
});
```

Keep in mind, that 'await' does _not_ block. It suspends execution, by turning everything below the await into the callback
body. The 'await' is syntactic sugar. The two examples are essentially equivalent. You can think of 'await' as an
asynchronous 'var' declaration.

### Yield

Firefox has had 'yield' support (aka generators) since [JavaScript 1.7](http://en.wikipedia.org/wiki/JavaScript#Version_history),
which was released in 2008. Though this is not part of the ECMA standard, it really ought to be.

The underpinnings of yield and await are essentially the same. They both, under the hood, are leveraging 'call/cc', short for
[call-with-continuation](http://en.wikipedia.org/wiki/Call-with-current-continuation). The call/cc mechanism is what allows
mid-function execution suspension and resume.

Generators are extremely powerful. They allow a program to create an iterator that evaluates the next result upon every iteration.
Consider the following program written without generators. The entire fibonacci series (up to 10) is generated and returned up front:

#### Normal Fibonacci

```javascript
function fibonacci(count) {
  if (!count)
    return [];
  if (count == 1)
    return [1];
  var ret = [1, 1];
  for (var i = 2; i < count; i++) {
    ret.push(ret[i - 1] + ret[i - 2]);
  }
  
  return ret;
}

console.log(fibonacci(10));

// this will print the following:
[ 1, 1, 2, 3, 5, 8, 13, 21, 34, 55 ]
```

#### Generator Fibonacci

In this generator example, note that the 'while' loop seems as if the program would continue infinitely...
but it does not due to the 'yield' which suspends execution until the next iteration. The fibonacci series
is generated on an as needed basis.

```javascript
$function fibonacci() {
  var first = 1;
  yield first;
  var second = 1;
  yield second;
  // infinite loop? Nope! there's a yield in there.
  while (true) {
    var sum = first + second;
    yield sum;
    first = second;
    second = sum;
  }
}
var fibgen = fibonacci();
var val;
for (var i = 0; i < 10; i++) {
  console.log(fibgen.next());
}

// this prints 1, 1, 2, 3, 5, 8, 13, 21, 34, 55 (on separate lines)
```

### How Can I Get This?!

My modified version of node.js/V8 is on [Github](https://github.com/koush/node/tree/async-v0.10.x). Make sure you check out the async-v0.10.x branch.
