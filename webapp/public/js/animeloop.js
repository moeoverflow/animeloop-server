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
        ga('send', 'event', 'LoopCard', '3D Touch', 'Light Press');

        pressure = 'lightpress';
        $('#modal-' + this.id).modal({
          focus: false,
          show: true
        });
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
      window.location = this.href;
    }
  }
}, {
  only: 'touch',
  preventSelect: false
});