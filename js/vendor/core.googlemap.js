function Jacqueline_googlemap_init(dom_obj, coords) {
	"use strict";
	if (typeof Jacqueline_STORAGE['googlemap_init_obj'] == 'undefined') Jacqueline_googlemap_init_styles();
	Jacqueline_STORAGE['googlemap_init_obj'].geocoder = '';
	try {
		var id = dom_obj.id;
		Jacqueline_STORAGE['googlemap_init_obj'][id] = {
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
				styles: Jacqueline_STORAGE['googlemap_styles'][coords.style ? coords.style : 'default'],
				mapTypeId: google.maps.MapTypeId.ROADMAP
			}
		};
		
		Jacqueline_googlemap_create(id);

	} catch (e) {
		
		dcl(Jacqueline_STORAGE['strings']['googlemap_not_avail']);

	};
}

function Jacqueline_googlemap_create(id) {
	"use strict";

	// Create map
	Jacqueline_STORAGE['googlemap_init_obj'][id].map = new google.maps.Map(Jacqueline_STORAGE['googlemap_init_obj'][id].dom, Jacqueline_STORAGE['googlemap_init_obj'][id].opt);

	// Add markers
	for (var i in Jacqueline_STORAGE['googlemap_init_obj'][id].markers)
		Jacqueline_STORAGE['googlemap_init_obj'][id].markers[i].inited = false;
	Jacqueline_googlemap_add_markers(id);
	
	// Add resize listener
	jQuery(window).resize(function() {
		if (Jacqueline_STORAGE['googlemap_init_obj'][id].map)
			Jacqueline_STORAGE['googlemap_init_obj'][id].map.setCenter(Jacqueline_STORAGE['googlemap_init_obj'][id].opt.center);
	});
}

function Jacqueline_googlemap_add_markers(id) {
	"use strict";
	for (var i in Jacqueline_STORAGE['googlemap_init_obj'][id].markers) {
		
		if (Jacqueline_STORAGE['googlemap_init_obj'][id].markers[i].inited) continue;
		
		if (Jacqueline_STORAGE['googlemap_init_obj'][id].markers[i].latlng == '') {
			
			if (Jacqueline_STORAGE['googlemap_init_obj'][id].geocoder_request!==false) continue;
			
			if (Jacqueline_STORAGE['googlemap_init_obj'].geocoder == '') Jacqueline_STORAGE['googlemap_init_obj'].geocoder = new google.maps.Geocoder();
			Jacqueline_STORAGE['googlemap_init_obj'][id].geocoder_request = i;
			Jacqueline_STORAGE['googlemap_init_obj'].geocoder.geocode({address: Jacqueline_STORAGE['googlemap_init_obj'][id].markers[i].address}, function(results, status) {
				"use strict";
				if (status == google.maps.GeocoderStatus.OK) {
					var idx = Jacqueline_STORAGE['googlemap_init_obj'][id].geocoder_request;
					if (results[0].geometry.location.lat && results[0].geometry.location.lng) {
						Jacqueline_STORAGE['googlemap_init_obj'][id].markers[idx].latlng = '' + results[0].geometry.location.lat() + ',' + results[0].geometry.location.lng();
					} else {
						Jacqueline_STORAGE['googlemap_init_obj'][id].markers[idx].latlng = results[0].geometry.location.toString().replace(/\(\)/g, '');
					}
					Jacqueline_STORAGE['googlemap_init_obj'][id].geocoder_request = false;
					setTimeout(function() { 
						Jacqueline_googlemap_add_markers(id); 
						}, 200);
				} else
					dcl(Jacqueline_STORAGE['strings']['geocode_error'] + ' ' + status);
			});
		
		} else {
			
			// Prepare marker object
			var latlngStr = Jacqueline_STORAGE['googlemap_init_obj'][id].markers[i].latlng.split(',');
			var markerInit = {
				map: Jacqueline_STORAGE['googlemap_init_obj'][id].map,
				position: new google.maps.LatLng(latlngStr[0], latlngStr[1]),
				clickable: Jacqueline_STORAGE['googlemap_init_obj'][id].markers[i].description!=''
			};
			if (Jacqueline_STORAGE['googlemap_init_obj'][id].markers[i].point) markerInit.icon = Jacqueline_STORAGE['googlemap_init_obj'][id].markers[i].point;
			if (Jacqueline_STORAGE['googlemap_init_obj'][id].markers[i].title) markerInit.title = Jacqueline_STORAGE['googlemap_init_obj'][id].markers[i].title;
			Jacqueline_STORAGE['googlemap_init_obj'][id].markers[i].marker = new google.maps.Marker(markerInit);
			
			// Set Map center
			if (Jacqueline_STORAGE['googlemap_init_obj'][id].opt.center == null) {
				Jacqueline_STORAGE['googlemap_init_obj'][id].opt.center = markerInit.position;
				Jacqueline_STORAGE['googlemap_init_obj'][id].map.setCenter(Jacqueline_STORAGE['googlemap_init_obj'][id].opt.center);				
			}
			
			// Add description window
			if (Jacqueline_STORAGE['googlemap_init_obj'][id].markers[i].description!='') {
				Jacqueline_STORAGE['googlemap_init_obj'][id].markers[i].infowindow = new google.maps.InfoWindow({
					content: Jacqueline_STORAGE['googlemap_init_obj'][id].markers[i].description
				});
				google.maps.event.addListener(Jacqueline_STORAGE['googlemap_init_obj'][id].markers[i].marker, "click", function(e) {
					var latlng = e.latLng.toString().replace("(", '').replace(")", "").replace(" ", "");
					for (var i in Jacqueline_STORAGE['googlemap_init_obj'][id].markers) {
						if (latlng == Jacqueline_STORAGE['googlemap_init_obj'][id].markers[i].latlng) {
							Jacqueline_STORAGE['googlemap_init_obj'][id].markers[i].infowindow.open(
								Jacqueline_STORAGE['googlemap_init_obj'][id].map,
								Jacqueline_STORAGE['googlemap_init_obj'][id].markers[i].marker
							);
							break;
						}
					}
				});
			}
			
			Jacqueline_STORAGE['googlemap_init_obj'][id].markers[i].inited = true;
		}
	}
}

function Jacqueline_googlemap_refresh() {
	"use strict";
	for (id in Jacqueline_STORAGE['googlemap_init_obj']) {
		Jacqueline_googlemap_create(id);
	}
}

function Jacqueline_googlemap_init_styles() {
	// Init Google map
	Jacqueline_STORAGE['googlemap_init_obj'] = {};
	Jacqueline_STORAGE['googlemap_styles'] = {
		'default': []
	};
	if (window.Jacqueline_theme_googlemap_styles!==undefined)
		Jacqueline_STORAGE['googlemap_styles'] = Jacqueline_theme_googlemap_styles(Jacqueline_STORAGE['googlemap_styles']);
}