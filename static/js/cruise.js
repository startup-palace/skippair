// CRUISE DETAIL | Compute and display price
function computePrice(base_url) {
	var url = base_url + "?" + $("form.booking").serialize();
	$.get(url, function(data) {
		if (data.result == 'Successful') {
			$("#cruise_price_append").html((data.total_price || "") + (data.price == '' ? '' : "€"));
			$("#cruise_part_price").html(data.type == "shared"?data.per_person_price:data.total_price);
			$('#promo_value').html(data.reduction != 1?(data.per_person_price/data.reduction) + '€':'')
		} else {
			$("#cruise_price_append").html('');
			$("#cruise_part_price").html(data.type == "shared"?data.shared_min_price:data.private_min_price);
		}
		$("#cruise_total_duration").html(data.total_duration);
		$("#cruise_period_price_display_toggle").html(data.period_price_display_toggle);
	});
}

function Cruise_scrollTo(element) {
	var navbar_height = $(".navbar").height();
	console.log(element);
	$('html,body').animate({
		scrollTop: element.offset().top - navbar_height
	}, 'slow');
};
//Append CSRF Token to Ajax POST requests
$(function() {
	$.ajaxSetup({
		beforeSend: function(xhr, settings) {
			xhr.setRequestHeader("X-CSRFToken", Cookies.get("csrftoken"));
		}
	});
});

// CRUISE DETAIL | Toggle function for the booking model in responsive
function showBookingModal() {
	$("body").css({
		overflow: "hidden"
	});
	$(".right-column").css({
		visibility: "visible",
		overflow: "auto"
	});
};
function closeBookingModal() {
	$("body").css({
		overflow: "auto"
	});
	$(".right-column").css({
		visibility: "hidden",
		overflow: "hidden"
	});
};

// CRUISE DETAIL;HOME | Use in cruise detail and home ?
function getReview(url) {
	$.get(url, function(data) {
		$("#list_review_bloc").html(data);
	});
}

// Don't know what it does
$.fn.followTo = function($element, stick_function) {
	var $this = this,
		$window = $(window),
		mobile_screen = 992,
		nav_height = $("nav").height(),
		price_height = $(".price-info").outerHeight(),
		fixed_container = $this.closest(".container"),
		stop_pos = $element.offset().top - $this.height() - nav_height,
		start_pos = fixed_container.offset().top - nav_height - price_height;

	if ($window.width() > mobile_screen) {
		stick_function($this, start_pos, stop_pos, fixed_container, nav_height + price_height);

		$window.scroll(function(e) {
			stick_function($this, start_pos, stop_pos, fixed_container, nav_height + price_height);
		});
	}
};

function make_carousel($ctrl, $item) {
	if ($item.length > 1) {
		// Init
		$item.each(function() {
			$(this).addClass("item_number");
		});
		$item.first().addClass("show_item");

		$ctrl.click(function(e) {
			var visible = $item.filter(".show_item");
			var n = parseInt(visible.data("item"));
			if ($(e.target).hasClass("next-item")) {
				n = (n == $item.length) ? 1 : n + 1;
			} else if ($(e.target).hasClass("prev-item")) {
				n = (n == 1) ? $item.length : n - 1;
			}
			var next = $item.filter(function() {
				return $(this).data("item") == n;
			});

			visible.removeClass("show_item");
			next.addClass("show_item");
		});
	}
};

// Wish list function 
function getWishListCounter(){
  if ($.cookie('wish-list'))
    return $.cookie('wish-list').split(":").length;
  else
    return 0;
};

function updateWishListCounter(){
	$('#wish-counter').text('(' + getWishListCounter().toString() + ')');
	$('#wish-counter-bloc').animateCss('swing');
};

// function sendSMS(auth) {
// 	var data = {
// 		"from": "Skippair test",
// 		"to": "+33699483403",
// 		"text": "My first Infobip SMS"
// 	};

// 	$.ajax({
// 		type: "POST",
// 		url: "/sms/1/text/single",
// 		data: data,
// 		Host: "api.infobip.com",
// 		Authorization: auth,
// 		"Content-Type": "application/json",
// 		Accept: "application/json"
// 	});
// };

// ====================
// SPINNER FOR SKIPPAIR
// ====================
SkippairSpinner = (function() {
	var _self;
	SkippairSpinner = function(target) {
		this.target = target;
		_self = new Spinner({
			lines: 13,
			length: 25,
			width: 14,
			radius: 42,
			scale: 0.5,
			corners: 1,
			color: '#0cc',
			opacity: 0.25,
			rotate: 0,
			direction: 1,
			speed: 1,
			trail: 60,
			fps: 30,
			zIndex: 2e9,
			className: 'spinner',
			top: '20%',
			left: '33%',
			shadow: false,
			hwaccel: true,
			position: 'absolute'
		}).spin(target[0]);
	};

	SkippairSpinner.prototype.show = function() {
		this.target.css('display', 'inline')
	};

	SkippairSpinner.prototype.hide = function() {
		this.target.css('display', 'none')
	};

	return SkippairSpinner
})()

