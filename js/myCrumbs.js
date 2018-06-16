//
var userLookup={};

$("#myCrumbs").on('pageinit', () => {

})

$("#myCrumbs").on('pagebeforeshow', function () {

})



function addCrumbToMyList(key) {
    // console.log(key);
    firebase.database().ref('crumbs').child(key).once("value", (snap) => {
        // console.log(snap.val());
        var listCrumb = createCrumbListView(key, snap.val());
        listCrumb.id = "myCrumbList_" +key;
        let myCrumbMenuBtn = document.createElement('a');
        myCrumbMenuBtn.id=`deleteOption_${key}`
        $(myCrumbMenuBtn).click(function(){
            askForConfirmDelete(key);
        });

        listCrumb.appendChild(myCrumbMenuBtn);
        $("#myCrumbList").prepend(listCrumb);
        $("#myCrumbList").listview().listview('refresh');

    })
}

function createCrumbListView(crumbKey, crumbObj) {
    let imgURL = crumbObj.imgURL ? crumbObj.imgURL : crumbObj.img;
    if (userLookup[crumbObj.user]){
        let userInfo=userLookup[crumbObj.user];
        $(".username_" + crumbKey).text(userInfo.name)
    } else{
        getUserInfoFromKey(crumbObj.user)
        .then((snap)=>{
            let userInfo= userLookup[crumbObj.user]={
                name: snap.child('name').val(),
                profilePic: snap.child('photoURL').val() || 'images/unknownUser.png'
            }
            $(".username_" + crumbKey).text(userInfo.name)
        })
    }
    let crumbContainer = document.createElement('li');
    
    let crumbContainerLink = document.createElement('a');
    crumbContainer.appendChild(crumbContainerLink);
    let crumbThumbnail = document.createElement('img');
    crumbThumbnail.src = imgURL;
    let listItemCaption = document.createElement('h3')
    listItemCaption.innerText = crumbObj.caption;
    let listItemUser = document.createElement('p')
    listItemUser.className = "username_" + crumbKey;
    let listItemTime = document.createElement('p')
    listItemTime.className = "ui-li-aside";
    listItemTime.innerText = timeSince(crumbObj.time);;
    crumbContainerLink.appendChild(crumbThumbnail);
    crumbContainerLink.appendChild(listItemCaption);
    crumbContainerLink.appendChild(listItemUser);
    crumbContainerLink.appendChild(listItemTime);
    return crumbContainer

}

function timeSince(date) {

    var seconds = Math.floor((new Date() - date) / 1000);

    var interval = Math.floor(seconds / 31536000);

    if (interval > 1) {
        return interval + " years ago";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
        return interval + " months ago";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
        return interval + " days ago";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
        return interval + " hours ago";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
        return interval + " minutes ago";
    }
    return Math.floor(seconds) + " seconds ago";
}

function getUserInfoFromKey(userKey) {
    // if(userLookup[userKey]){
    //     console.log(userLookup[userKey]);
    //     return userLookup[userKey];
    // } else{
    return firebase.database().ref(`users/${userKey}/profile`).once('value')
    // .then((snap)=>{
    //     userLookup[userKey]={
    //         name: snap.child('name').val(),
    //         profilePic: snap.child('photoURL').val() || 'images/unknownUser.png'
    //     };
    //     // return getUserInfoFromKey(userKey);
    //     return userLookup[userKey];
    // })
    // }
    // console.log(userKey);
} //Return the Promise so it can be used to write the name for the View Crumb Popup.

//clean-up crumb from RTD, and remove image from storage
function deleteCrumb(crumbKey) {
    let userCrumbRef = firebase.database().ref('/users/' + uid + '/crumbs/' + crumbKey);
    let crumbCrumbRef = firebase.database().ref('/crumbs/' + crumbKey);
    let geoFireCrumbRef = firebase.database().ref('/geoHashes/' + crumbKey);
    crumbCrumbRef.child('imgURL').once('value')
        .then((snap) => {
            let imgURL = snap.val();
            // console.log(imgURL);
            let imgRef = firebase.storage().refFromURL(imgURL);
            imgRef.delete()
                .then(() => {
                    // console.log("Image deleted")
                    $("#myCrumbList_" +crumbKey).remove();
                })
                .catch((e) => {
                    console.log("Error: " + e.message);
                })
            crumbCrumbRef.remove() //from Crumb branch
                .then(() => {
                    // console.log('Crumb Removed from crumb branch');
                })
                .catch((e) => {
                    console.log("error: " + e.message)
                })

        })
        .catch((e) => {
            console.log("There was an error: " + e.message);
        })

    userCrumbRef.remove()//from user node
        .then(() => {
            // console.log('Crumb Removed from user branch');
        })
        .catch((e) => {
            console.log("error: " + e.message)
        })


    geoFireCrumbRef.remove()//from geohashes node
        .then(() => {
            // console.log('Crumb Removed from geoFire branch');
        })
        .catch((e) => {
            console.log("error: " + e.message)
        })
}

function updateProfile() {
    if (signedIn) {
        var newUserName = $("#updateUsername").val();

        if (document.getElementById('updateProfilePic').files.length > 0) {
            var storageRef = firebase.storage().ref('/profilePics/' + uid);
            var pictureFile = uploadProfilePic; //document.getElementById('updateProfilePic').files[0];
            var uploadTask = storageRef.put(pictureFile);
            uploadTask.on("state_changed", (snapshot) => {
                $("#profileChangeStatus").text('Uploading...');
            }, (error) => {

            }, () => {
                $("#profileChangeStatus").text('Picture Updated');
                $("#changeProf").collapsible("collapse");
                uploadTask.snapshot.ref.getDownloadURL().then((ppURL) => {
                    firebase.database().ref('/users/' + uid + '/profile/photoURL').set(ppURL);
                    photoURL = ppURL;
                    firebase.auth().currentUser.updateProfile({
                        photoURL: ppURL
                    }).then(() => { console.log("update successful") })
                        .catch((e) => { console.log("Error: " + e.message) });
                    $("#profilePic, .userImg").attr('src', photoURL);

                })
            }
            )
        } if (newUserName != name) {
            name = newUserName;
            firebase.auth().currentUser.updateProfile({
                displayName: name
            }).then(() => {
                firebase.database().ref('/users/' + uid + '/profile/name').set(name);
                $("#profileChangeStatus").text('Username Updated');
                $("#userName").text(name);
                $("#changeProf").collapsible("collapse");
            }).catch((e) => {
                $("#profileChangeStatus").text('Error: ' + e.message);
            })
        }

    } else { $("#profileChangeStatus").text("Sign in to Update Profile!") }
}

function askForConfirmDelete(crumbKey) {
    $("#confirmDelete").click(()=>{
        deleteCrumb(crumbKey);
    });
    $("#deleteCrumbConfirm").popup('open');
}