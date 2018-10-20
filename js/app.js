var self, infoWindow, tempMarker;

var markers = [];

var locations = [{
        title: 'Lindenhof',
        location: {
            lat: 47.3715752,
            lng: 8.5318223
        }
    },
    {
        title: 'Belvoir Park',
        location: {
            lat: 47.357742,
            lng: 8.5311685
        }
    },
    {
        title: 'Zoologisches Museum',
        location: {
            lat: 47.3754172,
            lng: 8.543964
        }
    },
    {
        title: 'Fraumünster Church',
        location: {
            lat: 47.3697263,
            lng: 8.541363
        }
    },
    {
        title: 'Limmatquai',
        location: {
            lat: 47.3717788,
            lng: 8.5429232
        }
    },
    {
        title: 'Bahnhofstrasse',
        location: {
            lat: 47.37166,
            lng: 8.5364668
        }
    }
];

function getStreetView(data, status) {
    if (status == google.maps.StreetViewStatus.OK) {
        var nearStreetViewLocation = data.location.latLng;
        var heading = google.maps.geometry.spherical.computeHeading(
            nearStreetViewLocation, tempMarker.position);

        $.ajax({
            url: self.changedWikiURL(),
            dataType: "jsonp",
            success: function(response) {
                var articleList = response[2];

                self.info(articleList[0]);
                console.log(self.info());
                if (self.info() === "" || typeof(self.info()) == 'undefined') {
                    infoWindow.setContent('<h4>' + self.markerTitle() + '</h4>' + '<div id="pano"></div>' + '<div id="data">No info available' + '</div>');
                } else {
                    infoWindow.setContent('<h4>' + self.markerTitle() + '</h4>' + '<div id="pano"></div>' + '<div id="data">' + self.info() + '</div>');
                }

                var panoramaOptions = {
                    position: nearStreetViewLocation,
                    pov: {
                        heading: heading,
                        pitch: 30
                    }
                };
                var panorama = new google.maps.StreetViewPanorama(
                    document.getElementById('pano'), panoramaOptions);
                console.log("Yes");
            },
            error: function(jqXHR, exception) {
                window.alert('Failed to load Content from Wikipedia');
            }
        });

    } else {
        infoWindow.setContent('<div>' + tempMarker.title + '</div>' +
            '<div>No Street View Found</div>');
        console.log("No");
    }
}

function showWindow(marker, infowindow) {

    if (infowindow.marker != marker) {

        infowindow.setContent('');
        infowindow.marker = marker;
        self.markerTitle(marker.title);

        infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
        });
        var streetViewService = new google.maps.StreetViewService();
        var radius = 50;

        streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
        infowindow.open(map, marker);
    }
}

function ViewModel() {
    self = this;
    this.cityName = ko.observable("Zurich, Switzerland");
    this.listTitle = "Contents of Map :-";
    this.locationNames = ko.observableArray([]);
    this.locationNames1 = ko.observableArray([]);
    for (var i = 0; i < locations.length; i++) {
        self.locationNames.push(locations[i].title.toUpperCase());
        self.locationNames1.push(locations[i].title.toUpperCase());
    }

    this.defaultValue = ko.observable("");

    this.nameFilter = ko.observable("");

    this.searchTheWikipedia = function() {};

    this.searchTheMap = function() {};

    this.wikiURL = ko.computed(function() {
        return "https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=" + self.defaultValue();
    }, this);

    this.searchedList = ko.observable("");

    this.markerTitle = ko.observable();

    this.changedWikiURL = ko.computed(function() {
        return "https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=" + this.markerTitle();
    }, this);

    this.info = ko.observable("");

    this.stopAnimations = function() {
        for (i = 0; i < markers.length; i++) {
            markers[i].setAnimation(null);
        }
    };

    this.animateMarker = function(place) {
        var i;
        self.stopAnimations();
        for (i = 0; i < markers.length; i++) {
            if (place === markers[i].title.toUpperCase()) {
                if (markers[i].getAnimation() === null) {
                    markers[i].setAnimation(google.maps.Animation.BOUNCE);
                    giveTimeout(i);
                    tempMarker = markers[i];
                    showWindow(markers[i], infoWindow);
                    break;
                } else {
                    markers[i].setAnimation(null);
                }
            }
        }

    };

    this.filterValue = ko.observable();
    this.tempLocationNames = ko.observableArray(self.locationNames().slice(0));
    var placeHolder = "";
    this.makeFilter = function() {
        console.log(self.filterValue());
        if(typeof(self.filterValue()) == 'undefined')
        {
                    self.locationNames1.removeAll();
                    for(var k=0;k<markers.length;k++)
                    {
                        markers[k].setVisible(true);
                        self.locationNames1.push(self.tempLocationNames()[k]);
                        infoWindow.close(map,markers[k]);
                    }
                    
        }
        else
        {
        		for(var j=0;j<markers.length;j++)
        		{
        			markers[j].setVisible(true);
        		}
        		placeHolder = self.filterValue();
		        for (var i = 0; i < markers.length; i++) {
		            if (self.filterValue() !== markers[i].title.toUpperCase()) {
		                markers[i].setVisible(false);
		            }
		            else
		            {
		            	tempMarker = markers[i];
		            	showWindow(markers[i],infoWindow);
		            }
		        }
		        self.locationNames1.removeAll();
		        self.locationNames1.push(placeHolder);
        }
        
    };
}

