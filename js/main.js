var dbRef;
var signedIn, name, email, photoURL, uid, emailVerified, firstname;
var storageRef, geoQuery, geoFire;
var testCrumb;

var myCrumbsObj;

var uploadCrumbImg, uploadProfilePic;

var geoFireUsersQuery, geoFireUsers, myGeoDMs;//globalvar to connect outside this pagecreate pasta

$(document).ready(() => {

  //Instantiate the jquery.uploadPreview for Crumbs and profile pic
  $.uploadPreview({
    input_field: "#image-upload",
    preview_box: "#image-preview",
    label_field: "#image-label",
    label_default: "Choose Picture",
    label_selected: "Change Picture",
    img_to_upload: "crumb"
  });
  $.uploadPreview({
    input_field: "#updateProfilePic",
    preview_box: "#profilePicPreview",
    label_field: "#profilePicLabel",
    label_default: "Choose Picture",
    label_selected: "Change Picture",
    img_to_upload: "profilePic"
  });

  //Instantiate the postCrumb and signout Popups
  $("#postCrumb, #acctMenu, #alertPopup").enhanceWithin().popup();



  $('#viewCrumb').on({
    popupbeforeposition: () => {
      var maxHeight = $(window).height() - 60 + 'px';
      // $("#crumbPhoto").css("max-height", maxHeight);
      $("#viewCrumb").css("max-height", maxHeight);
    }
  })

  // Initialize Firebase
  var config = {
    apiKey: "**MY INFO**",
    authDomain: "**MY INFO**",
    databaseURL: "**MY INFO**",
    projectId: "**MY INFO**",
    storageBucket: "**MY INFO**",
    messagingSenderId: "**MY INFO**"
  };

  firebase.initializeApp(config);
  let database = firebase.database();
  dbRef = database.ref('crumbs');
  var geoFireRef = database.ref('geoHashes');//.push();
  geoFire = new GeoFire(geoFireRef);


  // Initialize the geoDM geoFire
  let geoFireUsersRef = firebase.database().ref('userGeoHashes');
  geoFireUsers = new GeoFire(geoFireUsersRef);
  $("#gDMSendMsg").click(sendGDM);








  //Link the PostCrumbBtn

  $('#postCrumbBtn').click(postCrumb);

  // When User is Logged In/Out
  firebase.auth().onAuthStateChanged(function (user) {
    let acctLoginTitle, acctLoginFunc;

    if (user) {
      signedIn = true;
      name = user.displayName;
      firstname = name.split(' ')[0];
      email = user.email;
      photoURL = user.photoURL ? user.photoURL : 'images/unknownUser.png';
      emailVerified = user.emailVerified;
      uid = user.uid;

      // delete the geoFire User upon disconnect
      var myCurrLocHash = firebase.database().ref('userGeoHashes/' + uid)
      myCurrLocHash.onDisconnect().remove();

      acctLoginTitle = "Sign Out";
      $("#signOutBtn").attr('href', "#");
      acctLoginFunc = function () { //What happens when you press Sign Out
        console.log("Logged out");
        // PUT IN REAL FIREBASE
        firebase.auth().signOut();
        // $("#signOutBtn").popup('close');
      };

      $("#updateUsername").val(name);
      // $("#updateProfileBtn").click(updateProfile)
      firebase.database().ref('/users/' + uid + "/crumbs/").on('child_added', (crumbKey) => {
        addCrumbToMyList(crumbKey.key);
      })
      //call myGeoDMs and get to populate geoDMS
      myGeoDMs = firebase.database().ref("users/" + uid + "/geoDMs");
      myGeoDMs.on('child_added', (snapshot, prevChildKey) => {
        // console.log('new gdm', snapshot)
        populateGeoDMs(snapshot.key)
      })
      //call function to update the user's info in the RTD
      createUserProfile(user);

      // Turn on the "Post Crumb" Popup Button
      $(".postCrumbPopupBtn").attr('href', '#postCrumb');

    } else {
      signedIn = false;
      photoURL = "images/unknownUser.png";
      firstname = "Guest";
      name = "Unknown Guest";
      //change signout Button to Login BUtton
      acctLoginTitle = "Sign In";
      $("#signOutBtn").attr('href', "login.html");
      $("#signOutBtn").attr('rel', "external");
      acctLoginFunc = function () { //What happens when you press Sign In
        // $("#signOutBtn").popup('close');
        // console.log("Logged in");
        document.location.href = 'login.html';
        // PUT IN REAL FIREBASE
        // firebase.auth().login();
      };
      // clear myCrumb LIst
      $("#myCrumbList").empty();
      $("#myCrumbList").listview().listview("refresh");
      // Cliear my GeoDMs list
      $("#gDMHistory").empty();
      $("#gDMHistory").listview().listview("refresh");

      // Turn off the "Post Crumb" Popup Button
      $(".postCrumbPopupBtn").attr('href', '#');
      $(".postCrumbPopupBtn").click(() => {
        worldViewAlert('You must be signed in to post a crumb!', 'orange', 3000);
      });


    }
    $("#profilePic, .userImg").attr('src', photoURL);
    $(".userFirstName").text(firstname);
    $("#userName").text(name);
    $("#signOutBtn").text(acctLoginTitle);
    $("#signOutBtn").click(acctLoginFunc);

  });
  // postCrumb gathers the data from the postCrumb form, including geoloc posts the pic to 
  // firestore, the metadata to RTD, and makes a geoFire geoHash.
  function postCrumb() {
    if (document.getElementById('image-upload').files.length == 0) {
      worldViewAlert("Choose a picture to upload", 'gold', 3000)
    }
    if (userMyPosition) {
      console.log(uploadCrumbImg);
      userMyLat = userMyPosition.lat();
      userMyLng = userMyPosition.lng();
      var selectedImg = uploadCrumbImg;
      console.log(selectedImg);
      var imageName = document.getElementById('image-upload').files[0].name;
      var storageRef = firebase.storage().ref('/crumbImages/' + imageName);
      var uploadTask = storageRef.put(selectedImg);
      uploadTask.on("state_changed", (snapshot) => {
        //monitor the progress of the upload
        worldViewAlert('Uploading Crumb. Just a sec...', 'gold', 3000);
      }, (error) => {
        worldViewAlert("Error with pic upload: " + error.code, 'red', 2000) //make this more sophsticated later
      }, () => { //successful upload
        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
          let rightNow = Date.now();
          let data = {
            time: rightNow,
            coords: { lat: userMyLat, lng: userMyLng },
            user: uid, //not name because eventually I wanna link to that user's profile
            imgURL: downloadURL,
            caption: $("#caption").val()
          }
          dbKey = dbRef.push(data, () => {
            firebase.database().ref('users/' + uid + '/crumbs/' + dbKey.key).set("true");
            geoFire.set(dbKey.key, [userMyLat, userMyLng]).then(() => {
              $('#postCrumb').popup('close')
              worldViewAlert(`Your Crumb has been posted, ${firstname}. :)`, 'green');
              setTimeout(() => {
                $("#worldViewAlert").empty();
              }, 3000)
            }, (error) => {
              console.log("Error: " + error.message);
            })

          }); //push the crumb metaDat and then push key under user history and push geoFire ref

        })
      }

      )

    } else {
      $('#worldViewAlert').text("Sorry :( You can't post a crumb without geolocation");
    }
  }
  // Jquery Image Preview Lib
  // http://opoloo.github.io/jquery_upload_preview/
  $.uploadPreview({
    input_field: "#image-upload",
    preview_box: "#image-preview",
    label_field: "#image-label"
  });

  // For Debugging, Press enter at caption to post crumb
  $("#caption").keydown((e) => {
    if (e.which == 13) {
      $("#postCrumbBtn").click();
    }
  })
})

