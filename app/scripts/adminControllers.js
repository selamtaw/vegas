'use strict';

angular.module('vegas.adminController',[])

	// operators page controllers
	.controller('opCtrl',['$scope','homeFactory','updateFactory',function($scope,homeFactory,updateFactory){
		$scope.message = "";
		$scope.p = 0;
		$scope.n = 10;
		$scope.visibleFeedbacks = [];
		$scope.load = function(){
			homeFactory.getFeedbacks().query(
				function(response){
					$scope.feedbacks = response;
					$scope.sorted = $scope.feedbacks.sort((a,b) => a.date < b.date);
					$scope.visibleFeedbacks = $scope.sorted.slice($scope.p,$scope.n);
					let newMsg = [];

					for (let i = $scope.feedbacks.length - 1; i >= 0; i--) {
						if($scope.feedbacks[i].seen === false) newMsg.push($scope.feedbacks[i]);			 
					}	
					$scope.newMC = newMsg.length;
					//console.log($scope.newMC);
				},
				function(response){
					$scope.message = "Error " + response.status + " " + response.statusText;
				}
			);
		};
		$scope.load();

		$scope.reply = {toEmail:"",fromEmail:"",comment:""};
		let replyFrom = JSON.parse(window.localStorage.getItem('user')) || {};
		$scope.reply.fromEmail = replyFrom.email;
		
		$scope.$on('updateComplete', function (event, args) {
			console.log("event from emit recieved");
			$scope.$broadcast('refresh',{});
		});
		$scope.loadVED = function(){
			updateFactory.getVitalEventsData().query(
				function(response){
					$scope.VED = response;
				},
				function(response){
					$scope.message = "Error " + response.status + " " + response.statusText;
				}
			);
		};

	}])
	.controller('MessagesController',['$scope','homeFactory','$timeout',function($scope,homeFactory,$timeout){

		$scope.navigate = function(direction){
			if(direction == 1){
				$scope.p +=10; 
				$scope.n +=10;
			}
			else if(direction == -1){
				$scope.p -=10;
				$scope.n -=10;
			}
			//$scope.feedbacks.sort((a,b) => a.date < b.date);
			$scope.visibleFeedbacks = $scope.sorted.slice($scope.p,$scope.n);
		};
		//$scope.load();
		$scope.markAsSeen = function(feedback){
			feedback.seen = true;
			homeFactory.getFeedbacks().update(
				{id:feedback.id},
				feedback,
				function(response){				
				},
				function(response){
				}
			);
			$scope.load();	
		};
		$scope.replyMessage = function(feedback){
			$scope.reply.toEmail = feedback.email;
		};
		$scope.refresh = function(){
			$scope.load();
		};
		let timer = function(){
			$scope.load();
			//console.log("called after 10sec");
			$timeout(timer,10000);
		}
		$timeout(timer,10000);
	}])
	.controller('ReplyController',['$scope','replyFactory',function($scope,replyFactory){

		$scope.showAlert = false;

		$scope.sendReply = function(){
			$scope.showAlert = true;
			replyFactory.getReplys().save(

				$scope.reply,
				function(response){
					$scope.message = "Message successfully sent.";
				},
				function(response){
					$scope.message = "Error " + response.status + " " + response.statusText;
				}
			);
		};
	}])
	.controller('OperatorsChangePasswordController',['$scope','homeFactory',function($scope,homeFactory){
		
		$scope.showAlert = false;
		$scope.message = "";
		$scope.oldPwdError = false;
		$scope.newPwd = "";
		
		let user = JSON.parse(window.localStorage.getItem('user')) || {};
		homeFactory.getOperators().get({id:user.id})
		.$promise.then(
			function(response){
				$scope.operator = response;
				$scope.oldPwdS = $scope.operator.password;
			},
			function(response){
				$scope.message = "Error " + response.status + " " + response.statusText;
			}
		);
		$scope.changePassword = function(){
			
			if($scope.oldpwd !== $scope.oldPwdS){
				$scope.oldPwdError = true;
				$scope.message = "Old password is not correct";
				return;
			}
			$scope.oldPwdError = false;
			$scope.newPwd = $scope.newpwd1;
			$scope.message = "working on it...";
			$scope.showAlert = true;	

			$scope.operator.password = $scope.newPwd;

			homeFactory.getOperators().update(
				{id:$scope.operator.id},
				$scope.operator,
				function(response){
					$scope.message = "Password changed successfully";	
					$scope.newPwd = {password: ""};
					$scope.changePasswordForm.$setPristine();				
				},
				function(response){
					$scope.message = "Error " + response.status + " " + response.statusText;
				}
			);	
		};	
	}])
	.controller('updateController',['$scope','$timeout','updateFactory',function($scope,$timeout,updateFactory){
		
		$scope.updateInterval = {type:"day",intv:1};
		var types = [
			{value:"hour", label:"Hour"}, 
			{value:"day",label:"Day"},
			{value:"week",label:"Week"},
			{value:"month",label:"Month"}
		];
		$scope.updateInterval.types = types;
		$scope.interval = 10000;
		const toMilliSec = 3600000;

		$scope.updateNow = function(){
			$scope.loadVED();
			console.log("update now is called and updating is done");
			//update db //check loadVED is completed first
		};
		$scope.setUpdateInterval = function(){
			console.log("set interval is called");
			console.log($scope.updateInterval.type);
			console.log($scope.updateInterval.intv);

			var interval;

			if($scope.updateInterval.type === ""){
				console.log("error");
				return;
			}

			if($scope.updateInterval.type === "hour"){
				interval = toMilliSec * $scope.updateInterval.intv;
			}
			else if($scope.updateInterval.type === "day"){
				interval = toMilliSec * 24 * $scope.updateInterval.intv;
			}
			else if($scope.updateInterval.type === "week"){
				interval = toMilliSec * 7 * 24 *$scope.updateInterval.intv;
			}
			else if($scope.updateInterval.type === "month"){
				interval = toMilliSec * 30 * 7 * 24 * $scope.updateInterval.intv;
			}
			$scope.interval = interval;
			console.log($scope.interval);

		};
		let timer = function(){
			$scope.loadVED();
			console.log("am updating every " + $scope.interval + " MilliSec");
			$timeout(timer,$scope.interval);
		}
		$timeout(timer,$scope.interval);
		$scope.loadVED();
		$scope.$on('refresh', function (event, args) {
			console.log("event from broadcast recieved");
			$scope.loadVED();
		});
	}])
	.controller('updateVEDManualController',['$scope','updateFactory',function($scope,updateFactory){
		$scope.newData = {
			name: "",
			kebeles: 0,
			population: 0,
			male: 0,
			female: 0,
			hospitals: 0,
			schools: 0,
		};

		$scope.save = function(){
			updateFactory.getVitalEventsData().save(
				$scope.newData,
				function(response){console.log(" success");console.log("emitting message");$scope.$emit('updateComplete', {});},
				function(response){console.log(" failed");}
			);
		};
	}])
	// admin page controllers
	.controller('OperatorsController',['$scope','homeFactory',function($scope,homeFactory){
		
		$scope.removeOperator = function(op){
			homeFactory.getOperators().delete({id:op.id});
			$scope.load();
		};
	}])
	.controller('AddOperatorsController',['$scope','homeFactory',function($scope,homeFactory){

		let operator = {fullname:"",email:"",task:"",lastlogin:"not yet logged in",lastlogout:"not yet logged in",password:""};
		$scope.operator = operator;
		$scope.message = "";
		$scope.showAlert = false;

		$scope.addOperator = function(){
			$scope.message = "working on it..."
			$scope.showAlert = true;
			$scope.operator.password = $scope.operator.fullname;
			homeFactory.getOperators().save(

				$scope.operator,
				function(response){
					$scope.message = "Operator successfully added.";
					$scope.operator = {fullname:"",email:"",task:"",lastlogin:null,lastlogout:null};
					$scope.addOperatorsForm.$setPristine();
				},
				function(response){
					$scope.message = "Error " + response.status + " " + response.statusText;
				}
			);
			$scope.load();
		};
	}])
	.controller('RemoveOperatorsController',['$scope','homeFactory', function($scope,homeFactory){

		// Disable the button if no operator is selected
		let removeList = [];
		$scope.message = "";
		$scope.disable = removeList.length === 0;

		$scope.load();

		$scope.removeOperators = function(){
			let operators = $scope.operators;

			for(let i in removeList){
				let id = 0;
				let index = operators.findIndex(o => removeList[i] === o.id);
				if(index !== -1 ) {
					let removedOp = operators.splice(index,1);
					homeFactory.getOperators().delete({id:removedOp[0].id});
				} 
			}
			$scope.disable = true;
			$scope.load();
			removeList = [];
		};
		$scope.removeList = function(id){
			
			let i = removeList.indexOf(id);
			i === -1 ? removeList.push(id) : removeList.splice(i,1);
			$scope.disable = removeList.length === 0;
		};
	}])
	.controller('AdminChangePasswordController',['$scope','homeFactory',function($scope,homeFactory){
		
		$scope.showAlert = false;
		$scope.message = "";
		$scope.oldPwdError = false;

		homeFactory.getAdmin().get({id:1})
		.$promise.then(
			function(response){
				$scope.admin = response;
			},
			function(response){
				$scope.message = "Error " + response.status + " " + response.statusText;
			}
		);
		$scope.changePassword = function(){
			
			if($scope.oldpwd !== $scope.admin.password){
				$scope.oldPwdError = true;
				$scope.message = "Old password is not correct";
				return;
			}
			$scope.oldPwdError = false;
			$scope.admin.password = $scope.newpwd1;
			$scope.message = "working on it...";
			$scope.showAlert = true;	

			homeFactory.getAdmin().update(
				{id:1},
				$scope.admin,
				function(response){
					$scope.message = "Password changed successfully";	
					$scope.newPwd = {password: ""};
					$scope.changePasswordForm.$setPristine();				
				},
				function(response){
					$scope.message = "Error " + response.status + " " + response.statusText;
				}
			);	
		};
	}])
	.controller('adminCtrl',['$scope','homeFactory',function($scope,homeFactory){
		$scope.message = "";

		$scope.load = function(){
			homeFactory.getOperators().query(

				function(response){
					$scope.operators = response;
				},
				function(response){
					$scope.message = "Error " + response.status + " " + response.statusText;
				}
			);
		};
		$scope.load();
	}])

	// common for both admin and operators
	.controller('LoginController',['$scope','homeFactory','$state',function($scope,homeFactory,$state){

		$scope.message = "";
		$scope.showAlert = false;
		console.log("What is gonig on?");
		homeFactory.getOperators().query(
			function(response){
				$scope.operators = response;
			},
			function(response){
			}
		);
		homeFactory.getAdmin().get({id:1})
		.$promise.then(
			function(response){
				$scope.admin = response;
			},
			function(response){
			}
		);
		$scope.setSession = function(user){
			window.localStorage['user'] = JSON.stringify(user);
		};
		$scope.login = function(){


			window.localStorage['user'] = JSON.stringify({});

			// if admin
			if($scope.admin.fullname === $scope.name && $scope.admin.password === $scope.password) {
				$scope.setSession($scope.admin);
				$state.go('admin');
				return;
			}
			// if operator
			let operator = $scope.operators.find(o => o.fullname === $scope.name);
			if(operator !== undefined && operator.password === $scope.password ) {
				operator.lastlogin = new Date().toISOString();
				homeFactory.getOperators().update(
					{id:operator.id},
					operator,
					function(response){},
					function(response){}
				);
				$scope.setSession(operator);
				$state.go('operator');
			}
			else {
				$scope.message = "Username or password is incorrect.Please try again";
				$scope.showAlert = true;
				return;
			}			
		};
	}])
	.controller('NavController',['$scope','homeFactory',function($scope,homeFactory){

		$scope.user = JSON.parse(window.localStorage.getItem('user')) || {};

		$scope.logout = function(){
			if($scope.user.fullname === "Admin") return;
			$scope.user.lastlogout = new Date().toISOString();
			homeFactory.getOperators().update(
				{id:$scope.user.id},
				$scope.user,
				function(response){},
				function(response){}
			);
		};
	}])

;
