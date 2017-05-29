$('.video-container.manual-play').hover( hoverVideo, hideVideo );
function hoverVideo(e) { $('video', this).get(0).play(); }
function hideVideo(e) { $('video', this).get(0).pause(); }


if (Modernizr.touchevents) {
  $('.video-golink').on('click', function () {
    return false;
  });

  var golinks = document.getElementsByClassName('video-golink');
  if (golinks.length > 0) {
    new Hammer(golinks[0], { taps: 2 }).on('doubletap', function(ev) {
      window.location = golink[0].href;
    });
  }
}
