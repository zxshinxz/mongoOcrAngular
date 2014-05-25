/**
* Group.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
	  groupId: {
		  unique: true,
		  required: true,
		  type: 'INTEGER'
	  },
	  groupName: {
		  required:true,
		  type: 'STRING'
	  },
	  files: {
		  collection: 'file'
	  }
  }
  
};

