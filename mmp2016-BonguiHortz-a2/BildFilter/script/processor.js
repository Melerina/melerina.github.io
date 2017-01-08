/* 
                                        BildFilter 
it started with a function who make the convolution on the frame of the video and then
applying the specific effect on the convolved frame and put it in the canvas :   
*/

var isFirefox = /Firefox/.test(navigator.userAgent);
var isChrome = /Chrome/.test(navigator.userAgent);

// the type of filter choosen
// for example : FB_7x7 is the Filter Blur with a Matrix 7x7:
// FB_3x3 as default.

var FB_7x7 =  [ 1/49, 1/49, 1/49, 1/49, 1/49, 1/49, 1/49,
				1/49, 1/49, 1/49, 1/49, 1/49, 1/49, 1/49,
				1/49, 1/49, 1/49, 1/49, 1/49, 1/49, 1/49,
				1/49, 1/49, 1/49, 1/49, 1/49, 1/49, 1/49,
				1/49, 1/49, 1/49, 1/49, 1/49, 1/49, 1/49,
				1/49, 1/49, 1/49, 1/49, 1/49, 1/49, 1/49,
				1/49, 1/49, 1/49, 1/49, 1/49, 1/49, 1/49];				

var FB_3x3 =  [ 1/9, 1/9, 1/9,
			    1/9, 1/9, 1/9,
			    1/9, 1/9, 1/9];	 
// sigma = 1.0 for the Gaussian Function 	:
var	FG_7x7 =  [ 0.000036, 0.000363, 0.001446, 0.002291, 0.001446, 0.000363,	0.000036,
				0.000363, 0.003676, 0.014662, 0.023226, 0.014662, 0.003676, 0.000363,
				0.001446, 0.014662, 0.058488, 0.092651, 0.058488, 0.014662, 0.001446,
				0.002291, 0.023226, 0.092651, 0.146768, 0.092651, 0.023226, 0.002291,
				0.001446, 0.014662, 0.058488, 0.092651, 0.058488, 0.014662, 0.001446,
				0.000363, 0.003676, 0.014662, 0.023226, 0.014662, 0.003676, 0.000363,
				0.000036, 0.000363, 0.001446, 0.002291, 0.001446, 0.000363, 0.000036];
	
var	FG_3x3 =  [ 0.077847, 0.123317, 0.077847,
				0.123317, 0.195346, 0.123317,
				0.077847, 0.123317, 0.077847];
// Vertical Matrix for Prewitt 	:
var FP_7x7_V =  [-1, -1, -1, -1, -1, -1, -1,
                 0, 0, 0, 0, 0, 0, 0,
				 0, 0, 0, 0, 0, 0, 0,
				 0, 0, 0, 0, 0, 0, 0,
				 0, 0, 0, 0, 0, 0, 0,
				 0, 0, 0, 0, 0, 0, 0,
			     1, 1, 1, 1, 1, 1, 1];
// HoriImage_filtredontal Matrix for Prewitt :
var FP_7x7_H =  [-1, 0, 0, 0, 0, 0, 1,
				 -1, 0, 0, 0, 0, 0, 1,
				 -1, 0, 0, 0, 0, 0, 1,
				 -1, 0, 0, 0, 0, 0, 1,
				 -1, 0, 0, 0, 0, 0, 1,
				 -1, 0, 0, 0, 0, 0, 1,
				 -1, 0, 0, 0, 0, 0, 1];

			 
var FP_3x3_V = [ -1, -1, -1,
                 0, 0, 0,
			     1, 1, 1];

var FP_3x3_H = [ -1, 0, 1,
                 -1, 0, 1,
			     -1, 0, 1];
				 
var FL_7x7 =  [ 0, 0, -1, -1, -1, 0, 0,
                0, -1, -3, -3,-3, -1, 0,
			   -1, -3, 0, 7, 0, -3, -1,
			   -1, -3, 7, 24, 7, -3, -1,
               -1, -3, 0, 7, 0, -3, -1,
				0, -1, -3, -3,-3, -1, 0,
				0, 0, -1, -1, -1, 0, 0,];
                
var FL_3x3 =  [-1,-1,-1,
			   -1, 8,-1,
			   -1,-1,-1];

				
				

// config2 is for changing the type of filter :
var config2 =  {
	
	filter_type : "Blur"
	
};
//config3 is for changingthe type of Matrix :
var config3 =  {
	Matrix_type : "3x3"
}

