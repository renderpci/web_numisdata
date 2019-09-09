/*!
 * Back Ground Color Thief
 * by Srinivas Dasari - http://www.sodhanalibrary.com
 *
 * License
 * -------
 * Creative Commons Attribution 2.5 License:
 * http://creativecommons.org/licenses/by/2.5/
 *
 * Thanks
 * ------
 * Nick Rabinowitz - For creating quantize.js.
 * John Schulz - For clean up and optimization. @JFSIII
 * Nathan Spady - For adding drag and drop support to the demo page.
 * Lokesh Dhakar - For color theif - inspiration
 */
/*
  CanvasImage Class
  Class that wraps the html image element and canvas.
  It also simplifies some of the canvas context manipulation
  with a set of helper functions.
*/
var CanvasImage=function(t){this.canvas=document.createElement("canvas"),this.context=this.canvas.getContext("2d"),document.body.appendChild(this.canvas),this.width=this.canvas.width=t.width,this.height=this.canvas.height=t.height,this.context.drawImage(t,0,0,this.width,this.height)};CanvasImage.prototype.clear=function(){this.context.clearRect(0,0,this.width,this.height)},CanvasImage.prototype.update=function(t){this.context.putImageData(t,0,0)},CanvasImage.prototype.getPixelCount=function(){return this.width*this.height},CanvasImage.prototype.getWidth=function(){return this.width},CanvasImage.prototype.getHeight=function(){return this.height},CanvasImage.prototype.getImageData=function(){return this.context.getImageData(0,0,this.width,this.height)},CanvasImage.prototype.removeCanvas=function(){this.canvas.parentNode.removeChild(this.canvas)},CanvasImage.prototype.markPixels=function(t){for(var r=this.context.getImageData(0,0,this.width,this.height),n=0;n<t.length;n++){var e=t[n];r.data[e++]=255,r.data[e++]=0,r.data[e++]=0,r.data[e++]=255}this.context.putImageData(r,0,0)};var BackgroundColorTheif=function(){};
/*
 * getBackGroundColor(sourceImage[, quality])
 * returns {r: num, g: num, b: num}
 *
 * Use the median cut algorithm provided by quantize.js to cluster similar
 * colors and return the base color from the largest cluster.
 *
 * Quality is an optional argument. It needs to be an integer. 0 is the highest quality settings.
 * 10 is the default. There is a trade-off between quality and speed. The bigger the number, the
 * faster a color will be returned but the greater the likelihood that it will not be the visually
 * most dominant color.
 *
 * */
/*!
 * quantize.js Copyright 2008 Nick Rabinowitz.
 * Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
 */
// fill out a couple protovis dependencies
/*!
 * Block below copied from Protovis: http://mbostock.github.com/protovis/
 * Copyright 2010 Stanford Visualization Group
 * Licensed under the BSD License: http://www.opensource.org/licenses/bsd-license.php
 */
