'use strict';

angular.module('vegas-user',['vegas.userController','vegas.service','ui.router','ngResource','720kb.socialshare','angular-clipboard'])
	.config(function($stateProvider){
		$stateProvider
            .state('home',{
			   	url: '/',
				templateUrl: 'views/home.html'	 ,
            })

            .state('report',{
			   	url: '/report',
				templateUrl: 'views/report.html'	   		
            })
            .state('help',{
			   	url: '/help',
				templateUrl: 'views/help.html'
			   				   			   		
            }) 
            .state('aboutus',{
			   	url: '/aboutus',
				templateUrl: 'views/aboutus.html'		   		
            }) 
            .state('termsandconds',{
			   	url: '/termsandconditions',
			   	templateUrl: 'views/termsandconds.html'		   	   		
            })                       
            .state('otherwise',{
			   	url: '/'
            })
        ;
	})
;