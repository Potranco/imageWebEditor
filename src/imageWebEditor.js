
function imageWebEditor(image,imgResponseId){
  this.width=320;
  this.height=480;

  this.canvas=this.createCanvas();
  this.ctx=this.canvas.getContext('2d');

  this.urlImage=image;
  this.image=false;
  this.loadImage(this.urlImage);
  this.imgResponseId=imgResponseId;
  this.auxImage=false;
  this.imageReBase=false;
  document.getElementById(imgResponseId).style.background='url('+this.urlImage+') no-repeat center center';
  document.querySelector('#'+imgResponseId+' div').style.background='rgba(0, 0, 0, 0.5)';
  document.querySelector('#'+imgResponseId+' div').style.opacity='0.6';
  document.getElementById(imgResponseId).style.textAlign='center';
  this.rotate=0;
  this.positionX=0;
  this.positionY=0;
  this.dragImage=false;
  this.dragPosition={
    initX:0,
    goToX:0,
    initY:0,
    goToY:0,
    };
  this.scale=0;
  this.grayScaleAction=false;
  this.imageFilterAction=[];
   
  
  self=this;

  document.querySelector('#'+this.imgResponseId+' img').onmousedown=function (e){
    self.initMoveImage(e);
  }
  document.querySelector('#'+this.imgResponseId+' img').onmouseup=function (e){
    self.closeMoveImage(e);
  }

  document.querySelector('#'+this.imgResponseId+' img').addEventListener('mouseup',this.desactiveDragDrop,false);
  
}

imageWebEditor.prototype.constructor=function(){};

imageWebEditor.prototype.loadImage=function(url){
  this.image=new Image;
  this.image.setAttribute('crossOrigin', 'anonymous');
  this.image.src=url;
  self=this;
  
  this.image.onload=function(e){
    self.imageReBase=this;
    self.centerImage();
    self.returnImage();
  };
};

imageWebEditor.prototype.cleanctx=function(){
  this.ctx.fillStyle='#000';
  this.ctx.fillRect(0,0,this.width,this.height);  
};

imageWebEditor.prototype.drawImage=function(){
  this.cleanctx();
  this.ctx.drawImage(this.image,0,0);
};

imageWebEditor.prototype.centerImage=function(){
    this.cleanctx();
    imageleft=((this.image.width/2)*-1)+this.canvas.width/2;
    imagetop=((this.image.height/2)*-1)+this.canvas.height/2; 
    
    this.ctx.drawImage(this.image,imageleft,imagetop,this.image.width,this.image.height);
    this.positionX=imageleft;
    this.positionY=imagetop;
    this.scale=0;
    this.applyAllFilters();
    this.returnImage();
};

imageWebEditor.prototype.returnImage=function(){
  document.querySelector('#'+this.imgResponseId+' img').src=this.canvas.toDataURL('image/png');
};

imageWebEditor.prototype.imageClean=function(){
  this.loadImage();
};

imageWebEditor.prototype.createCanvas=function(){
  var canvas = document.createElement('canvas');
  canvas.id = "canvasImage";
  canvas.width=this.width;
  canvas.height=this.height;
  return canvas;    
};


imageWebEditor.prototype.rotateAngle=function(angle) {
  if (this.scale>0) {
    auxImage=new Image();
    auxImage.src=this.canvas.toDataURL('image/png');
 }
 else {
    auxImage=this.image;
 }
 this.rotate=this.rotate+angle;
 this.cleanctx();
 this.ctx.save();
 this.ctx.translate(this.width/2,this.height/2);
 this.ctx.rotate(this.rotate*Math.PI/180);
 imageleft=((this.image.width/2)*-1)+this.canvas.width/2;
 imagetop=((this.image.height/2)*-1)+this.canvas.height/2;
 this.ctx.drawImage(auxImage,-auxImage.width/2,-auxImage.height/2);
 this.ctx.restore();
 this.applyAllFilters();
 this.returnImage();
}

imageWebEditor.prototype.flipVertical=function () {

 this.auxImage=new Image();
 this.auxImage.src=this.canvas.toDataURL('image/png');

 imageleft=this.auxImage.width;
 imagetop=this.auxImage.height;
 
 this.cleanctx();
 this.ctx.save();
 this.ctx.translate(0, this.height);
 this.ctx.scale(1, -1);
 this.ctx.drawImage(this.auxImage, 0, 0);
 this.ctx.restore();
 this.returnImage();
}

imageWebEditor.prototype.flipHorizontal=function () {
 this.auxImage=new Image();
 this.auxImage.src=this.canvas.toDataURL('image/png');

 imageleft=this.auxImage.width;
 imagetop=this.auxImage.height;
 
 this.cleanctx();
 this.ctx.save();
 this.ctx.translate(this.width, 0);
 this.ctx.scale(-1, 1);
 
 this.ctx.drawImage(this.auxImage,0,0);
 this.ctx.restore();
 this.returnImage();
}

