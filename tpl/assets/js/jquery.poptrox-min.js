!function(e){e.fn.poptrox_disableSelection=function(){return e(this).css("user-select","none").css("-khtml-user-select","none").css("-moz-user-select","none").css("-o-user-select","none").css("-webkit-user-select","none")},e.fn.poptrox=function(o){if(0==this.length)return e(this);if(this.length>1){for(var t=0;t<this.length;t++)e(this[t]).poptrox(o);return e(this)}var p,i,s,n=e.extend({preload:!1,baseZIndex:1e3,fadeSpeed:300,overlayColor:"#000000",overlayOpacity:.6,overlayClass:"poptrox-overlay",windowMargin:50,windowHeightPad:0,selector:"a",caption:null,parent:"body",popupSpeed:300,popupWidth:200,popupHeight:100,popupIsFixed:!1,useBodyOverflow:!1,usePopupEasyClose:!0,usePopupForceClose:!1,usePopupLoader:!0,usePopupCloser:!0,usePopupCaption:!1,usePopupNav:!1,usePopupDefaultStyling:!0,popupBackgroundColor:"#FFFFFF",popupTextColor:"#000000",popupLoaderTextSize:"2em",popupCloserBackgroundColor:"#000000",popupCloserTextColor:"#FFFFFF",popupCloserTextSize:"20px",popupPadding:10,popupCaptionHeight:60,popupCaptionTextSize:null,popupBlankCaptionText:"(untitled)",popupCloserText:"&#215;",popupLoaderText:"&bull;&bull;&bull;&bull;",popupClass:"poptrox-popup",popupSelector:null,popupLoaderSelector:".loader",popupCloserSelector:".closer",popupCaptionSelector:".caption",popupNavPreviousSelector:".nav-previous",popupNavNextSelector:".nav-next",onPopupClose:null,onPopupOpen:null},o),r=e(this),a=e("body"),l=e('<div class="'+n.overlayClass+'"></div>'),u=e(window),d=[],h=0,g=!1,f=new Array;function x(){p=e(window).width(),i=e(window).height()+n.windowHeightPad;var o=Math.abs(s.width()-s.outerWidth()),t=Math.abs(s.height()-s.outerHeight()),r=(m.width(),m.height(),p-2*n.windowMargin-o),a=i-2*n.windowMargin-t;s.css("min-width",n.popupWidth).css("min-height",n.popupHeight),b.children().css("max-width",r).css("max-height",a)}n.usePopupLoader||(n.popupLoaderSelector=null),n.usePopupCloser||(n.popupCloserSelector=null),n.usePopupCaption||(n.popupCaptionSelector=null),n.usePopupNav||(n.popupNavPreviousSelector=null,n.popupNavNextSelector=null);var v,w,b=(s=n.popupSelector?e(n.popupSelector):e('<div class="'+n.popupClass+'">'+(n.popupLoaderSelector?'<div class="loader">'+n.popupLoaderText+"</div>":"")+'<div class="pic"></div>'+(n.popupCaptionSelector?'<div class="caption"></div>':"")+(n.popupCloserSelector?'<span class="closer">'+n.popupCloserText+"</span>":"")+(n.popupNavPreviousSelector?'<div class="nav-previous"></div>':"")+(n.popupNavNextSelector?'<div class="nav-next"></div>':"")+"</div>")).find(".pic"),m=e(),y=s.find(n.popupLoaderSelector),S=s.find(n.popupCaptionSelector),C=s.find(n.popupCloserSelector),P=s.find(n.popupNavNextSelector),k=s.find(n.popupNavPreviousSelector),T=P.add(k);n.usePopupDefaultStyling&&(s.css("background",n.popupBackgroundColor).css("color",n.popupTextColor).css("padding",n.popupPadding+"px"),S.length>0&&(s.css("padding-bottom",n.popupCaptionHeight+"px"),S.css("position","absolute").css("left","0").css("bottom","0").css("width","100%").css("text-align","center").css("height",n.popupCaptionHeight+"px").css("line-height",n.popupCaptionHeight+"px"),n.popupCaptionTextSize&&S.css("font-size",popupCaptionTextSize)),C.length>0&&C.html(n.popupCloserText).css("font-size",n.popupCloserTextSize).css("background",n.popupCloserBackgroundColor).css("color",n.popupCloserTextColor).css("display","block").css("width","40px").css("height","40px").css("line-height","40px").css("text-align","center").css("position","absolute").css("text-decoration","none").css("outline","0").css("top","0").css("right","-40px"),y.length>0&&y.html("").css("position","relative").css("font-size",n.popupLoaderTextSize).on("startSpinning",(function(o){var t=e("<div>"+n.popupLoaderText+"</div>");t.css("height",Math.floor(n.popupHeight/2)+"px").css("overflow","hidden").css("line-height",Math.floor(n.popupHeight/2)+"px").css("text-align","center").css("margin-top",Math.floor((s.height()-t.height()+(S.length>0?S.height():0))/2)).css("color",n.popupTextColor?n.popupTextColor:"").on("xfin",(function(){t.fadeTo(300,.5,(function(){t.trigger("xfout")}))})).on("xfout",(function(){t.fadeTo(300,.05,(function(){t.trigger("xfin")}))})).trigger("xfin"),y.append(t)})).on("stopSpinning",(function(e){y.find("div").remove()})),2==T.length&&(T.css("font-size","75px").css("text-align","center").css("color","#fff").css("text-shadow","none").css("height","100%").css("position","absolute").css("top","0").css("opacity","0.35").css("cursor","pointer").css("box-shadow","inset 0px 0px 10px 0px rgba(0,0,0,0)").poptrox_disableSelection(),n.usePopupEasyClose?(v="100px",w="100px"):(v="75%",w="25%"),P.css("right","0").css("width",v).html('<div style="position: absolute; height: 100px; width: 125px; top: 50%; right: 0; margin-top: -50px;">&gt;</div>'),k.css("left","0").css("width",w).html('<div style="position: absolute; height: 100px; width: 125px; top: 50%; left: 0; margin-top: -50px;">&lt;</div>')));return u.on("resize orientationchange",(function(){x()})),S.on("update",(function(e,o){o&&0!=o.length||(o=n.popupBlankCaptionText),S.html(o)})),C.css("cursor","pointer").on("click",(function(e){return e.preventDefault(),e.stopPropagation(),s.trigger("poptrox_close"),!0})),P.on("click",(function(e){e.stopPropagation(),e.preventDefault(),s.trigger("poptrox_next")})),k.on("click",(function(e){e.stopPropagation(),e.preventDefault(),s.trigger("poptrox_previous")})),l.css("position","fixed").css("left",0).css("top",0).css("z-index",n.baseZIndex).css("width","100%").css("height","100%").css("text-align","center").css("cursor","pointer").appendTo(n.parent).prepend('<div style="display:inline-block;height:100%;vertical-align:middle;"></div>').append('<div style="position:absolute;left:0;top:0;width:100%;height:100%;background:'+n.overlayColor+";opacity:"+n.overlayOpacity+";filter:alpha(opacity="+100*n.overlayOpacity+');"></div>').hide().on("touchmove",(function(e){return!1})).on("click",(function(e){e.preventDefault(),e.stopPropagation(),s.trigger("poptrox_close")})),s.css("display","inline-block").css("vertical-align","middle").css("position","relative").css("z-index",1).css("cursor","auto").appendTo(l).hide().on("poptrox_next",(function(){var e=h+1;e>=d.length&&(e=0),s.trigger("poptrox_switch",[e])})).on("poptrox_previous",(function(){var e=h-1;e<0&&(e=d.length-1),s.trigger("poptrox_switch",[e])})).on("poptrox_reset",(function(){x(),s.data("width",n.popupWidth).data("height",n.popupHeight),y.hide().trigger("stopSpinning"),S.hide(),C.hide(),T.hide(),b.hide(),m.attr("src","").detach()})).on("poptrox_open",(function(e,o){if(g)return!0;g=!0,n.useBodyOverflow&&a.css("overflow","hidden"),n.onPopupOpen&&n.onPopupOpen(),l.fadeTo(n.fadeSpeed,1,(function(){s.trigger("poptrox_switch",[o,!0])}))})).on("poptrox_switch",(function(o,t,p){var i,r,a;if(!p&&g)return!0;(g=!0,s.css("width",s.data("width")).css("height",s.data("height")),S.hide(),m.attr("src")&&m.attr("src",""),m.detach(),i=d[t],(m=i.object).off("load"),b.css("text-indent","-9999px").show().append(m),"ajax"==i.type?e.get(i.src,(function(e){m.html(e),m.trigger("load")})):m.attr("src",i.src),"image"!=i.type)&&(r=i.width,a=i.height,"%"==r.slice(-1)&&(r=parseInt(r.substring(0,r.length-1))/100*u.width()),"%"==a.slice(-1)&&(a=parseInt(a.substring(0,a.length-1))/100*u.height()),m.css("position","relative").css("outline","0").css("z-index",n.baseZIndex+100).width(r).height(a));y.trigger("startSpinning").fadeIn(300),s.show(),n.popupIsFixed?(s.width(n.popupWidth).height(n.popupHeight),m.load((function(){m.off("load"),y.hide().trigger("stopSpinning"),S.trigger("update",[i.captionText]).fadeIn(n.fadeSpeed),C.fadeIn(n.fadeSpeed),b.css("text-indent",0).hide().fadeIn(n.fadeSpeed,(function(){g=!1})),h=t,T.fadeIn(n.fadeSpeed)}))):m.load((function(){x(),m.off("load"),y.hide().trigger("stopSpinning");var e=m.width(),o=m.height(),p=function(){S.trigger("update",[i.captionText]).fadeIn(n.fadeSpeed),C.fadeIn(n.fadeSpeed),b.css("text-indent",0).hide().fadeIn(n.fadeSpeed,(function(){g=!1})),h=t,T.fadeIn(n.fadeSpeed),s.data("width",e).data("height",o).css("width","auto").css("height","auto")};e==s.data("width")&&o==s.data("height")?p():s.animate({width:e,height:o},n.popupSpeed,"swing",p)})),"image"!=i.type&&m.trigger("load")})).on("poptrox_close",(function(){if(g&&!n.usePopupForceClose)return!0;g=!0,s.hide().trigger("poptrox_reset"),n.onPopupClose&&n.onPopupClose(),l.fadeOut(n.fadeSpeed,(function(){n.useBodyOverflow&&a.css("overflow","auto"),g=!1}))})).trigger("poptrox_reset"),n.usePopupEasyClose?(S.on("click","a",(function(e){e.stopPropagation()})),s.css("cursor","pointer").on("click",(function(e){e.stopPropagation(),e.preventDefault(),s.trigger("poptrox_close")}))):s.on("click",(function(e){e.stopPropagation()})),u.keydown((function(e){if(s.is(":visible"))switch(e.keyCode){case 37:case 32:if(n.usePopupNav)return s.trigger("poptrox_previous"),!1;break;case 39:if(n.usePopupNav)return s.trigger("poptrox_next"),!1;break;case 27:return s.trigger("poptrox_close"),!1}})),r.find(n.selector).each((function(o){var t,p=e(this),i=p.find("img"),r=p.data("poptrox");if("ignore"!=r&&p.attr("href")){if(t={src:p.attr("href"),captionText:i.attr("title"),width:null,height:null,type:null,object:null,options:null},n.caption){if("function"==typeof n.caption)c=n.caption(p);else if("selector"in n.caption){var a;a=p.find(n.caption.selector),"attribute"in n.caption?c=a.attr(n.caption.attribute):(c=a.html(),!0===n.caption.remove&&a.remove())}}else c=i.attr("title");if(t.captionText=c,r){var l=r.split(",");0 in l&&(t.type=l[0]),1 in l&&(u=l[1].match(/([0-9%]+)x([0-9%]+)/))&&3==u.length&&(t.width=u[1],t.height=u[2]),2 in l&&(t.options=l[2])}if(!t.type)switch((!(u=t.src.match(/\/\/([a-z0-9\.]+)\/.*/))||u.length<2)&&(u=[!1]),u[1]){case"api.soundcloud.com":t.type="soundcloud";break;case"youtu.be":t.type="youtube";break;case"vimeo.com":t.type="vimeo";break;case"wistia.net":t.type="wistia";break;case"bcove.me":t.type="bcove";break;default:t.type="image"}switch(u=t.src.match(/\/\/[a-z0-9\.]+\/(.*)/),t.type){case"iframe":t.object=e('<iframe src="" frameborder="0"></iframe>'),t.object.on("click",(function(e){e.stopPropagation()})).css("cursor","auto"),t.width&&t.height||(t.width="600",t.height="400");break;case"ajax":t.object=e('<div class="poptrox-ajax"></div>'),t.object.on("click",(function(e){e.stopPropagation()})).css("cursor","auto").css("overflow","auto"),t.width&&t.height||(t.width="600",t.height="400");break;case"soundcloud":t.object=e('<iframe scrolling="no" frameborder="no" src=""></iframe>'),t.src="//w.soundcloud.com/player/?url="+escape(t.src)+(t.options?"&"+t.options:""),t.width="600",t.height="166";break;case"youtube":t.object=e('<iframe src="" frameborder="0" allowfullscreen="1"></iframe>'),t.src="//www.youtube.com/embed/"+u[1]+(t.options?"?"+t.options:""),t.width&&t.height||(t.width="800",t.height="480");break;case"vimeo":t.object=e('<iframe src="" frameborder="0" allowFullScreen="1"></iframe>'),t.src="//player.vimeo.com/video/"+u[1]+(t.options?"?"+t.options:""),t.width&&t.height||(t.width="800",t.height="480");break;case"wistia":t.object=e('<iframe src="" frameborder="0" allowFullScreen="1"></iframe>'),t.src="//fast.wistia.net/"+u[1]+(t.options?"?"+t.options:""),t.width&&t.height||(t.width="800",t.height="480");break;case"bcove":t.object=e('<iframe src="" frameborder="0" allowFullScreen="1" width="100%"></iframe>'),t.src="//bcove.me/"+u[1]+(t.options?"?"+t.options:""),t.width&&t.height||(t.width="640",t.height="360");break;default:var u;if(t.object=e('<img src="" alt="" style="vertical-align:bottom" />'),n.preload)(u=document.createElement("img")).src=t.src,f.push(u);t.width=p.attr("width"),t.height=p.attr("height")}"file:"==window.location.protocol&&t.src.match(/^\/\//)&&(t.src="http:"+t.src),d.push(t),i.attr("title",""),p.attr("href","").css("outline",0).on("click",(function(e){e.preventDefault(),e.stopPropagation(),s.trigger("poptrox_open",[o])}))}})),e(this)}}(jQuery);