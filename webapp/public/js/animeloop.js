// Hover play video
$('.video-container.manual-play').hover( hoverVideo, hideVideo );
function hoverVideo(e) {
  var video = $('video', this).get(0);
  var isPlaying = video.currentTime > 0 && !video.paused && !video.ended
    && video.readyState > 2;

  if (!isPlaying) {
    video.play();
  }
}
function hideVideo(e) { $('video', this).get(0).pause(); }

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
    if (force < 0.2) {
      if (!stay && pressure != 'off') {
        pressure = 'off';
        $('#modal-' + this.id).modal('hide');
      }
    } else if (force >= 0.2 && force < 0.6) {
      if (!stay && pressure != 'lightpress') {
        pressure = 'lightpress';
        $('#modal-' + this.id).modal({
          focus: false,
          show: true
        });
      }
    } else if (force >= 0.6 && force <= 0.98) {
      if (!stay && pressure != 'deeppress') {
        pressure = 'deeppress';
        stay = true;

        $('#' + this.id + ' video')[0].play();
        $('#modal-' + this.id + ' button').removeClass('hide');
        $('#modal-' + this.id).addClass('stay');
        $('#modal-' + this.id + ' .modal-dialog').addClass('bounceIn animated');

        $('#modal-' + this.id).on('hidden.bs.modal', function (e) {
          stay = false;
          $('#' + this.id + ' video')[0].pause();
          $('#modal-' + this.id + ' .modal-dialog').removeClass('bounceIn animated');
          $('#modal-' + this.id).removeClass('stay');
          $('#modal-' + this.id + ' button').addClass('hide');
        });
      }
    } else {
      window.location = this.href;
    }
  }
}, {
  only: 'touch',
  preventSelect: false
});