imageWebEditor.prototype.grayScale=function () {

 this.ctx.save();
 var imgWidth=this.image.width;
 var imgHeight=this.image.height;
 this.image.crossOrigin="anonymous";
 var imageData = this.ctx.getImageData(0, 0, imgWidth, imgHeight);

 for (j=0; j<imageData.height; j++) {
   for (i=0; i<imageData.width; i++) {
     var index=(i*4)*imageData.width+(j*4);
     var red=imageData.data[index];
     var green=imageData.data[index+1];
     var blue=imageData.data[index+2];
     var alpha=imageData.data[index+3];
     var average=(red+green+blue)/3;
     imageData.data[index]=average;
     imageData.data[index+1]=average;
     imageData.data[index+2]=average;
     imageData.data[index+3]=alpha;
    }
 }

 this.cleanctx();
 this.ctx.putImageData(imageData, 0, 0);
 this.grayScaleAction=true;
 this.returnImage();
}

imageWebEditor.prototype.scaleImage=function(){
    this.cleanctx();
    imageleft=(this.image.width/4)*-1;
    imagetop=(this.image.height/4)*-1;
    this.ctx.drawImage(this.image,0,0,this.canvas.width,this.canvas.height);
    this.scale=100;
    this.applyAllFilters();
    this.positionX=0;
    this.positionY=0;
    this.returnImage();
};


imageWebEditor.prototype.imageFilter=function (filter,saveFilter) {

var imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
this.ctx.save();
var lengthArray = imageData.data.length;

switch (filter){
 case 'brillo+':
   imageData=this.brightness(imageData,lengthArray,1.3);
 break;
 case 'brillo-':
   imageData=this.brightness(imageData,lengthArray,0.7);
 break;
 case 'sepia':
   imageData=this.sepia(imageData,lengthArray);
 break;
 case 'invertColors':
   imageData=this.invertColors(imageData,lengthArray);
 break;
case 'grayScale':
   imageData=this.grayScale();
   if (saveFilter!=false) this.imageFilterAction.push(filter);
   return true;
 break;
 default: return false;
}

if (saveFilter!=false) this.imageFilterAction.push(filter);


this.cleanctx();
this.ctx.putImageData(imageData, 0, 0);
this.returnImage();

return lengthArray;
}

imageWebEditor.prototype.sepia=function (imageData,lengthArray) {

for(var i = 0; i < lengthArray; i += 4) {
  var red = imageData.data[i];
  var green = imageData.data[i + 1];
  var blue = imageData.data[i + 2];
  var alpha = imageData.data[i + 3];

  var outRed = (red * .393) + (green *.769) + (blue * .189); // calculate value for red channel in pixel
  var outGreen = (red * .349) + (green *.686) + (blue * .168);
  var outBlue = (red * .272) + (green *.534) + (blue * .131);

  imageData.data[i] = outRed < 255 ? outRed : 255; // check if the value is less than 255, if more set it to 255
  imageData.data[i + 1] = outGreen < 255 ? outGreen : 255;
  imageData.data[i + 2] = outBlue < 255 ? outBlue : 255
  imageData.data[i + 3] = alpha;
}

return imageData;    

}

imageWebEditor.prototype.brightness=function (imageData,lengthArray,brightness) {

var brightnessMul = brightness; // brightness multiplier

for(var i = 0; i < lengthArray; i += 4) {
    
    var red = imageData.data[i]; // Extract original red color [0 to 255]. Similarly for green and blue below
    var green = imageData.data[i + 1];
    var blue = imageData.data[i + 2];
    
    brightenedRed = brightnessMul * red;
    brightenedGreen = brightnessMul * green;
    brightenedBlue = brightnessMul * blue;
                
    imageData.data[i] = brightenedRed;
    imageData.data[i + 1] = brightenedGreen;
    imageData.data[i + 2] = brightenedBlue;
}

return imageData; 
}

imageWebEditor.prototype.invertColors=function (imageData,lengthArray) {

for(var i = 0; i < lengthArray; i += 4) {
    
  var r = imageData.data[i]; // Red color lies between 0 and 255
  var g = imageData.data[i + 1]; // Green color lies between 0 and 255
  var b = imageData.data[i + 2]; // Blue color lies between 0 and 255
  var a = imageData.data[i + 3]; // Transparency lies between 0 and 255

  var invertedRed = 255 - r;
  var invertedGreen = 255 - g;
  var invertedBlue = 255 - b;

  imageData.data[i] = invertedRed;
  imageData.data[i + 1] = invertedGreen;
  imageData.data[i + 2] = invertedBlue;
}
      
return imageData; 
}

