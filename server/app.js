var WebSocketServer = require('ws').Server;
var http = require('http');
var fs = require('fs');
var path = require('path');
var wsServerPort = 8080;
var wss = new WebSocketServer({port: wsServerPort});
var wsu = require('./wsu-node.js');

var pathDir = __dirname + '/upfile';

if(wss != null)
  {
	console.log((new Date()) + " Server is listening on port " + wsServerPort);
	wsu.instanceFolder(pathDir,function()
	  {
	  });
  }
  
wss.on('connection', function(ws)
  {
	console.log((new Date()) + ' Connection accepted.');
	
	ws.on('message', function(message,flags)
	  {
	    wsu.performLoad(pathDir,message,flags,function(retour)
		  {
		    ws.send(retour);
		  });
	  });
  });
  