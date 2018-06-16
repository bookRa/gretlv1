//For the Crumb Upload
// var uploadCrumbImg; 
// (function ($) {
//   $.extend({
//     uploadPreview: function (options) {
      
//       // Options + Defaults
//       var settings = $.extend({
//         input_field: "#image-upload",
//         preview_box: ".image-preview",
//         label_field: "#image-label",
//         label_default: "Choose File",
//         label_selected: "Change File",
//         no_label: false,
//         success_callback: null,
//       }, options);
      
//       // Check if FileReader is available
//       if (window.File && window.FileList && window.FileReader) {
//         if (typeof ($(settings.input_field)) !== 'undefined' && $(settings.input_field) !== null) {
//           $(settings.input_field).change(function () {
//             var files = this.files;
            
//             if (files.length > 0) {
//               var file = files[0];
//               loadImage(
//                 file,
//                 function (img) {
//                   //Set the image blob to be uploaded
//                   img.toBlob((blob)=>{
//                     uploadCrumbImg= blob; 
//                     console.log(uploadCrumbImg);
//                   }, 'image/jpeg', .7);
//                   // Check format
//                   if (file.type.match('image')) {
//                     // Image
//                     $(settings.preview_box).css("background-image", "url(" + img.toDataURL('image/jpeg', 0.7) + ")");
//                     $(settings.preview_box).css("background-size", "cover");
//                     $(settings.preview_box).css("background-position", "center center");
//                   } else if (file.type.match('audio')) {
//                     // Audio
//                     $(settings.preview_box).html("<audio controls><source src='" + img.toDataURL() + "' type='" + file.type + "' />Your browser does not support the audio element.</audio>");
//                   } else {
//                     alert("This file type is not supported yet.");
//                   }
//                   if (settings.no_label == false) {
//                     // Change label
//                     $(settings.label_field).html(settings.label_selected);
//                   }
    
//                   // Read the file
//                   // reader.readAsDataURL(file);
    
//                   // Success callback function call
//                   if (settings.success_callback) {
//                     settings.success_callback();
//                   }
                  
//                 },
//                 {
//                   // maxWidth: 50,
//                   orientation: true,
//                   canvas: true
//                 }
//               )

//               // console.log(otherImage);

//             } else {
//               if (settings.no_label == false) {
//                 // Change label
//                 $(settings.label_field).html(settings.label_default);
//               }

//               // Clear background
//               $(settings.preview_box).css("background-image", "none");

//               // Remove Audio
//               $(settings.preview_box + " audio").remove();
//             }
//           });
//         }
//       } else {
//         alert("You need a browser with file reader support, to use this form properly.");
//         return false;
//       }
//     }
//   });
// })(jQuery);


// var uploadProfilePic
// For Profile Picture Update
(function ($) {
  $.extend({
    uploadPreview: function (options) {
      
      // Options + Defaults
      var settings = $.extend({
        input_field: "#updateProfilePic",
        preview_box: "#profilePicPreview",
        label_field: "#profilePicLabel",
        label_default: "Choose File",
        label_selected: "Change File",
        no_label: false,
        success_callback: null,
      }, options);
      
      // Check if FileReader is available
      if (window.File && window.FileList && window.FileReader) {
        if (typeof ($(settings.input_field)) !== 'undefined' && $(settings.input_field) !== null) {
          $(settings.input_field).change(function () {
            var files = this.files;
            
            if (files.length > 0) {
              var file = files[0];
              loadImage(
                file,
                function (img) {
                  //Set the image blob to be uploaded
                  img.toBlob((blob)=>{
                    if(settings.img_to_upload=="crumb"){
                      uploadCrumbImg= blob; 
                      
                    } else if(settings.img_to_upload=="profilePic"){
                      uploadProfilePic= blob; 

                    }
                    // console.log(settings.img_to_upload);
                  }, 'image/jpeg', .7);
                  // Check format
                  if (file.type.match('image')) {
                    // Image
                    $(settings.preview_box).css("background-image", "url(" + img.toDataURL('image/jpeg', 0.7) + ")");
                    $(settings.preview_box).css("background-size", "cover");
                    $(settings.preview_box).css("background-position", "center center");
                  } else if (file.type.match('audio')) {
                    // Audio
                    $(settings.preview_box).html("<audio controls><source src='" + img.toDataURL() + "' type='" + file.type + "' />Your browser does not support the audio element.</audio>");
                  } else {
                    alert("This file type is not supported yet.");
                  }
                  if (settings.no_label == false) {
                    // Change label
                    $(settings.label_field).html(settings.label_selected);
                  }
    
                  // Read the file
                  // reader.readAsDataURL(file);
    
                  // Success callback function call
                  if (settings.success_callback) {
                    settings.success_callback();
                  }
                  
                },
                {
                  // maxWidth: 50,
                  orientation: true,
                  canvas: true
                }
              )

              // console.log(otherImage);

            } else {
              if (settings.no_label == false) {
                // Change label
                $(settings.label_field).html(settings.label_default);
              }

              // Clear background
              $(settings.preview_box).css("background-image", "none");

              // Remove Audio
              $(settings.preview_box + " audio").remove();
            }
          });
        }
      } else {
        alert("You need a browser with file reader support, to use this form properly.");
        return false;
      }
    }
  });
})(jQuery);
