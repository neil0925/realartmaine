// background.js - toggles tiled background from /assets/GUI/tile
// background.js - always-enabled tiled background (400px tiles)
(function(){
  function applyTile(size){
    document.body.style.backgroundImage = "url('/assets/GUI/tile.png')";
    document.body.style.backgroundRepeat = 'repeat';
    document.body.style.backgroundSize = size + 'px ' + size + 'px';
    document.body.style.backgroundAttachment = 'fixed';
  }

  function init(){
    var size = 400;
    try{
      // allow an override via localStorage if previously set programmatically
      var saved = parseInt(localStorage.getItem('ram_tile_size') || '', 10);
      if(!isNaN(saved) && saved >= 8) size = saved;
    }catch(e){}
    applyTile(size);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
