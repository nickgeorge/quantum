var root_ = 'media/sounds/';

SoundManager = {

  play: function(sound, opt_callback) {
    var audio = new Audio(root_ + sound);
    audio.addEventListener('ended', function() {
      if (opt_callback) opt_callback();  
    }, false);
    audio.addEventListener('canplaythrough', function() {
      // audio.play();
    }, false);
    return audio;
  }
}

Sounds = {
  // ARROW: 'arrow_short.wav',
  // METAL_EXPLOSION: 'metal_explosion.wav',
  // GLASS: 'glass_short.wav',
  // POP: 'pop_short.wav',
  // OW: 'ow.mp3',
  // JUMP: 'jump.mp3',
  // SHU: 'shu.mp3',
  // WALK: 'walk.mp3',
}
