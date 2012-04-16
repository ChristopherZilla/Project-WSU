/**
* https://github.com/ChristopherZilla/Project-WSU
* Christopher Daijardin c.daijardin@hotmail.fr
*/


var startTime = 0;
var start = 0;
var end = 0;
var diff = 0;
var timerID = 0;
var number = 0;
var source='';
	
var BYTES_PER_CHUNK = 1024 * 1024; // 1MB chunk sizes.
var debut = 0;
var fin = BYTES_PER_CHUNK;
	
window.WebSocket = window.WebSocket || window.MozWebSocket;
// if browser doesn't support WebSocket, just show some notification and exit
if (!window.WebSocket)
  {
    alert("Sorry, but your browser doesn\'t support WebSockets");
  } 
  
var connection = new WebSocket("ws://127.0.0.1:8080");



connection.onopen = function () 
  {
    console.log("WebSocket client connected");
	alert('open');
	prepare();
  };
  
connection.onerror = function (error)
  {
    console.log("Connection Error: " + error.toString());
  };
  
connection.onmessage = function (message)
  {
    try 
	  {
        var json = JSON.parse(message.data);
		if (json.source == "number")
		  { // first response from the server with user's color
			source = json.source;
			number = json.numero;	
			debut = BYTES_PER_CHUNK * number;
			fin = debut + BYTES_PER_CHUNK;
		  } 
			
      }
	catch (e)
	  {
        console.log("This doesn\'t look like a valid JSON: ", message.data);
        return;
      }
			
  };
  

function prepare()
  {

	var dropZone = document.getElementById("drop_zone");
	dropZone.addEventListener('dragover', handleDragOver, false);
	dropZone.addEventListener('drop', firstSlice, false);
	
		
	var dropBtn = document.getElementById("drop_btn");
	dropBtn.addEventListener('click',firstSlice, false);
  }

function handleDragOver(evt)
  {
	evt.preventDefault();
	evt.dataTransfer.dropEffect = 'copy'; 
  }


function firstSlice(evt)
  {
	evt.preventDefault();
	var files;
	var file;
	var fname;
	var fsize;
	var ftype;
	var lmd;
	var i = 0;

	if(evt.type == "drop")
	  {
	    files = evt.dataTransfer.files;
	  }
	else
	  {
		files = document.getElementById("file-wsu").files; // Retrieve a list of file.
	  }
			
	for(i=0;i<files.length;i++)
	  {
		file = files[i]; // Retrieve the file name.
		fname = files[i].name || files[i].fileName; // Retrieve the file name.
		fsize =  files[i].size; // Retrieve the file size.
		ftype = files[i].type; // Retrieve the file type.
		lmd = files[i].lastModifiedDate;
			
		var message = 
		  {
			source: "info",
			filename: fname,
			contentlength: fsize,
			type: ftype,
			lastmodifieddate: lmd
		  };
		
		connection.send(JSON.stringify(message)); 
		upload(evt,i);
	  }
	prepare();
  }

function errorHandler(evt)
  {
	switch(evt.target.error.code)
	  {
		case evt.target.error.NOT_FOUND_ERR:
		  alert("File Not Found!");
		  console.log("error code: "+evt.target.error.code);
		  break;
		
		case evt.target.error.NOT_READABLE_ERR:
		  alert("File is not readable");
		  console.log("error code: "+evt.target.error.code);
		  break;
		
		case evt.target.error.ABORT_ERR:
		  console.log("error code: "+evt.target.error.code);
		  break;
		
		default:
		  alert("An error occurred reading this file.");
		  console.log("error code: "+evt.target.error.code);
	  };
  }

function progressNote(evt)
  {
	var percentUploaded=0;
	if(evt.lengthComputable)
	  {
		var percentUploaded = Math.round((evt.loaded / evt.total) * 100);
		if(percentUploaded <=100)
		  {
			if((document.getElementById("percent-wsu")) && (document.getElementById("progres-wsu")))
			  {
				document.getElementById("percent-wsu").innerHTML = percentUploaded+" %";
				document.getElementById("progres-wsu").value = percentUploaded;
			  }  
		  }
	  }
  }

