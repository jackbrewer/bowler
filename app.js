/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , app = express()
  , createLightSwitch = require('./light-switch/light-switch')
  , lightSwitch
  , jarre = require('./jarre')()
  ;

if (app.get('env') === 'development') {
  lightSwitch = createLightSwitch(require('./light-switch/mock-simple-gpio')());
} else {
  lightSwitch = createLightSwitch();
}

jarre.add(require('./light-show')(lightSwitch));

app.configure(function() {

  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));

});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', require('./routes/index'));

app.get('/light-show', function (req, res) {

  try {

    jarre.pickup('lightShow').start(jarre.drop);
    res.redirect('/');

  } catch (e) {
    res.send('Light show already running');
    res.end();
  }

});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port http://localhost:' + app.get('port'));
});