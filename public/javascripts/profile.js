var iframe = document.querySelector('#iframe-soundcloud');
iframe.src = '//w.soundcloud.com/player/?url=http://api.soundcloud.com';

var widget = SC.Widget(iframe);
widget.load('https://soundcloud.com/tennisinc', {
  'auto_play': 1
});
