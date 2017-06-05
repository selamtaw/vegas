'use strict';

angular.module('vegas.service',[])
	.constant("baseUrl","http://localhost:3000/")
	.constant("VERSIS","http://localhost:3001/")
	.service('homeFactory',['$resource','baseUrl',function($resource,baseUrl){
		this.getFeedbacks = function(){
			return $resource(baseUrl + "feedbacks/:id",null,{'update':{'method':'PUT'}});
		};
		this.getEmails = function(){
			return $resource(baseUrl + "emails/:id");
		};
		this.getOperators = function(){
			return $resource(baseUrl + "operators/:id",null,{'update':{'method':'PUT'}});
		};
		this.getAdmin = function(){
			return $resource(baseUrl + "admin/:id",null,{'update':{'method':'PUT'}});
		};

	}])
	.service('updateFactory',['$resource','VERSIS',function($resource,VERSIS){

		this.getVitalEventsData = function(){
			return $resource(VERSIS + "VED/:id",null,{'update':{'method':'PUT'}})
		}
		
	}])
	.service('replyFactory',['$resource','baseUrl',function($resource,baseUrl){

		this.getReplys= function(){
			return $resource(baseUrl + "reply/:id",null,{'update':{'method':'PUT'}});
		};
	}])
;