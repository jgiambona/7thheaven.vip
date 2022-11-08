function 7th Heaven_googlemap_init(dom_obj, coords) {
	"use strict";
	if (typeof 7th Heaven_STORAGE['googlemap_init_obj'] == 'undefined') 7th Heaven_googlemap_init_styles();
	7th Heaven_STORAGE['googlemap_init_obj'].geocoder = '';
	try {
		var id = dom_obj.id;
		7th Heaven_STORAGE['googlemap_init_obj'][id] = {
			dom: dom_obj,
			markers: coords.markers,
			geocoder_request: false,
			opt: {
				zoom: coords.zoom,
				center: null,
				scrollwheel: false,
				scaleControl: false,
				disableDefaultUI: false,
				panControl: true,
				zoomControl: true, //zoom
				mapTypeControl: false,
				streetViewControl: false,
				overviewMapControl: false,
				styles: 7th Heaven_STORAGE['googlemap_styles'][coords.style ? coords.style : 'default'],
				mapTypeId: google.maps.MapTypeId.ROADMAP
			}
		};
		
		7th Heaven_googlemap_create(id);

	} catch (e) {
		
		dcl(7th Heaven_STORAGE['strings']['googlemap_not_avail']);

	};
}

function 7th Heaven_googlemap_create(id) {
	"use strict";

	// Create map
	7th Heaven_STORAGE['googlemap_init_obj'][id].map = new google.maps.Map(7th Heaven_STORAGE['googlemap_init_obj'][id].dom, 7th Heaven_STORAGE['googlemap_init_obj'][id].opt);

	// Add markers
	for (var i in 7th Heaven_STORAGE['googlemap_init_obj'][id].markers)
		7th Heaven_STORAGE['googlemap_init_obj'][id].markers[i].inited = false;
	7th Heaven_googlemap_add_markers(id);
	
	// Add resize listener
	jQuery(window).resize(function() {
		if (7th Heaven_STORAGE['googlemap_init_obj'][id].map)
			7th Heaven_STORAGE['googlemap_init_obj'][id].map.setCenter(7th Heaven_STORAGE['googlemap_init_obj'][id].opt.center);
	});
}

function 7th Heaven_googlemap_add_markers(id) {
	"use strict";
	for (var i in 7th Heaven_STORAGE['googlemap_init_obj'][id].markers) {
		
		if (7th Heaven_STORAGE['googlemap_init_obj'][id].markers[i].inited) continue;
		
		if (7th Heaven_STORAGE['googlemap_init_obj'][id].markers[i].latlng == '') {
			
			if (7th Heaven_STORAGE['googlemap_init_obj'][id].geocoder_request!==false) continue;
			
			if (7th Heaven_STORAGE['googlemap_init_obj'].geocoder == '') 7th Heaven_STORAGE['googlemap_init_obj'].geocoder = new google.maps.Geocoder();
			7th Heaven_STORAGE['googlemap_init_obj'][id].geocoder_request = i;
			7th Heaven_STORAGE['googlemap_init_obj'].geocoder.geocode({address: 7th Heaven_STORAGE['googlemap_init_obj'][id].markers[i].address}, function(results, status) {
				"use strict";
				if (status == google.maps.GeocoderStatus.OK) {
					var idx = 7th Heaven_STORAGE['googlemap_init_obj'][id].geocoder_request;
					if (results[0].geometry.location.lat && results[0].geometry.location.lng) {
						7th Heaven_STORAGE['googlemap_init_obj'][id].markers[idx].latlng = '' + results[0].geometry.location.lat() + ',' + results[0].geometry.location.lng();
					} else {
						7th Heaven_STORAGE['googlemap_init_obj'][id].markers[idx].latlng = results[0].geometry.location.toString().replace(/\(\)/g, '');
					}
					7th Heaven_STORAGE['googlemap_init_obj'][id].geocoder_request = false;
					setTimeout(function() { 
						7th Heaven_googlemap_add_markers(id); 
						}, 200);
				} else
					dcl(7th Heaven_STORAGE['strings']['geocode_error'] + ' ' + status);
			});
		
		} else {
			
			// Prepare marker object
			var latlngStr = 7th Heaven_STORAGE['googlemap_init_obj'][id].markers[i].latlng.split(',');
			var markerInit = {
				map: 7th Heaven_STORAGE['googlemap_init_obj'][id].map,
				position: new google.maps.LatLng(latlngStr[0], latlngStr[1]),
				clickable: 7th Heaven_STORAGE['googlemap_init_obj'][id].markers[i].description!=''
			};
			if (7th Heaven_STORAGE['googlemap_init_obj'][id].markers[i].point) markerInit.icon = 7th Heaven_STORAGE['googlemap_init_obj'][id].markers[i].point;
			if (7th Heaven_STORAGE['googlemap_init_obj'][id].markers[i].title) markerInit.title = 7th Heaven_STORAGE['googlemap_init_obj'][id].markers[i].title;
			7th Heaven_STORAGE['googlemap_init_obj'][id].markers[i].marker = new google.maps.Marker(markerInit);
			
			// Set Map center
			if (7th Heaven_STORAGE['googlemap_init_obj'][id].opt.center == null) {
				7th Heaven_STORAGE['googlemap_init_obj'][id].opt.center = markerInit.position;
				7th Heaven_STORAGE['googlemap_init_obj'][id].map.setCenter(7th Heaven_STORAGE['googlemap_init_obj'][id].opt.center);				
			}
			
			// Add description window
			if (7th Heaven_STORAGE['googlemap_init_obj'][id].markers[i].description!='') {
				7th Heaven_STORAGE['googlemap_init_obj'][id].markers[i].infowindow = new google.maps.InfoWindow({
					content: 7th Heaven_STORAGE['googlemap_init_obj'][id].markers[i].description
				});
				google.maps.event.addListener(7th Heaven_STORAGE['googlemap_init_obj'][id].markers[i].marker, "click", function(e) {
					var latlng = e.latLng.toString().replace("(", '').replace(")", "").replace(" ", "");
					for (var i in 7th Heaven_STORAGE['googlemap_init_obj'][id].markers) {
						if (latlng == 7th Heaven_STORAGE['googlemap_init_obj'][id].markers[i].latlng) {
							7th Heaven_STORAGE['googlemap_init_obj'][id].markers[i].infowindow.open(
								7th Heaven_STORAGE['googlemap_init_obj'][id].map,
								7th Heaven_STORAGE['googlemap_init_obj'][id].markers[i].marker
							);
							break;
						}
					}
				});
			}
			
			7th Heaven_STORAGE['googlemap_init_obj'][id].markers[i].inited = true;
		}
	}
}

function 7th Heaven_googlemap_refresh() {
	"use strict";
	for (id in 7th Heaven_STORAGE['googlemap_init_obj']) {
		7th Heaven_googlemap_create(id);
	}
}

function 7th Heaven_googlemap_init_styles() {
	// Init Google map
	7th Heaven_STORAGE['googlemap_init_obj'] = {};
	7th Heaven_STORAGE['googlemap_styles'] = {
		'default': []
	};
	if (window.7th Heaven_theme_googlemap_styles!==undefined)
		7th Heaven_STORAGE['googlemap_styles'] = 7th Heaven_theme_googlemap_styles(7th Heaven_STORAGE['googlemap_styles']);
}