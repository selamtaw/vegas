'use strict';

angular.module('vegas-admin',['vegas.adminController','vegas.service','ui.router','ngResource'])
	.config(function($stateProvider){
		$stateProvider
			.state('login',{
		   		url: '/',
		   		templateUrl: 'views/login.html'		   		
            })
            .state('admin',{
		   		url: '/admin',
		   		templateUrl: 'views/admin.html'		  	   		
            })
            .state('operator',{
	   			url: '/operator',
	   			views: {
	   				'': {templateUrl: 'views/operators.html'},
	   				'op-view@operator':{templateUrl: 'views/messages.html'}
	   			}
				
            })   
            .state('operator.messages',{
            	url: '/messages',
            	views: {
            		'op-view@operator':{templateUrl: 'views/messages.html'}
            	}
            }) 
            .state('operator.manage',{
            	url: '/manage_ved',
            	views: {
            		'op-view@operator':{templateUrl: 'views/manage_ved.html'}
            	}
            })                              
            .state('otherwise',{
			   	url: '/'
            })
        ;
	})
;