mapError = () => {
    window.alert("Failed To Load The Map");
};

giveTimeout = function(i) {
    setTimeout(function() {
        markers[i].setAnimation(null);
    }, 1600);
};

function initMap() {
    var map;
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 47.3774336,
            lng: 8.5065034
        },
        zoom: 13
    });

    infoWindow = new google.maps.InfoWindow();
    var defaultIcon = makeMarkerIcon('FF0000');
    var clickIcon = makeMarkerIcon('00FF00');
    var highlightedIcon = makeMarkerIcon('0000FF');

    showInfoWindowClick = function() {
        tempMarker = this;
        showWindow(this, infoWindow);
        this.setIcon(clickIcon);
        if (this.getAnimation() === null)
            this.setAnimation(google.maps.Animation.BOUNCE);
        else
            this.setAnimation(null);
    };

    showInfoWindowMouseOver = function() {
        this.setIcon(highlightedIcon);
    };

    showInfoWindowMouseOut = function() {
        this.setIcon(defaultIcon);
        infoWindow.marker = null;
        this.setAnimation(null);
    };



   

    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < locations.length; i++) {
        var position = locations[i].location;
        var title = locations[i].title;

        var marker = new google.maps.Marker({
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            id: i,
            icon: defaultIcon,
            map: map
        });
        markers.push(marker);
        bounds.extend(markers[i].getPosition());
        marker.addListener('click', showInfoWindowClick);
        marker.addListener('mouseover', showInfoWindowMouseOver);
        marker.addListener('mouseout', showInfoWindowMouseOut);
    }

    map.fitBounds(bounds);

    function makeMarkerIcon(markerColor) {
        var markerImage = new google.maps.MarkerImage(
            'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
            '|40|_|%E2%80%A2',
            new google.maps.Size(21, 34),
            new google.maps.Point(0, 0),
            new google.maps.Point(10, 34),
            new google.maps.Size(21, 34));
        return markerImage;
    }

    self.searchTheWikipedia = function() {
        if (self.defaultValue() !== "") {
            $.ajax({
                url: self.wikiURL(),
                dataType: "jsonp",
                success: function(response) {
                    var articleList = response[2];
                    for (var i = 0; i < articleList.length; i++)
                        self.searchedList("Search Results:- " + articleList[0]);
                    console.log(response);
                },
                error: function(jqXHR, exception) {
                    window.alert('Failed to load Content from Wikipedia');
                }
            });
        } else {
            self.searchedList("Enter a city or country to search");
        }
    };

    function hideTheMarkers(markers) {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
    }

    function clearContentsOfMap() {
        self.locationNames.removeAll();
    }

    function setContentsOfMap(value) {
        self.locationNames.push(value);
    }

    self.searchTheMap = function() {
        console.log(self.nameFilter());
        var geocoder = new google.maps.Geocoder();
        var address = self.nameFilter();
        if (address === '') {
            window.alert('You must enter a city or a country');
        } else {
            geocoder.geocode({
                address: address
            }, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    map.setCenter(results[0].geometry.location);
                    map.setZoom(13);
                    hideTheMarkers(markers);
                    clearContentsOfMap();
                    var marker = new google.maps.Marker({
                        position: results[0].geometry.location,
                        title: self.nameFilter(),
                        animation: google.maps.Animation.DROP,
                        id: i,
                        icon: defaultIcon,
                        map: map
                    });
                    setContentsOfMap(marker.title.toUpperCase());
                    markers.push(marker);
                    self.cityName(marker.title.toUpperCase());
                    marker.addListener('click', showInfoWindowClick);
                    marker.addListener('mouseover', showInfoWindowMouseOver);
                    marker.addListener('mouseout', showInfoWindowMouseOut);
                } else {
                    window.alert('We could not find that location - try entering a more' +
                        ' specific place.');
                }
            });
        }
    };
}

ko.applyBindings(new ViewModel());
