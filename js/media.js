var video= document.getElementById('videoElement');
var canvas= document.getElementById('canv');
var context= canvas.getContext('2d');

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;

if(navigator.getUserMedia){
    navigator.getUserMedia({video: true}, streamWebCam, throwError);
}

function streamWebCam(stream){
    video.src= window.URL.createObjectURL(stream);
    video.play();

}

function throwError(e){
    // alert(e.name);

}

function snap(){
    canvas.width=video.videoWidth;
    canvas.height=video.videoHeight;
    context.drawImage(video, 0, 0);
    document.getElementById('displayImg').src= canvas.toDataURL('image/webp');
}




