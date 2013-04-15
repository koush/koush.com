
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();
var poet = require('poet')(app);
var markdown = require( "markdown" ).markdown;
var hljs = require('highlight.js');
var request = require('request');
var html2text = require( 'html-to-text');
var highlight = require('pygments').colorize;
var async = require('async');

markdown.Markdown.dialects.Gruber.inline['`'] = function inlineCode( text ) {
  // Inline code block. as many backticks as you like to start it
  // Always skip over the opening ticks.
  var m = text.match( /(`+)(\w*?[\r\n])(([\s\S]*?)\1)/ );
  if ( m && m[3] ) {
    var contents = m[4];
    var lang = m[2].trim();
    contents = hljs.highlight(lang, contents).value;
    // return [ m[1].length + m[2].length + m[3].length, [ "raw", "<pre class='highlight'>" + contents + "</pre>" ] ];
    return [ m[1].length + m[2].length + m[3].length, [ "pygmentize", lang, m[4] ] ];
    
  }
  else {
    // TODO: No matching end code found - warn!
    return [ 1, "`" ];
  }
};

poet
.createPostRoute()
.createPageRoute()
.createTagRoute()
.createCategoryRoute()
.init(function(core) {
  app.get('/rss', function ( req, res ) {
    var posts = core.getPosts(0, 5);
    
    // Since the preview is automatically generated for the examples,
    // it contains markup. Strip out the markup with the html-to-text
    // module. Or you can specify your own specific rss description
    // per post
    posts.forEach(function (post) {
      post.rssDescription = html2text.fromString(post.preview);
    });

    res.render( 'rss', { posts: posts });
  });  
});

function renderMarkdown(string, cb) {
  var data = markdown.parse(string);
  var snippets = [];
  
  function recurse(entry) {
    if (entry[0] == 'pygmentize') {
      var lang = entry[1];
      var contents = entry[2];
      snippets.push(function(cb) {
        highlight(contents, lang, 'html', function(data) {
          entry[0] = 'raw';
          entry.pop();
          entry[1] = data;
          cb();
        });
      });
    }
    for (var child in entry) {
      child = entry[child];
      if (typeof child == 'object') {
        recurse(child);
      }
    }
  }
  
  recurse(data);
  async.parallel(snippets, function() {
    var rendered = markdown.toHTML(data);
    cb(null, rendered);
  });
}

poet.addTemplate({
  ext : [ 'markdown', 'md' ],
  fn : renderMarkdown
});

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(require('less-middleware')({ src: __dirname + '/public' }));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

function getProject(name, req, res) {
  async.parallel([
    function(cb) {
      request('https://api.github.com/repos/' + name, function(err, resp, body) {
        cb(null, JSON.parse(body));
      })
    },
    function(cb) {
      request('https://raw.github.com/' + name + '/master/README.md', function(err, resp, body) {
        renderMarkdown(body, cb);
      })
    }
    ],
    function(err, results) {
      if (err) {
        res.send(err);
        return;
      }
      
      var info = results[0];
      var md = results[1];
      res.render('github',
        {
          name: name,
          markdown: md,
          project: {
            owner: info.owner,
            title: info.name,
            description: info.description,
          }
      });
    });
}

app.get('/', routes.index);
app.get('/AndroidAsync', function(req, res) {
  getProject('koush/AndroidAsync', req, res);
})
app.get('/UrlImageViewHelper', function(req, res) {
  getProject('koush/UrlImageViewHelper', req, res);
})
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
