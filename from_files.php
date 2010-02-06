<?php
  
  /*
  * Config!
  */
  
  $pics_dir = isset($_GET['dir']) ? rtrim(urldecode($_GET['dir']), '/').'/' : 'files/images/' ;
//   $pics_dir = dirname(__FILE__)."/".trim($dir, '/').'/';
  
  /*
  * Work
  */
  
  if(!is_dir($pics_dir)){
    exit();
  }
  
  $pictures = array();
  $d = dir($pics_dir);
  while (false !== ($entry = $d->read())) {
    $full_name = $d->path.$entry;
    if(is_dir($full_name)){
      continue;
    }
    $iinfo = getimagesize($full_name); //IMAGETYPE_XXX
    if(!in_array( $iinfo[2], array(IMAGETYPE_PNG, IMAGETYPE_JPEG, IMAGETYPE_GIF) )) continue;
    $pictures[] = array( 'src' => $full_name, 
                         'thumb' => 'thumbs.php?src='.htmlspecialchars(urlencode($full_name)) );
  }
  $d->close();
  
  print json_encode($pictures);
  
?>
