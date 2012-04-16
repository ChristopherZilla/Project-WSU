var WebSocketServer = require('ws').Server;
var http = require('http');
var fs = require('fs');
var path = require('path');


var source;
var name;
var size;
var type;
var date;

var length = 1024 * 1024; // 1MB chunk sizes.
var debut = 0;
var fin = length;
var number = 0;
var numberCompar = 0;
var retour;
var indice =2;
	
	
var wsu = exports;

wsu.instanceFolder = function(temporyFolder, callback)
  {
    instanceFolderFor(temporyFolder, callback);
  }

wsu.performLoad = function(temporyFolder, message, flags, callback)
  {
    performLoadFor(temporyFolder, message, flags, callback);
  
  }
	
function instanceFolderFor(temporyFolder,callback)
  {
	path.exists(temporyFolder,function(exists)
	  {
		if((!exists))
		  {
			fs.mkdir(temporyFolder,function(error)
			  {
				if(error)
				  {
					throw error;
				  }
				console.log('File will be send there: ', temporyFolder);
			  });
		  }
	  });
	 callback();
  }

function performLoadFor(temporyFolder,message, flags, callback)
  {
	if((!flags.binary))
	  {
		if(typeof JSON != 'undefined')
		  {
			var json;
			try 
			  {
				json = JSON.parse(message);
				console.log('It\'s a JSON');
				if (json.source == 'info')
				  { 
					source = json.source;
					name= json.filename;
					size= json.contentlength;
					type= json.type;
					date = json.lastmodifieddate;
					
					path.exists(temporyFolder+"/"+name,function(exists)
					  {
						if((exists))
						  {
							
							var parts = name.split('.');
							parts[0] = parts[0].concat('-'+indice);
							var tmpname = '';
							for(var i = 1;i<parts.length;i++)
							  {
							    parts[0] = parts[0].concat('.'+parts[i]);
							  }
							
							name = parts[0];
							indice++;
							console.log('File will be named: ', name );
						  }
					  });
					console.log('source: '+source+' ;name: '+name+' ;size: '+size+' ;type: '+type+' ;date:'+date+'');
				  }
				else if(json.source == 'number')
				  {
					source = json.source;
					number = json.numero;
					debut = json.begin;
					console.log('source: '+source+' ;number: '+number+' ;debut: '+debut+'');
				  } 	  
			  }
			catch (e)
			  {
				console.log('This doesn\'t look like a valid JSON: ', message);
				switch(message)
				  {
					case 'end':
						console.log('File uploaded');
						fs.createWriteStream(temporyFolder+'/'+name,{flags:'a',encoding:'binary',mode:0666}).end();
						break;
					default:
						console.log('default');
						break;
				  } 
			  }
		  } 
		else
		  {
			console.log('Hmm..., I\'ve never seen JSON like this: ', json);
		  }
  
	  }
	else if(flags.binary == true || flags.binary === true)
	  {
		console.log('File about to be write: '+name+'');
		fs.createWriteStream(temporyFolder+'/'+name,{flags:'a',encoding:'binary',mode:0666}).write(message);	
	  }
  }

  