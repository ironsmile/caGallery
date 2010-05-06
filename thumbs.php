<?php

  /*
  * Config
  */
  
  $thumbs_dir = dirname(__FILE__)."/files/thumbs/";
    
  /*
  * Prepearing
  */
    
  header('Content-Type: image/png');
    
  /*
  * Work
  */
    
  if(!is_dir($thumbs_dir)){
    mkdir($thumbs_dir, 0777, true);
  }
  
  $src = urldecode($_GET['src']);
  $force = isset($_GET['force']);
  $size = isset($_GET['size']) ? (int)$_GET['size'] : 150;
  
  $thum_fname = $thumbs_dir.md5_file($src).'.png';
  if($force or !is_file($thum_fname)){
    exec('convert '.escapeshellarg($src).' -resize '.$size.'x'.$size.' '.escapeshellarg($thum_fname), $output, $ext_sts);
  }
  
  readfile($thum_fname);
  exit;
  
?>
