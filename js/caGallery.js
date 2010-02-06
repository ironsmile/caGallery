
Element.addMethods({

  centerChangeSize : function(element, params){
    var new_width = ( typeof(params['width']) != 'undefined' ) ? params['width'] : params[0];
    var new_height = ( typeof(params['height']) != 'undefined' ) ? params['height'] : params[1];
    var eid = element.identify();
    new Effect.Morph( element, { duration: 0.45, style: "height:"+new_height+"px;" , queue : { scope : eid+"resize" } } );
    new Effect.Morph( element, { duration: 0.45, style: "width:"+new_width+"px;" , queue : { position : "end", scope : eid+"resize" } } );
    return element;
  }
  
});

function debug(str){
  $('debug').insert(str.toString()+'<br />');
}

caGallery = {
  
  init : function( pics, cfgs ){
    caGallery.PICTURES = pics;
    caGallery.configs.update(cfgs);
    caGallery.createGallery();
  },
  
  configs : $H({
    'holder' : "slideshow_holder",
    'loading_pic' : "images/ajax.gif",
    'album_div' : "gallery_album",
    'max_picture_size' : "1200x800",
    'thumb_container_height' : 160
  }),
  
  PICTURES : [],
  
  CURRENT_IMG_INDEX : 0,
  
  timer : null, // used in the slideshow to wait for the window resizing
  
  /**
  *
  * Loaders
  *
  */
  
  load_from_ajax : function(src){
    
    new Ajax.Request(src, {
      method: 'get',
      onSuccess: function(transport) {
        var pics_array = JSON.parse(transport.responseText);
        caGallery.init(pics_array);
      },
      onFailure : function(transport){
        alert("Error with your ajax request!");
      }
    });
    
  },
  
  
  /**
  * 
  * Functions!
  * 
  */
  
  createGallery : function(){
    var gal = $(caGallery.configs.get('album_div'));
    var cont_height = parseInt(caGallery.configs.get("thumb_container_height"));
    for( var i=0; i < caGallery.PICTURES.length; i++ ){
      var im = new Element("img", { src : caGallery.PICTURES[i].thumb });
      im.setStyle( { position : 'relative' } );
      im.observe('load', function(e){ 
        var img = e.element();
        var tp = Math.abs((cont_height - img.height))/2;
        img.setStyle({top : tp});
        img.parentNode.setStyle({ backgroundImage : 'none' });
      });
      gal.insert( (new Element("div", {class:"gallery_picture_holder"})).update(im).observe( 'click', caGallery.__eventShowImg(i) ) );
    }
    
    $(window.document.body).insert(caGallery.slideshowHtml);
  },
  
  __eventShowImg : function( ind ){ // lambda-like func
    return function(){ caGallery.showImg(ind);  };
  },
  
  showImg : function( ind ){
    caGallery.CURRENT_IMG_INDEX = typeof(ind) == 'undefined' ? 0 : ind;
    caGallery.changeImg();
    $("slideshow_background").setStyle({width : document.viewport.getWidth(), height : document.viewport.getHeight()}).show();
    $("slideshow_container").setStyle({ top : 3 }).appear();
    caGallery.addShortcutListeners();
  },

  changeImg : function( ind ){
    ind = typeof(ind) == 'undefined' ? 0 : ind;
    caGallery.CURRENT_IMG_INDEX += parseInt(ind);
    if( caGallery.CURRENT_IMG_INDEX == -1 ) caGallery.CURRENT_IMG_INDEX = caGallery.PICTURES.length-1;
    
    // showing the loading image
    $(caGallery.configs.get('holder')).update('<img src="'+caGallery.configs.get('loading_pic')+'" alt="" />');
    var img = $(new Image());
//     img._configs = caGallery.configs; // so some stuff can be used onload of the picture
    img.observe('load', function(e){
      var i = e.target.setStyle({ display : "none" });
      
      // making sure the image fits in the max height/width dimensions
      var sizemtach = caGallery.configs.get('max_picture_size').match(/^([\d]+)x([\d]+)$/);
      if( sizemtach ){
        var max_width = sizemtach[1];
        var max_height = sizemtach[2];
      } else {
        var max_width = window.viewport.getWidth();
        var max_height = window.viewport.getHeight();
      }
      if( i.width > max_width || i.height > max_height ){
        if( i.width > max_width && i.height <= max_height ){
          var coef = i.width / max_width ;
        } else if( i.width <= max_width && i.height > max_height ){
          var coef = i.height / max_height ;
        } else {
          var coef = i.height / max_height;
          coef = ( i.width / max_width > coef ) ? i.width / max_width : coef ;
        }
        var iwidth = parseInt(i.width/coef);
        var iheight = parseInt(i.height/coef);
      } else { var iwidth = i.width; var iheight = i.height; }
      i.writeAttribute({"width" : iwidth, "height" : iheight});
      i.setStyle({"width" : iwidth, "height" : iheight});

      $(caGallery.configs.get('holder')).centerChangeSize([ iwidth, iheight ]);
      if(caGallery.timer){ clearTimeout(caGallery.timer); }
      caGallery.timer = setTimeout( function(){
        $(caGallery.configs.get('holder')).update(i); i.appear({ duration : 0.25 }); 
      }, 1000 );
    });
    
    img.src = caGallery.PICTURES[ caGallery.CURRENT_IMG_INDEX % caGallery.PICTURES.length ].src;
  },
  
  closeSlideshow : function(){
    $("slideshow_background").fade({duration:0.20});
    $("slideshow_container").fade({duration:0.20});
    caGallery.removeShortcutListeners();
  },
  
  addShortcutListeners : function(){
    if(typeof(window['shortcut']) != 'undefined'){
      shortcut.add('right', function(){ caGallery.changeImg(1); });
      shortcut.add('left', function(){ caGallery.changeImg(-1); });
      shortuct.add('escape', function(){ caGallery.closeSlideshow(); })
    }
  },
  
  removeShortcutListeners : function(){
    if(typeof(window['shortcut']) != 'undefined'){
      shortcut.remove('right');
      shortcut.remove('left');
      shortcut.remove('escape');
    }
  }

}

caGallery.slideshowHtml = ' \
  <div id="slideshow_background" style="display:none;"></div> \
    <div id="slideshow_container" style="display:none;"> \
    \
      <div id="slideshow_controls"> \
        <a id="slideshow_button_prev" onclick="caGallery.changeImg(-1); return false;">&nbsp;</a> \
        <a id="slideshow_button_close" onclick="caGallery.closeSlideshow(); return false;">&nbsp;</a> \
        <a id="slideshow_button_next" onclick="caGallery.changeImg(1); return false;">&nbsp;</a> \
      </div> \
      <div id="'+caGallery.configs.get('holder')+'"> \
        <img src="'+caGallery.configs.get('loading_pic')+'" /> \
      </div> \
      \
    </div> \
  ';
  
