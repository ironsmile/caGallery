
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

// function debug(str){
//   $('debug').insert(str.toString()+'<br />');
// }

caGallery = {
  
  init : function( pics, cfgs ){
    caGallery.PICTURES = pics;
    caGallery.configs.update(cfgs);
    var gal = $(caGallery.configs.get('album_div'));
    gal.update('<img src="'+caGallery.configs.get('gallery_loader_pic')+'" alt="Loading..." />');
    $(window.document.body).insert(caGallery.slideshowHtml);
    caGallery.populateGallery(0, caGallery.configs.get("images_per_page"));
  },
  
  configs : $H({
    'holder' : "slideshow_holder",
    'loading_pic' : "images/ajax.gif",
    'gallery_loader_pic' : "images/gallery-loader.gif",
    'new_window_pic' : "images/open.png",
    'album_div' : "gallery_album",
    'shrink_to_screen' : true,
    'thumb_container_height' : 160,
    'images_per_page' : 15
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
    var gal = $(caGallery.configs.get('album_div'));
    gal.update('<img src="'+caGallery.configs.get('gallery_loader_pic')+'" alt="Loading..." />');
    
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
  
  populateGallery : function(start, end){
    var gal = $(caGallery.configs.get('album_div'));
    var cont_height = parseInt(caGallery.configs.get("thumb_container_height"));
    var all_pics_count = caGallery.PICTURES.length;
    var per_page = parseInt(caGallery.configs.get("images_per_page"));
    
    gal.update('<div style="clear:both;"></div>');
    end = (all_pics_count < end) ? all_pics_count : end;
    for( var i=start; i < end; i++ ){
      var im = new Element("img", { src : caGallery.PICTURES[i].thumb });
      im.setStyle( { position : 'relative' } );
      im.observe('load', function(e){ 
        var img = e.element();
        var tp = Math.abs((cont_height - img.height))/2;
        img.setStyle({top : tp});
        img.parentNode.setStyle({ backgroundImage : 'none' });
      });
      gal.insert( (new Element("div", {'class':"gallery_picture_holder"})).update(im).observe( 'click', caGallery.__eventShowImg(i) ) );
    }
    
    var pages = [];
    var pages_count = all_pics_count/per_page;
    if(all_pics_count%per_page){
      pages_count += 1;
    }
    for( var i = 1; i < pages_count; i++){
      if((i-1)*per_page == start){
        pages[pages.length] = '<span class="selected_page">'+i+'</span>';
      } else {
        pages[pages.length] = '<a href="javascript:void(0);" onclick="caGallery.toPage('+i+');">'+i+'</a>';
      }
    }
    gal.insert('<div style="clear:both;"></div><p>'+pages.join(" | ")+'</p>');
  },

  toPage : function(ind){
    if(ind < 1){ ind = 1; }
    var per_page = parseInt(caGallery.configs.get("images_per_page"));
    caGallery.populateGallery((ind-1)*per_page, ind*per_page);
  },
  
  __eventShowImg : function( ind ){ // lambda-like func
    return function(){ caGallery.showImg(ind);  };
  },
  
  showImg : function( ind ){
    caGallery.CURRENT_IMG_INDEX = typeof(ind) == 'undefined' ? 0 : ind;
    caGallery.changeImg();
    $("slideshow_background").show();
    $("slideshow_container").setStyle({ top : document.viewport.getScrollOffsets().top }).appear();
    caGallery.addShortcutListeners();
  },

  changeImg : function( ind ){
    ind = typeof(ind) == 'undefined' ? 0 : ind;
    var current_index = caGallery.CURRENT_IMG_INDEX += parseInt(ind);
    
    if( current_index == -1 ) current_index = caGallery.PICTURES.length-1;
    current_index = current_index % caGallery.PICTURES.length;
    var img_src = caGallery.PICTURES[ current_index ].src;
    caGallery.CURRENT_IMG_INDEX = current_index;
    
    var info = (current_index+1)+' / '+(caGallery.PICTURES.length);
    info += ' <a target="_blank" href="'+escape(img_src)+'"> \
                <img style="vertical-align:middle" src="'+caGallery.configs.get('new_window_pic')+'" alt="nw" title="open in new window" /> \
              </a>';
    
    // showing the loading image
    $(caGallery.configs.get('holder')).update('<img src="'+caGallery.configs.get('loading_pic')+'" alt="" />');
    var img = $(new Image());
    img.observe('load', function(e){
      var i = e.target.setStyle({ display : "none" });
      var sizes = caGallery.getSlideShowImageSize(i);
      iwidth = sizes['width'];
      iheight = sizes['height'];
      
      i.writeAttribute({"width" : iwidth, "height" : iheight});
      i.setStyle({"width" : iwidth, "height" : iheight});

      $(caGallery.configs.get('holder')).centerChangeSize([ iwidth, iheight ]);
      if(caGallery.timer){ clearTimeout(caGallery.timer); }
      caGallery.timer = setTimeout( function(){
        var hldr = caGallery.configs.get('holder');
        $(hldr).update(i);
        i.appear({ duration : 0.25 });
        $(hldr).insert('<div id="info">'+info+'</div>');
      }, 1000 );
      
    });
    
    img.src = img_src;
  },

  getSlideShowImageSize : function(i){
    // if shrink_to_screen is set to 'no'
    if(!caGallery.configs.get('shrink_to_screen')){
      return {'width':i.width, 'height':i.height};
    }
  
    // making sure the image fits in the max height/width dimensions
    var max_width = window.innerWidth-15 ;
    var max_height = window.innerHeight-80 ;// -80 to fit the controls in
    
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

    return {'width':iwidth, 'height':iheight};
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
      shortcut.add('escape', function(){ caGallery.closeSlideshow(); })
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
  
