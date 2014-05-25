/**
 * FileController
 *
 * @description :: Server-side logic for managing files
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */


var sid = require('shortid');
var fs = require('fs');
var mkdirp = require('mkdirp');
//var io = require('socket.io');
 
var UPLOAD_PATH = 'public/images';
 
// Setup id generator
sid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');
sid.seed(42);
 
function safeFilename(name) {
  name = name.replace(/ /g, '-');
  name = name.replace(/[^A-Za-z0-9-_\.]/g, '');
  name = name.replace(/\.+/g, '.');
  name = name.replace(/-+/g, '-');
  name = name.replace(/_+/g, '_');
  return name;
}
 
function fileMinusExt(fileName) {
  return fileName.split('.').slice(0, -1).join('.');
}
 
function fileExtension(fileName) {
  return fileName.split('.').slice(-1);
}
 

function getConnectionString(config){
	
	// Build A Mongo Connection String
	  var connectionString = 'mongodb://';

	  // If auth is used, append it to the connection string
	  if(config.user && config.password) {

	    // Ensure a database was set if auth in enabled
	    if(!config.database) {
	      throw new Error('The MongoDB Adapter requires a database config option if authentication is used.');
	    }

	    connectionString += config.user + ':' + config.password + '@';
	  }

	  // Append the host and port
	  connectionString += config.host + ':' + config.port + '/';

	  if(config.database) {
	    connectionString += config.database;
	  }

	  // Use config connection string if available
	  if(config.url) connectionString = config.url;

	  return connectionString;
}


// Where you would do your processing, etc
// Stubbed out for now
function processImage(id, name, path, cb) {
  console.log('Processing image');
 
  cb(null, {
    'result': 'success',
    'id': id,
    'name': name,
    'path': path
  });
}


var mongo = require('mongodb'),
Db = mongo.Db,
Grid = mongo.Grid,
ObjectID = require('mongodb').ObjectID;

module.exports = {
		
		
		
		 upload: function (req, res) {
		 
//		 	var identity = File.adapterDictionary.registerConnection;
//		 	var config = File.connections[identity].config;
//		 	var cstring  = getConnectionString(config);
//		 	
//		 	Db.connect(cstring, function(err, db) {
//	 		  if(err) return console.dir(err);
//
//	 		  var grid = new Grid(db);    
//	 		  var buffer = new Buffer("from beginning Hello world this is takapuna reporting");
//	 		  grid.put(buffer, {metadata:{category:'text'}, content_type: 'text'}, function(err, fileInfo) {
//	 		    if(!err) {
//	 		      console.log("Finished writing file to Mongo:  "  +fileInfo._id.toString());
//	 		    	
//	 		    }else{
//	 		    	console.log(err);
//	 		    }
//	 		    
//	 		  });
	 		  
	 		  
	 		  // getting file
//	 		  	grid.get('5381b9695ad1b1c02dc7f0d7', function(err, data) {
//	 		      console.log("Retrieved data: " + data.toString());
//	 		    });
//	 		});
		 	
		 	
		 	var file = req.files.userPhoto;
		 
		    var id = sid.generate();
		    var fileName = id + "." + fileExtension(safeFilename(file.name));
		    var dirPath = UPLOAD_PATH + '/' + id;
		    var filePath = dirPath + '/' + fileName;
		 
		    try {
		      mkdirp.sync(dirPath, 0755);
		    } catch (e) {
		      console.log(e);
		    }
		 
		    fs.readFile(file.path, function (err, data) {
		      if (err) {
		        res.json({'error': 'could not read file'});
		      } else {
		    	  
//		    	var buffer = new Buffer(data);
//		    	grid.put(buffer, {metadata:{category:'text'}, content_type: 'text'}, function(err, fileInfo) {
//		 		    if(!err) {
//		 		      console.log("Finished writing file to Mongo:  "  +fileInfo._id.toString());
//		 		    }else{
//		 		    	console.log(err);
//		 		    }
//		 		    
//		 		});
		    	  
		    	
// 				writing file
//		    	
		        fs.writeFile(filePath, data, function (err) {
		          if (err) {
		            res.json({'error': 'could not write file to storage'});
		          } else {
		            processImage(id, fileName, filePath, function (err, data) {
		              if (err) {
		                res.json(err);
		              } else {
		                res.sendfile(file);
		              }
		            });
		          }
		        });
		        
		        
		        
		      }
		    });
		  },
			  
			  
		/**
		 * Overrides for the settings in `config/controllers.js`
		 * (specific to GifController)
		 */
		_config: {}
		
		
};