function chrono()
  {
	end = new Date();
	diff = end - start;
	diff = new Date(diff);
	var msec = diff.getMilliseconds();
	var sec = diff.getSeconds();
	var min = diff.getMinutes();
	var hr = diff.getHours()-1;
	
	if (min < 10)
	  {
		min = "0" + min;
	  }
	  
	if (sec < 10)
	  {
		sec = "0" + sec;
	  }
	  
	if(msec < 10)
	  {
		msec = "00" +msec;
	  }
	else if(msec < 100)
	  {
		msec = "0" +msec;
	  }
	
	if((document.getElementById("chronotime-wsu")))
	  {
		document.getElementById("chronotime-wsu").innerHTML = hr + ":" + min + ":" + sec + ":" + msec;
	  }
	  
	timerID = setTimeout("chrono()", 10);
  }


function upload(evt,i)
  {
	evt.preventDefault();
	var files;
	var file;
	var blob = null;
	var reader;
	var chunk;
	var size;
	
	
	if(evt.type == "drop")
	  {
		files = evt.dataTransfer.files;
	  }
	else
	  {
		files = document.getElementById("file-wsu").files; // Retrieve a list of file.
	  }
	
	file = files[i];
	size = file.size;
	
	reader = new FileReader();// Object to read the file.
	
	reader.onerror = errorHandler;
	
	reader.onprogress = progressNote;
	
	reader.onabort = function(e)
	  {
		alert("File read cancelled");	
		console.log("Error: "+e.toString()+" error code: "+evt.target.error.code);
      };
	  
	reader.onloadstart = function(e)
	  {
		start = new Date();
		chrono();	
	  };
	
	reader.onload = function(e)
	  {
		if (e.target.readyState == FileReader.DONE){
		  start = new Date();
		  chrono();
		  var content = e.target.result; 
			
		  if(size > BYTES_PER_CHUNK)
		    {
			
		      while(debut<size)
			    {
			      chunk = content.slice(debut,fin);
			
				  var compte =
				    {
					  source: "number",
					  numero: number,
					  begin: debut
				    }; 
			
				  connection.send(JSON.stringify(compte)); 
				  connection.send(chunk);
				//  connection.send(content); // A utiliser quand le fichier est déjà découpé en entrée
				
				
				number = number + 1;
				debut = fin;
				fin = debut + BYTES_PER_CHUNK;
			  }
		  }
		else
		  { 
			connection.send(content);
		  }
		if(i<1)
		  {
			document.getElementById("drop_zone").innerHTML= i+1+" file uploaded this time";
			clearTimeout(timerID);
		  }
		else
		  {
			document.getElementById("drop_zone").innerHTML= i+1+" files uploaded this time";
			clearTimeout(timerID);
		  }
		}
	  };
				
	// action à effectuer quand le chargement est fini. Action at the end of the loading.
	reader.onloadend= function(e)
	  {
		connection.send("end");
		clearTimeout(timerID);
	  };
	
/*	if(size > BYTES_PER_CHUNK)
	  {
	    while(debut<size)
	      {
	        if (file.webkitSlice)
		      {
			    blob = file.webkitSlice(debut, fin);
		      }
		     if (file.mozSlice)
		      {
			    blob = file.mozSlice(debut, fin);
		      }
	       
			//alert("blob"+blob); //Fait fonctionner le découpage du fichier en entrée du readAsArrayBuffer
			number = number + 1;
		    debut = fin;
		    fin = debut + BYTES_PER_CHUNK;
			
		    reader.readAsArrayBuffer(blob); // Reader read the blob.
			
	      }
	  }
	else
	  { */
	      reader.readAsArrayBuffer(file); // Reader read the file.
	//  }
  }