var processor = {

	//changing the effect and show it in thelog area :
	change_effect: function() {
		// get effect type and Matrix values
		config2.filter_type = document.getElementById("Filters").value;
		config3.Matrix_type = document.getElementById("Matrix").value;
		this.log("BildFilter = "+config2.filter_type+" mit Mask = "+config3.Matrix_type);
		
	},

    computeFrame: function() {

		
        var ctx = this.ctx1;

		
        ctx.drawImage(this.video, 0, 0, this.width - 1, this.height);
		
		
        var frame={};
		var length=0;
        try {
            frame = ctx.getImageData(0, 0, this.width, this.height);
			length = (frame.data.length) / 4;
        } catch(e) {
			
            this.browserError(e);
        }
		
		img = frame ;
		Filters = {};
		// function return the imageData from the image :
		Filters.getPixels = function(img) {
		  var c = this.getCanvas(img.width, img.height);
		  var ctx = c.getContext('2d');
		  ctx.putImageData(img, 0, 0);
		  return ctx.getImageData(0,0,c.width,c.height);
		};
        // create and return a canvas :
		Filters.getCanvas = function(w,h) {
		  var c = document.createElement('canvas');
		  c.width = w;
		  c.height = h;
		  return c;
		};
		// simple grayscale filter
		// its going to be used in the Prewitt filter later on with img.data argument :
		Filters.grayscale = function(pixels, args) {
		  var d = pixels.data;
		  for (var i=0; i<d.length; i+=4) {
			var r = d[i];
			var g = d[i+1];
			var b = d[i+2];
			// CIE luminance for the RGB
			// The human eye is bad at seeing red and blue, so we de-emphasiImage_filtrede them.
			var v = 0.2126*r + 0.7152*g + 0.0722*b;
			d[i] = d[i+1] = d[i+2] = v
		  }
		  return pixels;
		};		
        // apply and return the image filtred the type of filter and the image as arguments :
        Filters.filterImage = function(filter, img, var_args) {
		  var args = [this.getPixels(img)];
		  for (var i=2; i<arguments.length; i++) {
			args.push(arguments[i]);
		  }
		  return filter.apply(null, args);
		};		
				
		
		Filters.tmpCanvas = document.createElement('canvas');
		Filters.tmpCtx = Filters.tmpCanvas.getContext('2d');
        // return the image.data with width and height as arguments :
		Filters.createImageData = function(w,h) {
		  return this.tmpCtx.createImageData(w,h);
		};
        // Making the convolution with the data from the image as arguments 
		// return the convolved Matrix :
		Filters.convolute = function(pixels, weights, opaque) {
			
		  var side = Math.round(Math.sqrt(weights.length));
		  var halfSide = Math.floor(side/2);
		  var src = pixels.data;
		  var sw = pixels.width;
		  var sh = pixels.height;
		  // pad output by the convolution matrix
		  var w = sw;
		  var h = sh;
		  var output = Filters.createImageData(w, h);
		  var dst = output.data;
		  // go through the destination image pixels
		  var alphaFac = opaque ? 1 : 0;
		  for (var y=0; y<h; y++) {
			for (var x=0; x<w; x++) {
			  var sy = y;
			  var sx = x;
			  var dstOff = (y*w+x)*4;
			  // calculate the weighed sum of the source image pixels that
			  // fall under the convolution matrix
			  var r=0, g=0, b=0, a=0;
			  for (var cy=0; cy<side; cy++) {
				for (var cx=0; cx<side; cx++) {
				  var scy = sy + cy - halfSide;
				  var scx = sx + cx - halfSide;
				  if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
					var srcOff = (scy*sw+scx)*4;
					var wt = weights[cy*side+cx];
					r += src[srcOff] * wt;
					g += src[srcOff+1] * wt;
					b += src[srcOff+2] * wt;
					a += src[srcOff+3] * wt;
				  }
				}
			  }
			  dst[dstOff] = r;
			  dst[dstOff+1] = g;
			  dst[dstOff+2] = b;
			  dst[dstOff+3] = a + alphaFac*(255-a);
			}
		  }
		  return output;
		};		
		//Making the Median effect:
		Filters.median = function(img) {
				
				var n=2;
				var dst = img;
				if (config3.Matrix_type == "3x3"){
					n=2;
				}else if(config3.Matrix_type == "7x7"){
					n=6;
				}
				for (i=n;i< ( img.data.width - n );i++){
					for(j=n;j< ( img.data.length - n );j++){
						var p1= new Array ;
						p1.length=n*n;
						for (k=i-(n/2);k<i+n;k++){
							for (l=j-(n/2);l<j+n;l++){
								p1.push(img.data[k][l]);
								}
						}
						var p2=p1.sort(); 
						dst.data[i][j]=p2[(p1.length/2)+1]; 
					}
				}
				return dst;
			};
		//Making the Prewitt effect:
		Filters.Prewitt = function(img,VM,HM){
			
			var grayscale = Filters.filterImage(Filters.grayscale, img);
			// HM is the HoriImage_filtredontal Matrix
			// VM is the Vertical Matrix
			
			var vertical = Filters.convolute(grayscale,VM);
			var horiImage_filtredontal = Filters.convolute(grayscale,HM);
			var final_image = Filters.createImageData(vertical.width, vertical.height);
			for (var i=0; i<final_image.data.length; i+=4) {
			  // make the vertical gradient red
			  var v = Math.abs(vertical.data[i]);
			  final_image.data[i] = v;
			  // make the horiImage_filtredontal gradient green
			  var h = Math.abs(horiImage_filtredontal.data[i]);
			  final_image.data[i+1] = h;
			  // and mix in some blue for aesthetics
			  final_image.data[i+2] = (v+h)/4;
			  final_image.data[i+3] = 255; // opaque alpha
			}
			return final_image;
		}
		// returna Float Matrix from a normal Matrix :
		Filters.getFloat32Array = function(len) {
				return new Float32Array(len);
			};
			
		laplaceKernel_3x3 = Filters.getFloat32Array(FL_3x3);
		laplaceKernel_7x7 = Filters.getFloat32Array(FL_7x7);
		
			  
		
		// calling the Matrix and applying the effects as the button (los!) is clicked 
		
		var Image_filtred = {};
		if (config2.filter_type == "Blur" & config3.Matrix_type == "7x7"){
			
			Image_filtred= Filters.filterImage(Filters.convolute, img,FB_7x7);
			
		}
		 if (config2.filter_type == "Blur" & config3.Matrix_type == "3x3"){
			
			Image_filtred= Filters.filterImage(Filters.convolute, img,FB_3x3);
			
		}
		if (config2.filter_type == "Gauss" & config3.Matrix_type == "7x7"){
			
			Image_filtred= Filters.filterImage(Filters.convolute, img,FG_7x7);
			
		}
		if (config2.filter_type == "Gauss" & config3.Matrix_type == "3x3"){
			
			Image_filtred= Filters.filterImage(Filters.convolute, img,FG_3x3);
			
		}
		
		if (config2.filter_type == "Median" & config3.Matrix_type == "7x7"){
			
			Image_filtred=Filters.median(img);
			
		}
		if (config2.filter_type == "Median" & config3.Matrix_type == "3x3"){
			
			Image_filtred=Filters.median(img);
			
		} 
		 if (config2.filter_type == "Prewitt" & config3.Matrix_type == "7x7"){
			
			Image_filtred= Filters.Prewitt(img,FP_7x7_V,FP_7x7_H);
			
		} 
		if (config2.filter_type == "Prewitt" & config3.Matrix_type == "3x3"){
			
			Image_filtred= Filters.Prewitt(img,FP_3x3_V,FP_3x3_H);
			
		}
	    if (config2.filter_type == "LoG" & config3.Matrix_type == "7x7"){
			
			Image_filtred= Filters.convolute(img, laplaceKernel_7x7, true);
		} 
		if (config2.filter_type == "LoG" & config3.Matrix_type == "3x3"){
			

					
			Image_filtred= Filters.convolute(img, laplaceKernel_3x3, true);
			
		} 
				
		
	    
        this.ctx1.putImageData(Image_filtred, 0, 0);
        return;
    },

	getTimestamp: function() { return new Date().getTime(); },

    timerCallback: function() {
            if(this.error) {
                alert("Error happened - processor stopped.");
                return;
            }

            this.computeFrame();
			
			
			var timeoutMilliseconds = 40;
			var self = this;
            setTimeout(function() {
                self.timerCallback();
            }, timeoutMilliseconds);
    },
	
    
    doLoad: function() {

        this.error = 0;
    
		if (window.performance.now) {
			console.log("Using high performance timer");
			getTimestamp = function() { return window.performance.now(); };
		} else {
			if (window.performance.webkitNow) {
				console.log("Using webkit high performance timer");
				getTimestamp = function() { return window.performance.webkitNow(); };
			} 
		}

        if(!this.browserChecked)
            this.browserCheck();
			
		try {
        
			this.video = document.getElementById("video");
			this.c1 = document.getElementById("c1");
			this.ctx1 = this.c1.getContext("2d");

			this.log("Found video: siImage_filtrede "+this.video.videoWidth+"x"+this.video.videoHeight);
						
			this.video.width = this.video.videoWidth/2;
			this.video.height = this.video.videoWidth/2;
			
			var factor = 1;
			
			this.width = this.video.width / factor;
			this.height = this.video.height / factor;

			this.ctx1.width = this.width;
			this.ctx1.height = this.height;
			this.c1.width = this.width + 1;
			this.c1.height = this.height;
			
		} catch(e) {
			alert("Erro: " + e);
			return;
		}
		
        this.timerCallback();
				
    },
	
	
    isCanvasSupported: function(){ 
        var elem = document.createElement('canvas'); 
        return !!(elem.getContext && elem.getContext('2d')); 
    }, 
	
	
	log: function(text) {
		var logArea = document.getElementById("log"); 
		if(logArea) {
			logArea.innerHTML += text + "<br>";
		}
		if(typeof console != "undefined") {
			console.log(text);
		}
	},

	
    browserError: function(e) {
    
        this.error = 1;
        
       
        if(isChrome)
            alert("Security Error\r\n - Call chrome with --allow-file-access-from-files\r\n\r\n"+e);
        else if(isFirefox)
            alert("Security Error\r\n - Open Firefox config (about: config) and set the value\r\nsecurity.fileuri.strict_origin_policy = false ");
        else 
            alert("Error in getImageData "+ e);    
    },
    
   
    browserCheck: function() {
		if(!this.isCanvasSupported()) {
			alert("No HTML5 canvas - use a newer browser please.");
			return false;
		}		
                  
        this.browserChecked = true;
        return true;
    },
    browserChecked: false,
    error: 0
};
