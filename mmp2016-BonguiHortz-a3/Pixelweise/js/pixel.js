/*
 *Melina Hortz
 *Wassim Bongui
 **/
var pixel = {
    updateSchwellWert: function (newVal) {
        document.getElementById('sWertPegel').innerHTML = newVal;
    },
    
    getDifference: function (imageA, imageB, schwellWert) {
       //Eindimensionales Array mit den einzelnen RGB Werten
        var length = (imageB.data.length) / 4;
        var result = {image: imageB};
        var dif1 = 0;
        var dif2 = 0;
        for (var i = 0; i < length; i++) {
            var nextR = imageB.data[i * 4 + 0];
            var nextG = imageB.data[i * 4 + 1];
            var nextB = imageB.data[i * 4 + 2];

            var prevR = imageA.data[i * 4 + 0];
            var prevG = imageA.data[i * 4 + 1];
            var prevB = imageA.data[i * 4 + 2];
//Berechne Differenz zwischen Pixelfarbe prev und next
            var r = Math.abs(nextR - prevR);
            var g = Math.abs(nextG - prevG);
            var b = Math.abs(nextB - prevB);
            //differenz Farbe in Schwarz umrechnen
            var color = Math.abs((0.3 * r) + (0.6 * g) + (0.1 * b));
            //wenn kleiner schwellwert  dann mache ergebnisbild pixel grau
            if (color < schwellWert) {
                result.image.data[i * 4 + 0] = 128;
                result.image.data[i * 4 + 1] = 128;
                result.image.data[i * 4 + 2] = 128;
                dif1++;
            //
            } else {
                result.image.data[i * 4 + 0] = color;
                result.image.data[i * 4 + 1] = color;
                result.image.data[i * 4 + 2] = color;
                dif2++;
            }
        }
        //wenn die Anzahl aller geänderten Pixel größer gleich 98% aller Pixel im Bild ist handelt es sich um einen Szenenwechsel
        if (Math.abs(dif1 - dif2) >= ((this.video.videoWidth * this.video.videoHeight) * .98)) {
            var video3 = document.getElementById("3video");
            //Wenn Video nicht pausiert und und weiter als 0.1 dann gebe Timestamp des Szenenwechsels aus
            if (video3.paused === false && video3.currentTime > 0.1) {
                var totalSeconds = video3.currentTime;
                var hours = Math.floor(totalSeconds / 3600);
                var minutes = Math.floor((totalSeconds - (hours * 3600)) / 60);
                var seconds = totalSeconds - (hours * 3600) - (minutes * 60);
                
                seconds = Math.round(seconds * 100) / 100;

                var timecode = (hours < 10 ? "0" + hours : hours);
                timecode += "-" + (minutes < 10 ? "0" + minutes : minutes);
                timecode += "-" + (seconds < 10 ? "0" + seconds : seconds);
                timecode = timecode.replace(".", "-");
                //Logausgabe des Szenenwechsels
                this.log("SW bei: " + timecode);
            }
        } else {
        }

        return result;
    },
    
    log: function (text) {
        var logArea = document.getElementById("pixel-log");
        if (logArea) {
            logArea.innerHTML += text + "<br>";
        }
        if (typeof console !== "undefined") {
            console.log(text);
        }
    },
    
    computeFrame: function () {
        var ctx1 = this.ctx1;
        var ctx2 = this.ctx2;
        var frame = {};

        ctx1.drawImage(this.video, 0, 0, this.width - 1, this.height);
        ctx2.drawImage(this.video, 0, 0, this.width - 1, this.height);
        try {
            frame = ctx1.getImageData(0, 0, this.width, this.height);
        } catch (e) {
            console.log("error");
        }

        ctx1.putImageData(frame, 0, 0);

        if (this.cachedImg) {
            var diffImage = this.getDifference(this.cachedImg, frame, document.getElementById('schwellWert').value);
            ctx2.putImageData(diffImage.image, 0, 0);
        }

        this.cachedImg = ctx1.getImageData(0, 0, this.width, this.height);
    },
    getTimestamp: function () {
        return new Date().getTime();
    },

    timerCallback: function () {

        this.computeFrame();

        var timeoutMilliseconds = 40;
        var self = this;
        setTimeout(function () {
            self.timerCallback();
        }, timeoutMilliseconds);
    },
    doLoad: function () {
        this.cachedImg = null;
        if (window.performance.now) {
            getTimestamp = function () {
                return window.performance.now();
            };
        } else {
            if (window.performance.webkitNow) {
                getTimestamp = function () {
                    return window.performance.webkitNow();
                };
            }
        }

        try {
            this.video = document.getElementById("3video");
            this.c1 = document.getElementById("3c1");
            this.c2 = document.getElementById("3c2");
            this.ctx1 = this.c1.getContext("2d");
            this.ctx2 = this.c2.getContext("2d");
            this.width = this.video.videoWidth;
            this.height = this.video.videoHeight;
            this.ctx1.width = this.width;
            this.ctx1.height = this.height;
            this.c1.width = this.width + 1;
            this.c1.height = this.height;
            this.ctx2.width = this.width;
            this.ctx2.height = this.height;
            this.c2.width = this.width + 1;
            this.c2.height = this.height;
        } catch (e) {
            console.log("error");
            return;
        }
        this.timerCallback();
    }
};