imageWebEditor.prototype.instagramFilter=function (tipoFiltro) {

 this.ctx.save();

 var canvasWidth = this.canvas.width;
 var canvasHeight = this.canvas.height;
 this.image.crossOrigin="anonymous";

 //crear filtro
 switch (tipoFiltro) {
   case 'toaster':
         default:
           var filter_to_use = this.toasterGradient(canvasWidth, canvasHeight);
           break;
 }

 var screen = this.blend(this.ctx, filter_to_use, canvasWidth, canvasHeight, function (bottomPixel, topPixel) {
     return 255 - (255 - topPixel) * (255 - bottomPixel) / 255;
 });

 this.cleanctx();
 this.ctx.putImageData(screen, 0, 0);
 this.returnImage();
}

imageWebEditor.prototype.toasterGradient=function (width, height) {
 var texture = document.createElement('canvas');
 var ctx = texture.getContext('2d');

 texture.width = width;
 texture.height = height;

 var gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width * 0.6);

 gradient.addColorStop(0, "#804e0f ");
 gradient.addColorStop(1, "#3b003b ");

 ctx.fillStyle = gradient;
 ctx.fillRect(0, 0, width, height);

 return ctx;
}
imageWebEditor.prototype.blend=function (background, foreground, width, height, transform) {

 var bottom = background.getImageData(0, 0, width, height);
 var top    = foreground.getImageData(0, 0, width, height);

 for (var i = 0, size = top.data.length; i < size; i+=4) {
   // red
   top.data[i+0] = transform(bottom.data[i+0], top.data[i+0]);
   // green
   top.data[i+1] = transform(bottom.data[i+1], top.data[i+1]);
   // blue
   top.data[i+2] = transform(bottom.data[i+2], top.data[i+2]);
   // the fourth slot is alpha. We don't need that (so skip by 4)
 }

 return top;
}


imageWebEditor.prototype.initMoveImage=function(e){
    if (!this.dragImage) {this.dragImage=true;}
    else {this.closeMoveImage();}
    
    this.dragPosition.initX = e.offsetX;
    this.dragPosition.initY = e.offsetY;
    
    event.target.style.cursor='move';
    self=this;
    document.querySelector('#'+this.imgResponseId+' img').onmousemove=function(event){
      event.preventDefault();
      self.moveImage(event.offsetX,event.offsetY);
    };
    
    document.querySelector('#'+this.imgResponseId+' img').onmouseout=function(event){
      self.closeMoveImage();
      
    };
    
    
};


imageWebEditor.prototype.moveImage=function(x,y){
  
  
  this.dragPosition.goToX=this.dragPosition.initX-x;
  this.dragPosition.goToY=this.dragPosition.initY-y;
  
   
  this.cleanctx();
    imageleft=this.positionX+(this.dragPosition.goToX)*-1;
    imagetop=this.positionY+(this.dragPosition.goToY)*-1; 
    
    this.ctx.drawImage(this.image,imageleft,imagetop,this.image.width,this.image.height);
    this.scale=0;
    this.applyAllFilters();
    this.returnImage();
  
  

};

imageWebEditor.prototype.closeMoveImage=function(e) {
  event.target.style.cursor='auto';
  document.querySelector('#'+this.imgResponseId+' img').onmousemove=false;
  this.positionX+=(this.dragPosition.goToX)*-1;
  this.positionY+=(this.dragPosition.goToY)*-1;
  this.dragImage=false;
};


imageWebEditor.prototype.findPos=function (obj) {
  
    var curleft = curtop = 0;

    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);

        return [curleft, curtop];
    }
}


imageWebEditor.prototype.restoreBase=function() {
    this.cleanctx();
    imageleft=((this.image.width/2)*-1)+this.canvas.width/2;
    imagetop=((this.image.height/2)*-1)+this.canvas.height/2; 
    
    this.ctx.drawImage(this.image,imageleft,imagetop,this.image.width,this.image.height);
    this.positionX=imageleft;
    this.positionY=imagetop;
    this.rotate=0;
    this.dragImage=false;
    this.dragPosition=[0,0];
    this.scale=0;
    this.imageFilterAction=[];
    this.returnImage();
}

imageWebEditor.prototype.applyAllFilters=function() {
  aux=this.imageFilterAction.length;
  for (i=0;i<aux;i++) {
    this.imageFilter(this.imageFilterAction[i],false);    
  }
}


var editor;
window.onload=function(){
    editor=new imageWebEditor('218847.jpg','ImageDisplay');
    console.log(editor);
    
};
