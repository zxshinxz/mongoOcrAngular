/**
 * FileController
 *
 * @description :: Server-side logic for managing files
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

function getConnectionString(){
	
	var identity = File.adapterDictionary.registerConnection;
	 var config = File.connections[identity].config;
	
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

function getMongoDb(callback){
	if(dbPool == null){
		mongoDb.connect(getConnectionString(), function(err, db) {
	 		 dbPool = db
	 		callback(err, dbPool);
		});
	}else	
		callback(null, dbPool);
}

function getContentOfPDF(pdf, savedFile){
	var processor = pdf_extract(pdf.path, {type: 'ocr', split:false}, function(err) {
	  if (err) {
	    return callback(err);
	  }
	});
	
	processor.on('complete', function(data) {
	  inspect(data.text_pages, 'extracted text pages');
		getMongoDb(function(err, db){
	 		if(err) return console.dir(err);
 		  	
 		  	console.log("ocr complete: " + savedFile.filename);
 		  	// do something with `file`
 		  	db.collection("my_collection.files").update({
				_id : savedFile._id
			}, {
				$set : {
					content : data.text_pages[0]
				}
			}, function(err, result){
				 if(err) return console.dir(err);
				 else 
					 console.log("updated file with content metadata");
			});
 		  	
 			
		});
		
	});
	
	processor.on('log', function(log) {
		  console.dir(log);
	});
	
	processor.on('error', function(err) {
//	  inspect(err, 'error while extracting pages');
	  console.dir(err);
	});
}

var inspect = require('eyes').inspector({maxLength:20000});
var fs = require('fs');
var Grid = require('gridfs-stream');
var pdf_extract = require('pdf-extract');
var mongo = require('mongodb');
var mongoDb = mongo.Db;
var ObjectID = mongo.ObjectID;
var dbPool = null;

module.exports = {
		
		 upload: function (req, res) {
			 	
			 	// can get param from body.
			 	var groupId = req.body.groupId;
			 	var reviewYear = req.body.reviewYear;
			 	var uploadedBy = req.body.uploadedBy;
			 	var uploadedTs = req.body.uploadedTs;
			 	var DocumentType = req.body.DocumentType;
		 		var file = req.files.userPhoto;
			 	
		 		getMongoDb(function(err, db){
			 		if(err) return console.dir(err);
			 		var gfs = Grid(db, mongo);
			 		var writestream = gfs.createWriteStream({
						filename : file.originalname,
						mode : 'w',
						content_type: file.mimetype,
						chunkSize : 1024,
						root : 'my_collection',
						metadata : {
							groupId : groupId,
							reviewYear : reviewYear,
							uploadedBy : uploadedBy,
							uploadedTs : uploadedTs,
							DocumentType : DocumentType
						}
					});
			 		
			 		fs.createReadStream(file.path).pipe(writestream);
			 		
			 		writestream.on('close', function (savedFile) {
			 			
			 			// do something with `file`
			 			console.log("file writing done: " + savedFile.filename);
			 			res.send(); // 204
			 			 
			 			if(savedFile.contentType === 'application/pdf')
				 			getContentOfPDF(file, savedFile);
			 		});
		 		});
		  },

		  
//		  find all files
		  findAll: function(req, res){
			  var searchWord = req.param("search");
		 		  if(searchWord == undefined || searchWord == null)
		 			 	getMongoDb(function(err, db){
		 			 		if(err) return console.dir(err);
			 				db.collection('my_collection.files').find().toArray(function(err, items) {
				 		  		res.json(items);
				 			 });
			 		  	});
		 		  else
		 			  	getMongoDb(function(err, db){
		 			 		if(err) return console.dir(err);
			 				db.collection('my_collection.files').find({$text:{$search:searchWord}}).toArray(function(err, items) {
				 		  		res.json(items);
				 			 });
		 		  		});
		  },
		  
		  
// 			find specific files
		  find : function(req, res) {
			  	
			 	// can get param from body.
			 	var fileId = req.param('fileid');
			 	getMongoDb(function(err, db){
			 		if(err) return console.dir(err);
			 		  var gfs = Grid(db, mongo);
			 		  
			 		  var readstream = gfs.createReadStream({
			 			  _id: fileId,
			 			 root : 'my_collection'
			 		  });
			 		  
					  readstream.pipe(res);
					  readstream.on('end', function (file) {
			 			  // do something with `file`
			 			  console.log("file send done");
			 			  res.send(); // 204
					  });
					  
					 //error handling, e.g. file does not exist
					  readstream.on('error', function (err) {
					    console.log('An error occurred!', err);
					    throw err;
					  });
			  	});
	  },
	  
	  remove: function(req, res) {
		// can get param from body.
		 	var fileId = req.param('fileid');
		 	getMongoDb(function(err, db) {
				var gfs = Grid(db, mongo);
				gfs.remove({
					_id : fileId,
					root : 'my_collection'
				}, function(err) {
					if (err)
						return handleError(err);
					console.log('success');
					res.send(); // 204
				});
	
			});
	  },
			  
		/**
		 * Overrides for the settings in `config/controllers.js`
		 * (specific to GifController)
		 */
		  _config: {}
		
};

