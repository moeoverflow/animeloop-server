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
  start: function(event) {
    // $('#test').innerHTML = event.
    // alert('start');
    // this is called on force start

  },
  end: function() {
    // alert('end');
    // this is called on force end
  },
  startDeepPress: function(event) {
    stay = true;
    $('#modal-' + this.id).addClass('stay');
    $('#modal-' + this.id + ' .modal-dialog').addClass('bounceIn animated');

    $('#modal-' + this.id).on('hidden.bs.modal', function (e) {
      stay = false;
      $('#modal-' + this.id + ' .modal-dialog').removeClass('bounceIn animated');
      $('#modal-' + this.id).removeClass('stay');
    });
    // alert('startDeepPress');
    // this is called on "force click" / "deep press", aka once the force is greater than 0.5
  },
  endDeepPress: function() {
    // alert('endDeepPress');
    // this is called when the "force click" / "deep press" end
  },
  change: function(force, event) {
    if (force < 0.1) {
      if (!stay && status != 'hidemodal') {
        status = 'hidemodal';
        $('#modal-' + this.id).modal('hide');
      }

    } else if (force >= 0.1 && force <= 0.98) {
      if (!stay && status != 'showmodal') {
        status = 'showmodal';
        $('#modal-' + this.id).modal({
          focus: false,
          show: true
        });
      }
    } else {
      var golink = this;
      window.location = golink.href;
    }
  },
  unsupported: function() {
  }
});