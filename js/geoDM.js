
var nearbyUsers = {};//a cache of nearby Users

$("#geoDM").on("pageshow", function (event) {

    console.log('GeoDM page loaded?')
    geoFireUsersQuery.on('key_entered', (key, location, distance) => {
        addChatterCheckbox(key, distance);
    })
    geoFireUsersQuery.on('key_exited', (key, location, distance) => {
        $(`#geoDM${key}Checkbox`).prop('checked', false);
        $(`#geoDM${key}Label, #geoDM${key}Checkbox`).hide();
        $("#availableChatters")
            .enhanceWithin()
            .controlgroup("refresh");
    })

});



function sendGDM() {
    if ($("#gDMTextInput").val() == "") {

        popupAlert("Write something to send message!", 'gold', 2000)
        return false

    } else if($("input[name='availableChatters']:checked").length == 0){
    
        popupAlert("No Recipients are selected", 'gold', 2000);
        return false

    } else if(!signedIn){
        popupAlert("Sign In to send a GeoDM", "gold", 2000)
    }else {
        let recipientNames = [];
        let recipientPics = [];
        let recipients = $.map($("input[name='availableChatters']:checked"),
            (e, i) => {
                recipientPics.push($('#' + e.value + "_profPic").attr('src'));
                recipientNames.push($('#' + e.value + "_name").text());
                return e.value; //populate with checkboxed UIDs
            });
        // console.log(recipients);

        let geoDM = {
            fromID: uid,
            fromName: name,
            fromPic: photoURL,
            toID: recipients,
            toName: recipientNames,
            toPics: recipientPics,
            time: Date.now(),
            message: $("#gDMTextInput").val()
        }
        $("#gDMTextInput").val('');
        //put msg in the geoDMs tree
        let gdmKey = firebase.database().ref("geoDMs").push(geoDM, () => {
            // put the key in the "geoDMs" node of the sender and recipients
            for (let uid of recipients) {
                firebase.database().ref("users/" + uid + "/geoDMs/" + gdmKey.key).set('true');
            }
            firebase.database().ref("users/" + uid + "/geoDMs/" + gdmKey.key).set('true');

        });
    }
}

//on loading GeDMs page, query the users/uid/geoDMs node, on child added **For the moment I've given up on using UIDs because of Async horribleness. I've just hardcoded the names into the geoDM obj.
function populateGeoDMs(gDMKey) {

    let msgData = {
        fromMe: false,
        //sender{Name, profilePic}, message, time, recipients {if I sent it}
    }
    firebase.database().ref("geoDMs/" + gDMKey).once('value', (snap) => {
        msgData.sender = snap.child('fromName').val();
        msgData.recipients = snap.child('toName').val().join(',');
        // console.log(typeof recipientIDs, recipientIDs);
        msgData.message = snap.child('message').val();
        msgData.time = snap.child('time').val();
        msgData.senderPic = snap.child('fromPic').val();

        // Promise.all([prom1, prom2]).then((values)=>{
        //     console.log(values);
        // });


        var gdmTemplate = `
            <li><a href='#'><img class="geoDMProfilePic" src=${msgData.senderPic}><h2 class="ui-li-desc gdmContent" >${msgData.message}</h2>
            <p class='ui-li-desc'>To: ${msgData.recipients}</p>
            <p class="ui-li-aside"> ${timeSince(msgData.time)}</p>
        `
        //create template listview template of the message
        // if (msgData.fromMe) { //from me template
        //     console.log('we want names now!');
        //     gdmTemplate = 
        //     <li><a href='#'><img src=${photoURL}><h2>${msgData.message}</h2>
        //     <p>To: ${msgData.recipients.join(',')}</p>
        //     <p class="ui-li-aside"> ${timeSince(msgData.time)}</p>
        // } else {
        //     gdmTemplate =
        //     <li><a href='#'><img src=${msgData.sender.profilePic}><h2>${msgData.message}</h2>
        //     <p>From: ${msgData.sender.name}</p>
        //     <p class="ui-li-aside"> ${timeSince(msgData.time)}</p>

        // }
        $("#gDMHistory").prepend(gdmTemplate);
        $("#gDMHistory").listview().listview('refresh');

    })

}

function updateGeoDMQuery() {
    //updates the client's location in GeoFire
    geoFireUsers.set(uid, [userMyPosition.lat(), userMyPosition.lng()])
    //updates the query for nearby chatters
    geoFireUsersQuery.updateCriteria({
        center: [userMyPosition.lat(), userMyPosition.lng()]
    })
}

function addChatterCheckbox(userID, distanceFrom) {
    if (userID != uid) {

        if (!nearbyUsers[userID]) {
            //get user's profile
            let chatterProf = firebase.database().ref('users/' + userID + '/profile');
            chatterProf.once('value')
                .then((snapshot) => {
                    let profilePicRef = snapshot.child('photoURL').exists() ? snapshot.child('photoURL').val() : 'images/unknownUser.png';
                    nearbyUsers[userID] = {
                        name: snapshot.child('name').val(),
                        profilePic: profilePicRef,
                    }
                    let checkboxContainer = `
                <label for="geoDM${userID}Checkbox" id="geoDM${userID}Label">
                <img id="${userID}_profPic" src=${nearbyUsers[userID].profilePic} class="geoDMProfilePic">
                <span id="${userID}_name">${nearbyUsers[userID].name}</span>
                <br>
                <small>${(distanceFrom / 3280.84).toFixed()} ft away</small>
                </label>
                <input type="checkbox" name="availableChatters" value="${userID}"  id="geoDM${userID}Checkbox">
                `;
                    $('#availableChatters').controlgroup("container").prepend(checkboxContainer);
                    $("#availableChatters")
                        .enhanceWithin()
                        .controlgroup("refresh");
                })
        } else if ($(`#geoDM${userID}Label`).length) {
            $(`#geoDM${userID}Label, #geoDM${userID}Checkbox`).show();
            $("#availableChatters")
                .enhanceWithin()
                .controlgroup("refresh");
        } else {
            //create a checkbox from user info
            let checkboxContainer = `
            <label for="geoDM${userID}Checkbox" id="geoDM${userID}Label">
            <img id="${userID}_profPic" src=${nearbyUsers[userID].profilePic} class="geoDMProfilePic">
            <span id="${userID}_name">${nearbyUsers[userID].name}</span>
            <br>
            <small>${(distanceFrom / 3280.84).toFixed()} ft away</small>
            </label>
            <input type="checkbox" name="availableChatters" value="${userID}"  id="geoDM${userID}Checkbox">
            `;
            $('#availableChatters').controlgroup("container").prepend(checkboxContainer);
            $("#availableChatters")
                .enhanceWithin()
                .controlgroup("refresh");

        }

    }
}

function popupAlert(msg, color, time) {
    $("#alertMsg").text(msg);
    $("#alertMsg").css('color', color);
    $("#alertPopup").popup('open');
    setTimeout(()=>{
        $("#alertPopup").popup('close');

    }, time);

}