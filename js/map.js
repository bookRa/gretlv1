var geoFire, geoQuery;
var map, currentPositionMarker, userMyPosition;
var markerList = {};
// TOOD: make a flashNotice function that takes (msg, color, sec)

function initMap() {
    var startLat, startLong;
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition((pos) => {
            userMyPosition = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
            let options = {
                zoom: 13,
                center: userMyPosition
            }
            map = new google.maps.Map(document.getElementById('map'), options);
            setCurrentPosition(pos);
            watchCurrentPosition(pos);
            makeMyPosBtn();
            testQuery(pos);
            map.addListener('bounds_changed', updateQueryBasedOnMap);
        }, (err) => {
            $('#worldViewAlert').text(err.message);
            startLat = 47.4953885; //hardcoded to my house
            startLong = -122.2613298;
            let options = {
                zoom: 15,
                center: { lat: startLat, lng: startLong }
            }
            map = new google.maps.Map(document.getElementById('map'), options);
        });
    } else {
        $('#worldViewAlert').text("Geolocation isn't set up");
        startLat = 47.4953885; //hardcoded to my house
        startLong = -122.2613298;
        let options = {
            zoom: 12,
            center: { lat: startLat, lng: startLong }
        }
        map = new google.maps.Map(document.getElementById('map'), options);
    }

    //I've copied options and map a bunch of times because it's asynch and 
    // I haven't yet learned how to use promises or asynch defer or whatever it's called
}

// Try to implement watch Position:

function setCurrentPosition(pos) {
    currentPositionMarker = new google.maps.Marker({
        map: map,
        position: new google.maps.LatLng(
            pos.coords.latitude,
            pos.coords.longitude
        ),
        title: "Current Position",
        icon: 'images/run.png'
    });
}

function setMarkerPosition(marker, pos) {
    marker.setMarkerPosition(
        new google.maps.LatLng(
            pos.coords.latitude,
            pos.coords.longitude)
    );
    console.log(pos);

}
function testQuery(position) {
    // console.log(position);
    geoQuery = geoFire.query({
        center: [position.coords.latitude, position.coords.longitude],
        radius: 1
    })
    var keyEnteredQueryEvent = geoQuery.on('key_entered', (key, location, distance) => {
        let currCrumbRef = firebase.database().ref('crumbs/' + key);
        currCrumbRef.once('value', (snap) => {
            let currCrumb = snap.val();
            if (!markerList[key]) {
                let marker = new google.maps.Marker({
                    position: currCrumb.coords,
                    map: map,
                    title: currCrumb.caption,
                    icon: 'images/cookie.png',
                });
                addMarkerClick(marker, currCrumb);
                markerList[key] = marker;
            } else { //if the marker is already in the list, no point in re-creating it. ya know?
                markerList[key].setMap(map);
            }
            if ($("#worldView_" + key).length) {
                $("#worldView_" + key).show()
            } else {
                let liTemplate = createCrumbListView(key, currCrumb);
                liTemplate.id = "worldView_" + key;
                $(liTemplate).on('click', () => {
                    panAndPop(currCrumb);
                });

                $("#currentCrumbs").append(liTemplate);
            }


            $("#currentCrumbs").listview().listview('refresh');

        });
    })
    geoQuery.on('ready', () => {
        // console.log('everything has loaded, I guess.');
        // keyEnteredQueryEvent.cancel();
    })
    geoQuery.on('key_exited', (key, location, distance) => {
        // console.log('key ' + key + "has exited geoQUery")
        $("#worldView_" + key).hide();
        $("#currentCrumbs").listview().listview('refresh');
        markerList[key].setMap(null);

    })
    //Initialize UserQuery here because I'm a n00b (gotta wait till after DOM loads and geoloc is gathered)
    geoFireUsersQuery= geoFireUsers.query({ //this will be updated with userMyPosition change
        center: [userMyPosition.lat(), userMyPosition.lng()],
        radius: 0.3048 //1000ft
    })

    // geoFireUsersQuery.on('key_entered', (key, location, distance)=>{
    //     addChatterCheckbox(key, distance);
    // })
    // geoFireUsersQuery.on('key_exited', (key, location, distance)=>{
    //     $(`#geoDM${key}Checkbox`).prop('checked', false);
    //     $(`#geoDM${key}Label, #geoDM${key}Checkbox`).hide();
    //     $("#availableChatters")
    //     .enhanceWithin()
    //     .controlgroup("refresh");
    // })

    
}

function watchCurrentPosition() {
    // console.log('now were watching');
    var positionTimer = navigator.geolocation.watchPosition((position) => {

        userMyPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        currentPositionMarker.setPosition(userMyPosition);
        updateGeoDMQuery();

    }, (error) => {
        console.log("Error: " + error);
    });
}

function displayAndWatch(pos) {
    console.log('displaying and watching!')
    setCurrentPosition(pos);
    watchCurrentPosition();
}

function initLocationProcedure() {
    if (navigator.geolocation) {
        console.log('we have geolocation');
        navigator.geolocation.getCurrentPosition(displayAndWatch, locError);
    } else {
        $('#worldViewAlert').text('GeoLocation not Supported');
    }
}



function locError(e) {
    console.log(e);
}

// Implementing a MyPosition Button:
// from https://jsfiddle.net/ogsvzacz/6/
function makeMyPosBtn() {
    var controlDiv = document.createElement('div');

    var firstChild = document.createElement('button');
    firstChild.style.backgroundColor = '#fff';
    firstChild.style.border = 'none';
    firstChild.style.outline = 'none';
    firstChild.style.width = '28px';
    firstChild.style.height = '28px';
    firstChild.style.borderRadius = '2px';
    firstChild.style.boxShadow = '0 1px 4px rgba(0,0,0,0.3)';
    firstChild.style.cursor = 'pointer';
    firstChild.style.marginRight = '10px';
    firstChild.style.padding = '0';
    firstChild.title = 'Your Location';
    controlDiv.appendChild(firstChild);

    var secondChild = document.createElement('div');
    secondChild.style.margin = '5px';
    secondChild.style.width = '18px';
    secondChild.style.height = '18px';
    secondChild.style.backgroundImage = 'url(https://maps.gstatic.com/tactile/mylocation/mylocation-sprite-2x.png)';
    secondChild.style.backgroundSize = '180px 18px';
    secondChild.style.backgroundPosition = '0 0';
    secondChild.style.backgroundRepeat = 'no-repeat';
    firstChild.appendChild(secondChild);

    firstChild.addEventListener('click', () => {
        map.setCenter(userMyPosition);
    });

    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(controlDiv);

}

// Implement a responsive geo-lookup based on map bounds
function updateQueryBasedOnMap() {
    var bounds = map.getBounds();
    var center = map.getCenter();

    if (bounds && center) {
        var ne = bounds.getNorthEast();
        // Calculate radius (in meters).
        var radius = google.maps.geometry.spherical.computeDistanceBetween(center, ne) / 1000;
        // console.log(center.lat(), center.lng(), radius);
        geoQuery.updateCriteria({
            center: [center.lat(), center.lng()],
            radius: radius
        });
    }
}

function addMarkerClick(thisMarker, thisCrumb) {
    google.maps.event.addListener(thisMarker, 'click', (e) => {
        panAndPop(thisCrumb);
        // $("#viewCrumb").popup("open");
    })
}