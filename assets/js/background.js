// background.js - toggles tiled background from /assets/GUI/tile
(function(){
  function applyTile(enabled, size){
    if(enabled){
      document.body.style.backgroundImage = "url('/assets/GUI/tile.png')";
      document.body.style.backgroundRepeat = 'repeat';
      document.body.style.backgroundSize = size + 'px ' + size + 'px';
      document.body.style.backgroundAttachment = 'fixed';
    } else {
      document.body.style.backgroundImage = '';
      document.body.style.backgroundSize = '';
      document.body.style.backgroundRepeat = '';
      document.body.style.backgroundAttachment = '';
    }
  }

  function init(){
    var toggle = document.getElementById('tileToggle');
    var sizeInput = document.getElementById('tileSizeInput');
    if(!toggle || !sizeInput) return;

    // load saved values
    try{
      var savedEnabled = localStorage.getItem('ram_tile_enabled') === '1';
      var savedSize = parseInt(localStorage.getItem('ram_tile_size') || '64',10);
      toggle.checked = savedEnabled;
      sizeInput.value = savedSize;
      applyTile(savedEnabled, savedSize);
    }catch(e){}

    toggle.addEventListener('change', function(){
      var enabled = toggle.checked;
      var size = Math.max(8, Math.min(1024, parseInt(sizeInput.value || '64',10)));
      try{ localStorage.setItem('ram_tile_enabled', enabled? '1':'0'); localStorage.setItem('ram_tile_size', String(size)); }catch(e){}
      applyTile(enabled, size);
    });

    sizeInput.addEventListener('change', function(){
      var size = Math.max(8, Math.min(1024, parseInt(sizeInput.value || '64',10)));
      sizeInput.value = size;
      var enabled = toggle.checked;
      try{ localStorage.setItem('ram_tile_size', String(size)); }catch(e){}
      applyTile(enabled, size);
    });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
