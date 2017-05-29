$('.video-container.manual-play').hover( hoverVideo, hideVideo );
function hoverVideo(e) { $('video', this).get(0).play(); }
function hideVideo(e) { $('video', this).get(0).pause(); }

if (Modernizr.touchevents) {
  $('.video-golink').on('click', function () {
    return false;
  });

  var golinks = document.getElementsByClassName('video-golink');
  for (let i = 0; i < golinks.length; i++) {
    (new Hammer(golinks[i])).on('doubletap', function() {
      location.href = golinks[i].href;
    });
  }
}
