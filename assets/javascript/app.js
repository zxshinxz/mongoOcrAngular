'user strict'

/**
 * 
 */

var mongoTest = angular.module('testApp', [ 'ngCookies', 'ngResource',
		'ngSanitize', 'ngRoute','angularFileUpload','ui.bootstrap' ]);

mongoTest.config(function($routeProvider) {
	$routeProvider.when('/', {
		templateUrl : 'templates/main.html',
		controller : 'MainCtrl'
	}).otherwise({
		redirectTo : '/'
	});
});




mongoTest.controller('MainCtrl',function($scope, FileManager, $fileUploader, $window) {
	
	
	$scope.loadFiles = function(){
		FileManager.getFiles().then(function(data){
			$scope.files = data;
		});
	};
	
	$scope.findFiles = function(word){
		FileManager.getFiles(word).then(function(data){
			$scope.files = data;
		});
	};
	
	$scope.viewfile = function(){
		$window.open('/file/find?fileid=' + this.file._id);
	};
	
	$scope.removefile = function(){
		FileManager.removefile(this.file._id).then(function(data){
			FileManager.getFiles($scope.searchword).then(function(data){
				$scope.files = data;
			});
		});
	};
	
	$scope.testing = function(){
		var terstin ='asdf';
	};
	
	 // create a uploader with options
    var uploader = $scope.uploader = $fileUploader.create({
        scope: $scope,                          // to automatically update the html. Default: $rootScope
        alias: 'userPhoto',
        url: 'file/upload',
        formData: [
                   { groupId: 101 },
                   { reviewYear: 2014 },
                   { uploadedBy: '67ansh' },
                   { uploadedTs: '2014/05/22' },
                   { DocumentType: 'GroupStructure' }
        ],
        filters: [
            function (item) {                    // first user filter
                console.info('filter1');
                return true;
            }
        ]
    });


    // FAQ #1
    var item = {
        file: {
            name: 'initialisation',
            size: 1e6
        },
        progress: 100,
        isUploaded: true,
        isSuccess: true
    };
    item.remove = function() {
        uploader.removeFromQueue(this);
    };
//    uploader.queue.push(item);
//    uploader.progress = 100;


    // ADDING FILTERS

    uploader.filters.push(function (item) { // second user filter
        console.info('filter2');
        return true;
    });

    // REGISTER HANDLERS

    uploader.bind('afteraddingfile', function (event, item) {
        console.info('After adding a file', item);
    });

    uploader.bind('whenaddingfilefailed', function (event, item) {
        console.info('When adding a file failed', item);
    });

    uploader.bind('afteraddingall', function (event, items) {
        console.info('After adding all files', items);
    });

    uploader.bind('beforeupload', function (event, item) {
        console.info('Before upload', item);
    });

    uploader.bind('progress', function (event, item, progress) {
        console.info('Progress: ' + progress, item);
    });

    uploader.bind('success', function (event, xhr, item, response) {
        console.info('Success', xhr, item, response);
    });

    uploader.bind('cancel', function (event, xhr, item) {
        console.info('Cancel', xhr, item);
    });

    uploader.bind('error', function (event, xhr, item, response) {
        console.info('Error', xhr, item, response);
    });

    uploader.bind('complete', function (event, xhr, item, response) {
        console.info('Complete', xhr, item, response);
    });

    uploader.bind('progressall', function (event, progress) {
        console.info('Total progress: ' + progress);
    });

    uploader.bind('completeall', function (event, items) {
        console.info('Complete all', items);
    });
});


