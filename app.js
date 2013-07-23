
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path');

var app = express();
var poet = require('poet')(app);
var markdown = require( "markdown" ).markdown;
var request = require('request');
var html2text = require( 'html-to-text');
var async = require('async');
var url = require('url');
var querystring = require('querystring');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;

if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function (str){
    return this.indexOf(str) == 0;
  };
}
if (typeof String.prototype.endsWith != 'function') {
  String.prototype.endsWith = function (str){
    return this.slice(-str.length) == str;
  };
}

markdown.Markdown.dialects.Gruber.inline['`'] = function inlineCode( text ) {
  // Inline code block. as many backticks as you like to start it
  // Always skip over the opening ticks.
  var m = text.match( /(`+)(\w*?[\r\n])(([\s\S]*?)\1)/ );
  if ( m && m[3] ) {
    var lang = m[2].trim();
    return [ m[1].length + m[2].length + m[3].length, [ "pygmentize", lang, m[4] ] ];
  }
  else {
    // TODO: No matching end code found - warn!
    return [ 1, "`" ];
  }
};

pygmentsExecute = function(target, lang, callback) {
  var pyg = exec(path.join(__dirname, 'pygments', 'main.py') + ' ' + lang, function(err, stdout, stderr) {
    callback(stdout);
  });

  pyg.stdin.write(target);
  pyg.stdin.end();
};


function renderMarkdown(string, cb) {
  var data = markdown.parse(string);
  // console.log(data);
  var snippets = [];
  
  function recurse(entry) {
    if (entry[0] == 'pygmentize') {
      var lang = entry[1];
      var contents = entry[2];
      snippets.push(function(cb) {
        pygmentsExecute(contents, lang, function(data) {
          entry[0] = 'raw';
          entry.pop();
          entry[1] = data;
          cb();
        }, {
          'F': "highlight:names='err'"
        });
      });
    }
    else if (entry[0] == 'img' && entry.length == 2) {
      var img = entry[1];
      if (img.href.startsWith('http://www.youtube.com')) {
        entry[0] = 'center';
        var q = querystring.parse(url.parse(img.href).query);
        entry.pop();
        var youtube = {};
        youtube.width = '420';
        youtube.height = '315';
        youtube.src = 'http://www.youtube.com/embed/' + q.v;
        youtube.frameborder= '0';
        youtube.allowfullscreen = '';
        var center = ['iframe', youtube];
        entry.push(center);
      }
      else {
        if (!img.href.startsWith('http')) {
          img.href = '/post-content/' + img.href;
        }
        entry[0] = 'center';
        entry[1] = ['img', img];
        return;
      }
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

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(function(req, res, next) {
    if ('www.koush.com' == req.headers.host) {
      res.redirect('http://koush.com' + req.path);
      return;
    }
    next();
  });
  app.use(function(req, res, next) {
    if (req.path.startsWith('/post')
        || req.path.startsWith('/stylesheets')
        || req.path.startsWith('/bootstrap')
        || req.path.startsWith('/images')
        || req.path.startsWith('/github')
        || req.path.startsWith('/javascripts')) {
      res.header('Cache-Control', 'max-age=300');
    }
    next();
  });
  
  app.use(function(req, res, next) {
    console.log('heello');
    if (req.is('text/*')) {
      req.text = '';
      req.setEncoding('utf8');
      req.on('data', function(chunk){ req.text += chunk });
      req.on('end', next);
    } else {
      next();
    }
  });
  
  app.use(express.favicon(path.join(process.cwd(), 'public/favicon.ico')));
  app.use(express.logger('dev'));
  // app.use(require('less-middleware')({ src: __dirname + '/public' }));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public'),  { maxAge: 300 }));
});

app.get('/post-content/*', function(req, res) {
  res.header('Cache-Control', 'max-age=300');
  var f = req.params[0];
  f = path.join(__dirname, '_posts', f);
  res.sendfile(f);
});

app.configure('development', function(){
  app.use(express.errorHandler());
});


poet
.createPostRoute()
.createPageRoute()
.createTagRoute()
.createCategoryRoute()
.addTemplate({
  ext : [ 'markdown', 'md' ],
  fn : renderMarkdown
})
.set({
  postsPerPage: 3
})
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
  
  
  app.get('/', function(req, res) {
    var posts = core.getPosts(0, 3);
    res.render('index', { posts: posts });
  });
  
  function getProject(name, req, res) {
    res.header('Cache-Control', 'max-age=300');
    async.parallel([
      function(cb) {
        request({
          headers: {
            'User-Agent': 'node.js'
          },
          url: 'https://api.github.com/repos/' + name
        }, function(err, resp, body) {
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

  app.get('/AndroidAsync', function(req, res) {
    getProject('koush/AndroidAsync', req, res);
  })
  app.get('/ion', function(req, res) {
    getProject('koush/ion', req, res);
  })
  app.get('/UrlImageViewHelper', function(req, res) {
    getProject('koush/UrlImageViewHelper', req, res);
  })

  var server = http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
  });

  require('./tests').route(server, app);
});

