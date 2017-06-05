			function openCategories() {
				document.getElementById("categories").style.width = "300px";
				document.getElementById("main").style.marginLeft = "300px";
			}

			function closeCategories() {
				document.getElementById("categories").style.width = "0";
				document.getElementById("main").style.marginLeft= "0";
			}
			function pdfDownload(){

				var map = $('.map'),
				btn = $("#png-dwd-btn"),
				cache_width = map.width(),
				//cache_height = map.height(),
				a4 = [595.28, 841.89];

				$('body').scrollTop(0);
				btn.button('loading');
				map.width((a4[0] * 1.33333) - 80).css('max-width', 'none');
				//map.height((a4[1] * 1.33333) - 80).css('max-height','none');
				console.log("preparing started");
				html2canvas(map, {
					imageTimeout: 2000,
					removeContainer: true,
					onrendered: function (canvas) {
						var imageData = canvas.toDataURL("image/png");
						doc = new jsPDF({
							unit: 'px',
							format: 'a4'
						});
						console.log("before completing");
						doc.addImage(imageData, 'JPEG', 10, 10);
						btn.button('reset');
						doc.save('vegas-map.pdf');
						map.width(cache_width);
						//map.height(cache_height);
						console.log("preparing completed");
					}
				}); 
			}
			function imgDownload() {
				var btn = $("#img-dwd-btn");
				console.log("preparing started");
				btn.button('loading');
				 // Long waiting operation here
				html2canvas($(".map"), {
					onrendered: function (canvas) {
						var imageData = canvas.toDataURL("image/png");
						var newData = imageData.replace(/^data:image\/png/, "data:application/octet-stream");
						console.log("before completing");
						btn.attr("download", "vegas-map.png").attr("href", newData);
						//$("image-download").attr("download","vegas-map.png").attr("href",newData);
						var downloadlink = document.createElement('a');
						downloadlink.setAttribute('download','vegas-map.png');
						downloadlink.setAttribute("href",newData);
						downloadlink.click();
						btn.button('reset');
						console.log("preparing completed");
					}
				});	
			}