function getRandomInRange(from, to, fixed) {
  return (Math.random() * (to - from) + from).toFixed(fixed) * 1;
  // .toFixed() returns string, so ' * 1' is a trick to convert to number
}

function panAndPop(crumb) {
  $('#crumbPhoto').attr('src', "");
  // console.log(crumb.img);
  let myLatLng = new google.maps.LatLng(crumb.coords.lat, crumb.coords.lng);
  map.panTo(myLatLng);
  if (userLookup[crumb.user]) {
    let userInfo = userLookup[crumb.user];
    $('#crumbPoster').text(userInfo.name)
  } else {
    getUserInfoFromKey(crumb.user)
      .then((snap) => {
        let userInfo = userLookup[crumb.user] = {
          name: snap.child('name').val(),
          profilePic: snap.child('photoURL').val() || 'images/unknownUser.png'
        }
        $('#crumbPoster').text(userInfo.name)
      })
  }

  $('#crumbPhoto').on('load', function () {
    $('#viewCrumb').popup('reposition', 'positionTo: window');
  });
  $('#crumbPhoto').attr('src', crumb.imgURL);
  $('#crumbCaption').text(crumb.caption);
  $("#viewCrumb").popup("open");
  // document.getElementById('crumbCaption').innerHTML(crumb.caption.replace("'", ""));
  // 
  // console.log($('#crumbPoster').val())

}

function createUserProfile(user) {
  // console.log(user.);
  let uRef = firebase.database().ref('users/' + user.uid);
  uRef.child('/profile').once('value', function (snapshot) {
    if (snapshot.val() != null) { }
    else {
      uRef.child('/profile/').set(
        {
          name: user.displayName,
          uid: user.uid,
          email: user.email,
          photoURL: user.photoURL

        }).then(() => {
          console.log("Created profile for " + user.displayName);
        }).catch((error) => {
          console.log("There was an error: " + error);
        })
    }
  })
}

function worldViewAlert(msg, color, time) {
  $("#worldViewAlert").css('color', color);
  $("#worldViewAlert").text(msg);
  if (time) {
    setTimeout(() => {
      $("#worldViewAlert").empty();
    }, time)
  }
}
