
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

markdown.Markdown.dialects.Gruber.inline['`'] = function inlineCode( text ) {
  // Inline code block. as many backticks as you like to start it
  // Always skip over the opening ticks.
  var m = text.match( /(`+)(\w*?[\r\n])(([\s\S]*?)\1)/ );
  if ( m && m[3] ) {
    var contents = m[4];
    var lang = m[2].trim();
    if (lang.length)
      contents = hljs.highlight(lang, contents).value;
    else
      contents = hljs.highlightAuto(contents).value;
    return [ m[1].length + m[2].length + m[3].length, [ "raw", "<pre class='highlight'>" + contents + "</pre>" ] ];
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

poet.addTemplate({
  ext : [ 'markdown', 'md' ],
  fn : function ( string ) {
    return markdown.toHTML( string );
  }
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

app.get('/AndroidAsync*', function(req, res) {
  if (0 == req.params[0].length) {
    res.redirect('/AndroidAsync/');
    return;
  }
  var dest = 'http://gh-pages.clockworkmod.com/AndroidAsync' + req.params[0];
  request(dest).pipe(res);
});

app.get('/UrlImageViewHelper*', function(req, res) {
  if (0 == req.params[0].length) {
    res.redirect('/UrlImageViewHelper/');
    return;
  }
  var dest = 'http://gh-pages.clockworkmod.com/UrlImageViewHelper' + req.params[0];
  request(dest).pipe(res);
});

app.get('/', routes.index);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