mongoTest.service('FileManager', function($q, $http) {

	var _createFile = function(name, content) {
		var deferred = $q.defer();
		
		$http({
			url: 'file/create',
			method: 'POST',
			data: { 'fileName': name, 'content': content },
			headers: {'Content-Type': 'application/json'}
		})
		.success(function(data, status, headers, config){
			deferred.resolve(data);
		})
		.error(function(data, status, headers, config){
			alert('could not able to upload file.')
			deferred.reject();
		});
		
		return deferred.promise;
		
	};
	
	var _getFiles = function(word) {
		
		var deferred = $q.defer();
		
		if(word){
			$http({url:'file/findall', params: {search: word}, method: 'GET'})
			.success(function(data, status, headers, config){
				deferred.resolve(data);
			})
			.error(function(data, status, headers, config){
				alert('could not able to upload file.')
				deferred.reject();
			});
		}else{
			$http({url:'file/findall', method: 'GET'})
			.success(function(data, status, headers, config){
				deferred.resolve(data);
			})
			.error(function(data, status, headers, config){
				alert('could not able to  get files.')
				deferred.reject();
			});
		}
		
		return deferred.promise;
		
	};
	
	var _removefile= function(id){
		
		var deferred = $q.defer();
		
		$http({url:'file/remove', params: {fileid: id}, method: 'POST'})
		.success(function(data, status, headers, config){
			deferred.resolve(data);
		})
		.error(function(data, status, headers, config){
			alert('could not able to  remove file.')
			deferred.reject();
		});
		
		return deferred.promise;
	};

	return {
		createFile : _createFile,
		getFiles: _getFiles,
		removefile: _removefile
	};
});

//mongoTest.directive('dragDrop',function(){
//	
//	return{
//		restrict: 'A',
//		scope: {
//			files: '='
//		}
//		link: function(scope, element, attrs){
//			
//			scope.files = [];
//			initDom();
//			
//			var tests = {
//					filereader: typeof FileReader != 'undefined',
//					dnd: 'draggable' in document.createElement('span'),
////					formdata: !!window.FormData,
//					progress: 'upload' in new XMLHttpRequest
//			}, 
//			acceptedTypes = {
//					'image/png': true,
//					'image/jpeg': true,
//					'image/gif': true,
//			}, 
//			support = {
//					filereader: $('#dnd-filereader'),
////					formdata: $('#dnd-formdata'),
//					progress: $('#dnd-progress')
//			},
//			progress = $('#dnd-uploadprogress'),
//			fileupload = $('#dnd-upload'),
//			holder = document.getElementById('dnd-filesHolder')
//			
////			'filereader formdata progress'.split(' ').forEach(function(api){
//			'filereader progress'.split(' ').forEach(function(api){
//				if(tests[api] === false){
//					support[api].show();
//				} else {
//					support[api].hide();
//				}
//			});
//			
//			
//
//			function previewFile(file) {
//				if (tests.filereader === true
//						&& acceptedTypes[file.type] === true) {
//					var reader = new FileReader();
//					reader.onload = function(event) {
//						var image = new Image();
//						image.src = event.target.result;
//						image.width = 250;
//						holder.appendChild(image);
//					};
//
//					reader.readAsDataURL(file);
//				} else {
//					holder.innerHTML += '<p>Uploaded ' + file.name + ' '
//							+ (file.size ? (file.size / 1024 | 0) + 'K' : '');
//					console.log(file);
//				}
//			}
//			
//			function readFiles(files){
//				for(var i = 0; i < files.length; i++){
//					previewFile(files[i]);
//					scope.files.put(files[i]);
//				}
//				
//			}
//			
//			if(tests.dnd){
//				
//				holder.ondragover = function() {
//					this.className = 'hover';
//					return false;
//				};
//				
//				holder.ondragleave = function() {
//					this.className = '';
//					return false;
//				};
//				
//				holder.ondragend = function() {
//					this.className = '';
//					return false;
//				};
//				
//				holder.ondrop = function(e){
//					this.className = '';
//					e.preventDefault();
//					readFiles(e.dataTransfer.files);
//				};
//				
//			} else {
//				fileupload.show();
//				fileupload.querySelector('input').onChange = function(){
//					readFiles(this.files);
//				}
//			}
//			
//			function initDom(){
//				
//				element.append('<div id="dnd-filesHolder"></div>');
//				element.append('<p id="dnd-upload"><label>Drag & drop not supported' +
//						', but you can still upload via this input field:<br/><input type="file"/></label> </p>');
//				element.append('<p id="dnd-filereader">File API & FileReader API not supported</p>');
////				element.append('<p id="dnd-formdata">XHR2\'s FormData is not supported</p>');
//				element.append('<p id="dnd-progress">XHR2\'s upload progress isn\'t supported</p>');
//				element.append('<p>Upload progress: <progress id="uploadprogress" min="0" max="100" value="0">0</progress></p>');
//			}
//			
//		}
//	};
//});