// ==========================================
// Google map implementation for skipper corp
// ==========================================
SkippairMap = (function() {
	// Private var
	var _self_map, _self;
	var _markers = [];
	var _mc;
	var _callbacks = [];7
	var _cancelUserMove = true;
	var _option;

	// Constructor
	SkippairMap = function(option) {
		_self = this;
		_option = option||{};
		_self_map = new google.maps.Map(document.getElementById('map'), {
			center: new google.maps.LatLng(0, 0),
			zoom: 1,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			scrollwheel: false,
			streetViewControl: false,
			mapTypeControl: false,
			zoomControl: true,
			zoomControlOptions: {
				style: google.maps.ZoomControlStyle.SMALL,
				position: google.maps.ControlPosition.TOP_LEFT
			},
		});
		_self_map.addListener('idle', function() {
			if (_cancelUserMove)
				return;
			for (var i = _callbacks.length - 1; i >= 0; i--) {
				if(_callbacks[i].event == 'userMove')
					_callbacks[i].callback(_self_map);
			};
		});
	};

	SkippairMap.prototype.addMarkers = function(data) {
		var currentMarker;
		for (var i = data.length - 1; i >= 0; i--) {
			currentMarker = new google.maps.Marker({
				position: {lat: data[i].pos.lat,lng: data[i].pos.lng},
				map: _self_map,
			});
			if (data[i].icon) {
				currentMarker.setIcon(data[i].icon);
				currentMarker.setAnimation(google.maps.Animation.DROP);
			}
			currentMarker.infowindow = new google.maps.InfoWindow({content: data[i].htmlPopUp});
			currentMarker.infowindow['status'] = 'close';
			currentMarker.close = function() {
				this.infowindow.status = 'close';
				this.infowindow.close()
			};
			currentMarker.open = function() {
				_desactivateUserMove();
				this.infowindow.status = 'open';
				this.infowindow.open(_self_map, this);
			};
			currentMarker.addListener('click', function() {
				if (this.infowindow.status == 'close') {
					_self.closeAllInfoWindows();
					this.open();
				} else
					this.close();
			});
			currentMarker.infowindow.addListener('closeclick', function() {
				this.status = 'close';
			});
			google.maps.event.addListener(currentMarker.infowindow, 'domready', function () {
				if (_option.defaultIW)
					return;
				var iwOuter = $('.gm-style-iw');
				var iwBackground = iwOuter.prev();
				var iwParent = iwOuter.parent();
				iwBackground.css({
					'display': 'none'
				});
				iwParent.css({
					"width": "260px",
					"height": "290px"
				});
			});
			_markers.push(currentMarker);
		};
		return this;
	};

	SkippairMap.prototype.deleteMarkers = function() {
		for (var i = 0; i < _markers.length; i++) {
			_markers[i].infowindow.close();
			_markers[i].infowindow.status = false;
			_markers[i].setMap(null);
		};
		_markers = [];
	};

	SkippairMap.prototype.closeAllInfoWindows = function() {
		for (var i in _markers) {
			_markers[i].close()
		}		
	};

	SkippairMap.prototype.agregateMarkers = function() {
		if (_mc !== undefined)
			_mc.clearMarkers();
		_mc = new MarkerClusterer(_self_map, _markers, {gridSize: 50});
	};

	SkippairMap.prototype.fitMapToMarkers = function() {
		_desactivateUserMove();
		if (_markers.length > 1) {
			_self_map.fitBounds(_markers.reduce(function(bounds, marker) {
				if (bounds) {
					return new google.maps.LatLngBounds({
						lat: Math.min(bounds.getSouthWest().lat(), marker.getPosition().lat()),
						lng: Math.min(bounds.getSouthWest().lng(), marker.getPosition().lng())
					}, {
						lat: Math.max(bounds.getNorthEast().lat(), marker.getPosition().lat()),
						lng: Math.max(bounds.getNorthEast().lng(), marker.getPosition().lng())
					});
				} else
					return new google.maps.LatLngBounds({
						lat: marker.getPosition().lat(),
						lng: marker.getPosition().lng()
					}, {
						lat: marker.getPosition().lat(),
						lng: marker.getPosition().lng()
					});
			}, null));
		} else if (_markers.length == 1) {
			_self_map.setCenter(_markers[0].getPosition());
			_self_map.setZoom(9);
		}
	};

	SkippairMap.prototype.on = function(event, callback) {
		_callbacks.push({
			'event':event,
			'callback':callback
		});
	};

	// Private function
	function _desactivateUserMove () {
		_cancelUserMove = true;
		window.setTimeout(function(){
			_cancelUserMove = false;
		}, 1000);
	};

	return SkippairMap
})();

$.fn.extend({
	animateCss: function (animationName) {
		var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
		this.addClass('animated ' + animationName).one(animationEnd, function() {
			$(this).removeClass('animated ' + animationName);
		});
	}
});