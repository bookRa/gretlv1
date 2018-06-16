function postCrumb() {
    if (userMyPosition) {
        userMyLat = userMyPosition.lat();
        userMyLng = userMyPosition.lng();
        var selectedImg = uploadCrumbImg;
        var imageName = document.getElementById('image-upload').files[0].name;
        var storageRef = firebase.storage().ref('/crumbImages/' + imageName);
        var uploadTask = storageRef.put(selectedImg);
        uploadTask.on("state_changed", (snapshot) => {
            //monitor the progress of the upload     
        }, (error) => {
            console.log(error.code) //make this more sophsticated later
        }, () => { //successful upload
            uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                let rightNow = Date.now();
                let data = {
                    time: rightNow,
                    coords: userMyPosition,
                    user: uid, //not name because eventually I wanna link to that user's profile
                    imgURL: downloadURL,
                    caption: $("#caption").val()
                }
                dbKey = dbRef.push(data, () => {
                    firebase.database().ref('users/' + uid + '/crumbs').push(dbKey.key);
                    geoFire.set(dbKey.key, [userMyLat, userMyLng]).then(() => {
                        $('#postCrumb').popup('close')
                        $("#worldViewAlert").css('color', 'green');
                        $("#worldViewAlert").text(`Your Crumb has been posted, ${firstname}. :)`);
                        setTimeout(() => {
                            $("#worldViewAlert").empty();
                        }, 3000)
                    }, (error) => {
                        console.log("Error: " + error);
                    })

                }); //push the crumb metaDat and then push key under user history and push geoFire ref

            })
        }

        )

    } else {
        $('#worldViewAlert').text("Sorry :( You can't post a crumb without geolocation");
    }
}


//OLD FUNCTION
function postCrumb() {

    let crumbLat = getRandomInRange(47.51750, 47.733986, 6);
    let crumbLong = getRandomInRange( -122.418977, -122.275468, 6);
    var caption = document.getElementById('caption').value;
    var selectedFile = uploadCrumbImg; 
    var imageName = document.getElementById('image-upload').files[0].name;
    var storageRef = firebase.storage().ref('/crumbImages/' + imageName);
    var uploadTask = storageRef.put(selectedFile);
    if (userMyPosition){
      crumbLat= userMyPosition.lat();
      crumbLong= userMyPosition.lng();
    } else {
      $('#geoErrorTag').text("Your browser doesn't support geo-loc. Giving your crumb fake coordinates in Seattle");
      $('#geoErrorTag').css("display", "block");
      caption+="...FAKE COORDS GIVEN";
    }
    uploadTask.on('state_changed', (snapshot) => {

    }, (error) => {

    }, () => {
      var downloadURL = uploadTask.snapshot.downloadURL;

      let rightNow = Date.now();
      let geoLocation = {
        lat: crumbLat,
        lng: crumbLong
      }
 
      let data = {
        time: rightNow,
        coords: geoLocation,
        user: name,
        img: downloadURL,
        caption: caption

      }
      dbKey= dbRef.push(data).key;
      geoFire.set(dbKey, [geoLocation.lat, geoLocation.lng]).then(()=>{
        // console.log('key '+ dbKey + ' has been added to geoFire!');
      }, (error)=>{
        console.log("Error: "+ error);
      })
      $('#postCrumb').popup('close')
      $("#worldViewAlert").css('color','green');
      $("#worldViewAlert").text(`Your Crumb has been posted, ${firstname}. :)`);
      setTimeout(()=>{
        $("#worldViewAlert").empty();
      }, 3000)
    })
    // console.log('posting from popup')
  }