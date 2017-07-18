// Hover play video

function createVideoElement(id) {
  var video = document.createElement('video');

  video.autoplay = true;
  video.preload = true;
  video.loop = true;
  video.muted = true;
  video.controls =false;

  var sourceMP4 = document.createElement("source");
  sourceMP4.type = "video/mp4";
  sourceMP4.src = '/files/mp4_360p/' + id + '.mp4';

  var sourceWEBM = document.createElement("source");
  sourceWEBM.type = "video/webm";
  sourceWEBM.src = '/files/webm_360p/' + id + '.webm';

  video.appendChild(sourceMP4);
  video.appendChild(sourceWEBM);

  return video;
}



$('.video-golink').hover( hoverVideo, hideVideo );
function hoverVideo(e) {
  var id = $(this).attr('loop-id');
  var videoContainer = $('.video-container', this);
  var videoCover = $('.video-cover', this);

  videoContainer.append(createVideoElement(id));

  var video = $('video', videoContainer);
  video.attr('webkit-playsinline', '');
  video.attr('playsinline', '');

  video.bind("canplaythrough", function() {
    video[0].play();
    videoCover.css('display', 'none');
    videoContainer.css('display', 'inherit');
  });
}
function hideVideo(e) {
  var id = $(this).attr('loop-id');
  var videoCover = $('img', this);
  var videoContainer = $('.video-container', this);
  var video = $('video', videoContainer);

  videoCover.css('display', 'inherit');
  videoContainer.css('display', 'none');
  videoContainer.empty();
}

// Check mobile touch event
if (Modernizr.touchevents) {
  $('.video-golink').on('click', function () {
    return false;
  });

  // Double tap event
  var golinks = document.getElementsByClassName('video-golink');
  for (let i = 0; i < golinks.length; i++) {
    (new Hammer(golinks[i])).on('doubletap', function() {
      location.href = golinks[i].href;
    });
  }
}

var stay = false;
var pressure = 'off';

// 3D Touch event
Pressure.set('.video-golink', {
  change: function(force) {
    var videoContainer = $('#modal-' + this.id + ' .video-container');
    var id = videoContainer.attr('loop-id');

    if (force < 0.2) {
      if (!stay && pressure != 'off') {
        pressure = 'off';
        $('#modal-' + this.id).modal('hide');

        videoContainer.empty();
      }
    } else if (force >= 0.2 && force < 0.6) {
      if (!stay && pressure != 'lightpress') {
        ga('send', 'event', 'LoopCard', '3D Touch', 'Light Press');

        pressure = 'lightpress';
        $('#modal-' + this.id).modal({
          focus: false,
          show: true
        });


        videoContainer.append(createVideoElement(id));
        var video = $('video', videoContainer);
        video.attr('webkit-playsinline', '');
        video.attr('playsinline', '');

      }
    } else if (force >= 0.6 && force <= 0.98) {
      if (!stay && pressure != 'deeppress') {
        ga('send', 'event', 'LoopCard', '3D Touch', 'Deep Press');

        pressure = 'deeppress';
        stay = true;

        var id = this.id;
        $('#modal-' + id + ' video')[0].play();
        $('#modal-' + id + ' button').removeClass('hide');
        $('#modal-' + id).addClass('stay');
        $('#modal-' + id + ' .modal-dialog').addClass('bounceIn animated');

        $('#modal-' + id).on('hidden.bs.modal', function (e) {
          stay = false;
          $('#modal-' + id + ' video')[0].pause();
          $('#modal-' + id + ' .modal-dialog').removeClass('bounceIn animated');
          $('#modal-' + id).removeClass('stay');
          $('#modal-' + id + ' button').addClass('hide');
        });
      }
    } else {
      // window.location = this.href;
    }
  }
}, {
  only: 'touch',
  preventSelect: false
});