if(BackgroundColorTheif.prototype.getBackGroundColor=function(t,r){var n,e;return this.getPalette(t,5,r)[0]},
/*
 * getPalette(sourceImage[, colorCount, quality])
 * returns array[ {r: num, g: num, b: num}, {r: num, g: num, b: num}, ...]
 *
 * Use the median cut algorithm provided by quantize.js to cluster similar colors.
 *
 * colorCount determines the size of the palette; the number of colors returned. If not set, it
 * defaults to 10.
 *
 * BUGGY: Function does not always return the requested amount of colors. It can be +/- 2.
 *
 * quality is an optional argument. It needs to be an integer. 0 is the highest quality settings.
 * 10 is the default. There is a trade-off between quality and speed. The bigger the number, the
 * faster the palette generation but the greater the likelihood that colors will be missed.
 *
 *
 */
BackgroundColorTheif.prototype.getPalette=function(t,r,n){void 0===r&&(r=10),void 0===n&&(n=10);
// Create custom CanvasImage object
var e=new CanvasImage(t),o,a=e.getImageData().data,i,u=Math.round(.1*e.getWidth()),h=Math.round(.1*e.getHeight()),c=[],s=[];i=h*e.getWidth();for(var v=0,f,g,p,l,d;v<i;v+=n)g=a[(f=4*v)+0],p=a[f+1],l=a[f+2],
// If pixel is mostly opaque and not white
125<=(d=a[f+3])&&(c.push([g,p,l]),s.push(f));i=e.getHeight()*e.getWidth();for(var v=(e.getHeight()-h)*e.getWidth(),f,g,p,l,d;v<i;v+=n)g=a[(f=4*v)+0],p=a[f+1],l=a[f+2],
// If pixel is mostly opaque and not white
125<=(d=a[f+3])&&(c.push([g,p,l]),s.push(f));n=4,i=(e.getHeight()-h)*e.getWidth();for(var v=h*e.getWidth(),f,g,p,l,d,m=0,b=0;v<i;v+=n)g=a[(f=4*v)+0],p=a[f+1],l=a[f+2],
// If pixel is mostly opaque and not white
125<=(d=a[f+3])&&(c.push([g,p,l]),s.push(f)),u<=(m+=n)&&(v=(h+(b+=n))*e.getWidth(),m=0);i=(e.getHeight()-h)*e.getWidth();for(var v=h*e.getWidth()+(e.getWidth()-u-n),f,g,p,l,d,m=0,b=0;v<i;v+=n)g=a[(f=4*v)+0],p=a[f+1],l=a[f+2],
// If pixel is mostly opaque and not white
125<=(d=a[f+3])&&(c.push([g,p,l]),s.push(f)),u<=(m+=n)&&(v=(h+(b+=n))*e.getWidth()+(e.getWidth()-u-n),m=0);
//image.markPixels(pixelsNum);
// Send array to quantize function which clusters values
// using median cut algorithm
var x,w=MMCQ.quantize(c,r).palette();
// Clean up
return e.removeCanvas(),w},!pv)var pv={map:function(t,n){var e={};return n?t.map(function(t,r){return e.index=r,n.call(e,t)}):t.slice()},naturalOrder:function(t,r){return t<r?-1:r<t?1:0},sum:function(t,e){var o={};return t.reduce(e?function(t,r,n){return o.index=n,t+e.call(o,r)}:function(t,r){return t+r},0)},max:function(t,r){return Math.max.apply(null,r?pv.map(t,r):t)}};
/**
 * Basic Javascript port of the MMCQ (modified median cut quantization)
 * algorithm from the Leptonica library (http://www.leptonica.com/).
 * Returns a color map you can use to map original pixels to the reduced
 * palette. Still a work in progress.
 *
 * @author Nick Rabinowitz
 * @example
// array of pixels as [R,G,B] arrays
var myPixels = [[190,197,190], [202,204,200], [207,214,210], [211,214,211], [205,207,207]
                // etc
                ];
var maxColors = 4;
var cmap = MMCQ.quantize(myPixels, maxColors);
var newPalette = cmap.palette();
var newPixels = myPixels.map(function(p) {
    return cmap.map(p);
});
 */var MMCQ=function(){
// get reduced-space color index for a pixel
function l(t,r,n){return(t<<2*m)+(r<<m)+n}
// Simple priority queue
function s(t){function r(){n.sort(t),e=!0}var n=[],e=!1;return{push:function(t){n.push(t),e=!1},peek:function(t){return e||r(),void 0===t&&(t=n.length-1),n[t]},pop:function(){return e||r(),n.pop()},size:function(){return n.length},map:function(t){return n.map(t)},debug:function(){return e||r(),n}}}
// 3d color space box
function v(t,r,n,e,o,a,i){var u=this;u.r1=t,u.r2=r,u.g1=n,u.g2=e,u.b1=o,u.b2=a,u.histo=i}
// Color map
function f(){this.vboxes=new s(function(t,r){return pv.naturalOrder(t.vbox.count()*t.vbox.volume(),r.vbox.count()*r.vbox.volume())})}
// histo (1-d array, giving the number of pixels in
// each quantized region of color space), or null on error
function g(t){var r,n=new Array(1<<3*m),e,o,a,i;return t.forEach(function(t){o=t[0]>>b,a=t[1]>>b,i=t[2]>>b,e=l(o,a,i),n[e]=(n[e]||0)+1}),n}function p(t,r){var n=1e6,e=0,o=1e6,a=0,i=1e6,u=0,h,c,s;
// find min/max
return t.forEach(function(t){h=t[0]>>b,c=t[1]>>b,s=t[2]>>b,h<n?n=h:e<h&&(e=h),c<o?o=c:a<c&&(a=c),s<i?i=s:u<s&&(u=s)}),new v(n,e,o,a,i,u,r)}function d(t,c){function r(t){var r=t+"1",n=t+"2",e,o,a,i,u,h=0;for(g=c[r];g<=c[n];g++)if(v[g]>s/2){
// avoid 0-count boxes
for(a=c.copy(),i=c.copy(),u=(e=g-c[r])<=(o=c[n]-g)?Math.min(c[n]-1,~~(g+o/2)):Math.max(c[r],~~(g-1-e/2));!v[u];)u++;for(h=f[u];!h&&v[u-1];)h=f[--u];
// set dimensions
//                    console.log('vbox counts:', vbox.count(), vbox1.count(), vbox2.count());
return a[n]=u,i[r]=a[n]+1,[a,i]}}
// determine the cut planes
if(c.count()){var n=c.r2-c.r1+1,e=c.g2-c.g1+1,o=c.b2-c.b1+1,a=pv.max([n,e,o]);
// only one pixel, no split
if(1==c.count())return[c.copy()];
/* Find the partial sum arrays along the selected axis. */var s=0,v=[],f=[],g,i,u,h,p;if(a==n)for(g=c.r1;g<=c.r2;g++){for(h=0,i=c.g1;i<=c.g2;i++)for(u=c.b1;u<=c.b2;u++)h+=t[p=l(g,i,u)]||0;s+=h,v[g]=s}else if(a==e)for(g=c.g1;g<=c.g2;g++){for(h=0,i=c.r1;i<=c.r2;i++)for(u=c.b1;u<=c.b2;u++)h+=t[p=l(i,g,u)]||0;s+=h,v[g]=s}else/* maxw == bw */
for(g=c.b1;g<=c.b2;g++){for(h=0,i=c.r1;i<=c.r2;i++)for(u=c.g1;u<=c.g2;u++)h+=t[p=l(i,u,g)]||0;s+=h,v[g]=s}return v.forEach(function(t,r){f[r]=s-t}),r(a==n?"r":a==e?"g":"b")}}function t(t,r){
// inner function to do the iteration
function n(t,r){for(var n=1,e=0,o;e<x;)if((o=t.pop()).count()){
// do the cut
var a=d(h,o),i=a[0],u=a[1];if(!i)
//                    console.log("vbox1 not defined; shouldn't happen!");
return;if(t.push(i),u&&(/* vbox2 can be null */
t.push(u),n++),r<=n)return;if(e++>x)
//                    console.log("infinite loop; perhaps too few pixels!");
return}else/* just put it back */
t.push(o),e++}
// first set of colors, sorted by population
// short-circuit
if(!t.length||r<2||256<r)
//            console.log('wrong number of maxcolors');
return!1;
// XXX: check color content and convert to grayscale if insufficient
var h=g(t),e=1<<3*m,o=0;
// check that we aren't below maxcolors already
h.forEach(function(){o++});
// get the beginning vbox from the colors
var a=p(t,h),i=new s(function(t,r){return pv.naturalOrder(t.count(),r.count())});i.push(a),n(i,w*r);for(
// Re-sort by the product of pixel occupancy times the size in color space.
var u=new s(function(t,r){return pv.naturalOrder(t.count()*t.volume(),r.count()*r.volume())});i.size();)u.push(i.pop());
// next set - generate the median cuts using the (npix * vol) sorting.
n(u,r-u.size());for(
// calculate the actual colors
var c=new f;u.size();)c.push(u.pop());return c}
// private constants
var m=5,b=8-m,x=1e3,w=.75;return v.prototype={volume:function(t){var r=this;return r._volume&&!t||(r._volume=(r.r2-r.r1+1)*(r.g2-r.g1+1)*(r.b2-r.b1+1)),r._volume},count:function(t){var r=this,n=r.histo;if(!r._count_set||t){var e=0,o,a,i;for(o=r.r1;o<=r.r2;o++)for(a=r.g1;a<=r.g2;a++)for(i=r.b1;i<=r.b2;i++)index=l(o,a,i),e+=n[index]||0;r._count=e,r._count_set=!0}return r._count},copy:function(){var t=this;return new v(t.r1,t.r2,t.g1,t.g2,t.b1,t.b2,t.histo)},avg:function(t){var r=this,n=r.histo;if(!r._avg||t){var e=0,o=1<<8-m,a=0,i=0,u=0,h,c,s,v,f;for(c=r.r1;c<=r.r2;c++)for(s=r.g1;s<=r.g2;s++)for(v=r.b1;v<=r.b2;v++)e+=h=n[f=l(c,s,v)]||0,a+=h*(c+.5)*o,i+=h*(s+.5)*o,u+=h*(v+.5)*o;r._avg=e?[~~(a/e),~~(i/e),~~(u/e)]:[~~(o*(r.r1+r.r2+1)/2),~~(o*(r.g1+r.g2+1)/2),~~(o*(r.b1+r.b2+1)/2)]}return r._avg},contains:function(t){var r=this,n=t[0]>>b;return gval=t[1]>>b,bval=t[2]>>b,n>=r.r1&&n<=r.r2&&gval>=r.g1&&gval<=r.g2&&bval>=r.b1&&bval<=r.b2}},f.prototype={push:function(t){this.vboxes.push({vbox:t,color:t.avg()})},palette:function(){return this.vboxes.map(function(t){return t.color})},size:function(){return this.vboxes.size()},map:function(t){for(var r=this.vboxes,n=0;n<r.size();n++)if(r.peek(n).vbox.contains(t))return r.peek(n).color;return this.nearest(t)},nearest:function(t){for(var r=this.vboxes,n,e,o,a=0;a<r.size();a++)((e=Math.sqrt(Math.pow(t[0]-r.peek(a).color[0],2)+Math.pow(t[1]-r.peek(a).color[1],2)+Math.pow(t[2]-r.peek(a).color[2],2)))<n||void 0===n)&&(n=e,o=r.peek(a).color);return o},forcebw:function(){
// XXX: won't  work yet
var t=this.vboxes;t.sort(function(t,r){return pv.naturalOrder(pv.sum(t.color),pv.sum(r.color))});
// force darkest color to black if everything < 5
var r=t[0].color;r[0]<5&&r[1]<5&&r[2]<5&&(t[0].color=[0,0,0]);
// force lightest color to white if everything > 251
var n=t.length-1,e=t[n].color;251<e[0]&&251<e[1]&&251<e[2]&&(t[n].color=[255,255,255])}},{quantize:t}}();