'use strict';

angular.module('vegas.userController', [])
	// user page controllers
	.controller('ShareController', ['$scope', 'homeFactory', function ($scope, homeFactory) {
		let share = {
			link: "http://vegas.org.et/map",
			email: {
				from: "",
				to: "",
				message: ""
			},
			embed: {
				size: {
					width: 0,
					height: 0
				},
				code: ""
			}
		};
		// check how to get the width and height
		console.log("What is gonig on?");

		share.embed.size.width = 1080;
		share.embed.size.height = 720;
		share.embed.code = `<iframe  width="${share.embed.size.width}" height="${share.embed.size.height}" ` +
			`src="http://vegas.org.et/map" allowfullscreen="true" scrolling="no"></iframe>`;
		$scope.share = share;

		$scope.message = "";
		$scope.showAlert = false;


		$scope.supported = false;

		$scope.linkToCopy = $scope.share.link;
		$scope.embedCodeToCopy = $scope.share.embed.code;

		$scope.success = function () {
			console.log('Copied!');
		};

		$scope.fail = function (err) {
			console.error('Error!', err);
		};

		// This only saves the email to be sent to
		// From the server the email should be sent 
		$scope.shareThroughEmail = function () {
			$scope.showAlert = true;
			$scope.message = "sending...";
			console.log("Email is going to be sent get ready...");
			homeFactory.getEmails().save(
				$scope.share.email,

				function (response) {
					console.log("email is sent and returned successfully");
					$scope.message = "Email sent successfully";
					// reset the inputs
					$scope.share.email = {
						from: "",
						to: "",
						message: ""
					};
					// set the form to pristine
					$scope.shareEmailForm.$setPristine();
				},
				function (response) {
					console.log("sending email is failed SORRY!");
					$scope.message = "Error " + response.status + " " + response.statusText;
				}
			);
		};
	}])
	.controller('ExportController', ['$scope', function ($scope) {
		// handled by pure javascript in scripts.js	
	}])
	.controller('FeedbackController', ['$scope', 'homeFactory', function ($scope, homeFactory) {

		let feedback = {
			fullname: "",
			email: "",
			comment: "",
			seen: false
		};
		$scope.message = "";
		$scope.feedback = feedback;

		$scope.sendFeedback = function () {

			$scope.feedback.date = new Date().toISOString();
			$scope.feedback.seen = false;

			$scope.showAlert = true;
			$scope.message = "sending...";

			console.log("feedback is going to be sent get ready...");
			homeFactory.getFeedbacks().save(
				$scope.feedback,

				function (response) {
					$scope.message = "Your feedback is sent successfully";
					// reset the inputs
					$scope.feedback = {
						fullname: "",
						email: "",
						comment: ""
					};
					// set the form to pristine
					$scope.feedbackForm.$setPristine();
				},
				function (response) {
					console.log("sending feedback is failed SORRY!");
					$scope.message = "Error " + response.status + " " + response.statusText;
				}
			);
		};
	}])
	.controller('NavController', ['$scope', function ($scope) {

		$scope.active = 1;

		$scope.select = function (setActive) {
			$scope.active = setActive;
		}

		$scope.isSelected = function (check) {
			return ($scope.active === check);
		}
		$scope.pdfDownload = function (option) {
			if (option === 1) {
				var printable = $('#mapContainer');
				var name = "vegas-map";
			} else if (option === 2) {
				var printable = $('#reportBody');
				var name = "vegas-report";
			}
			var btn = $("#png-dwd-btn"),
				cache_width = printable.width(),
				//cache_height = map.height(),
				a4 = [595.28, 841.89];

			$('body').scrollTop(0);
			btn.button('loading');
			printable.width((a4[0] * 1.33333) - 80).css('max-width', 'none');
			//map.height((a4[1] * 1.33333) - 80).css('max-height','none');
			console.log("preparing started");
			html2canvas(printable, {
				imageTimeout: 2000,
				removeContainer: true,
				onrendered: function (canvas) {
					var imageData = canvas.toDataURL("image/png");
					var doc = new jsPDF({
						unit: 'px',
						format: 'a4'
					});
					console.log("before completing");
					doc.addImage(imageData, 'JPEG', 10, 10);
					btn.button('reset');
					doc.save(name + '.pdf');
					printable.width(cache_width);
					//map.height(cache_height);
					console.log("preparing completed");
				}
			});
		};
		$scope.imgDownload = function (option) {
			if (option === 1) {
				var printable = $('#mapContainer');
				var name = "vegas-map";
			} else if (option === 2) {
				var printable = $('#reportBody');
				var name = "vegas-report";
			}
			var btn = $("#img-dwd-btn");
			console.log("preparing started");
			btn.button('loading');
			// Long waiting operation here
			html2canvas(printable, {
				onrendered: function (canvas) {
					var imageData = canvas.toDataURL("image/png");
					var newData = imageData.replace(/^data:image\/png/, "data:application/octet-stream");
					console.log("before completing");
					// btn.attr("download", "vegas-map.png").attr("href", newData);
					// $("image-download").attr("download","vegas-map.png").attr("href",newData);
					var downloadlink = document.createElement('a');
					downloadlink.setAttribute('download', name + '.png');
					downloadlink.setAttribute("href", newData);
					downloadlink.click();
					btn.button('reset');
					console.log("preparing completed");
				}
			});
		};
	}]);