"use strict";var generic={row:null,area_name:null,export_data_container:null,set_up:function(e){const t=this;return t.area_name=e.area_name,t.export_data_container=e.export_data_container,t.row=e.row,t.get_video_data({area_name:t.area_name}).then((function(e){if(e.length>0&&e[0].audiovisual&&e[0].audiovisual.length>0){const a=e[0].audiovisual;for(let e=0;e<a.length;e++)t.create_video_element(a[e])}})),!0},get_video_data:function(e){const t=e.area_name;return new Promise((function(e){const a="web_path='"+t+"'",n={dedalo_get:"records",db_name:page_globals.WEB_DB,lang:page_globals.WEB_CURRENT_LANG_CODE,table:"ts_web",ar_fields:["*"],sql_filter:a,limit:1,count:!1,offset:0,resolve_portals_custom:{audiovisual:"audiovisual"}};return data_manager.request({body:n}).then((function(t){e(t.result)}))}))},create_video_element:function(e){const t=e.video,a=t.replace("/404/","/720/"),n=t.split("/"),o=n[n.length-1].split(".")[0]+".jpg",r=page_globals.__WEB_MEDIA_BASE_URL__+"/dedalo/media/av/posterframe/"+o,_=e.title,l=new DocumentFragment,s=common.create_dom_element({element_type:"div",class_name:"video-wrapper",parent:l});common.create_dom_element({element_type:"h2",class_name:"video-title",parent:s,inner_html:_});const i=common.create_dom_element({element_type:"div",class_name:"video-thumb",parent:s});i.style.background="url("+page_globals.__WEB_TEMPLATE_WEB__+"/assets/images/video_thumb_overlay.png) no-repeat center ,url("+r+") no-repeat center",i.style.backgroundSize="cover",i.addEventListener("mouseenter",(function(){i.style.background="url("+r+") no-repeat center",i.style.backgroundSize="cover"})),i.addEventListener("mouseleave",(function(){i.style.background="url("+page_globals.__WEB_TEMPLATE_WEB__+"/assets/images/video_thumb_overlay.png) no-repeat center ,url("+r+") no-repeat center",i.style.backgroundSize="cover"})),i.addEventListener("click",(function(){i.style.display="none";let e=document.createRange().createContextualFragment('<video class="video-thumb" controls autoplay><source src="'+page_globals.__WEB_MEDIA_BASE_URL__+a+'" type="video/mp4"></video>');s.appendChild(e)}));return document.querySelector(".content").appendChild(l),l}};
//# sourceMappingURL=generic-min.js.map