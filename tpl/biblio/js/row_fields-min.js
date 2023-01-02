"use strict";var row_fields={biblio_object:null,caller:null,get_typology:function(){const e=this.biblio_object.typology||"[]",t=JSON.parse(e);return"1"==(void 0!==t[0]?t[0]:0)?"book":"article"},author:function(){const e=this.biblio_object,t=common.create_dom_element({element_type:"div",class_name:"info_line author"});if(!0===dedalo_logged){common.create_dom_element({element_type:"a",class_name:"section_id go_to_dedalo",text_content:e.section_id+" "+this.get_typology(),href:"/dedalo/lib/dedalo/main/?t=rsc205&id="+e.section_id,parent:t}).setAttribute("target","_blank")}if(e.authors&&e.authors.length>0){const o=e.authors_data,l=o.length,a=[];for(var n=0;n<l;n++){const e=[];o[n].surname&&e.push(o[n].surname),o[n].name&&e.push(o[n].name);const t=e.join(", ");a.push(t)}const i=a.join("; ");common.create_dom_element({element_type:"div",class_name:"info_value",text_content:i,parent:t})}else common.create_dom_element({element_type:"div",class_name:"info_value",text_content:"Undefined author",parent:t});return t},publication_date:function(){const e=this.biblio_object,t=common.create_dom_element({element_type:"div",class_name:"info_line publication_date hide"});if(e.publication_date){const n=e.publication_date.split("-");let o=parseInt(n[0]);n[1],parseInt(n[1])>0&&(o=o+"-"+parseInt(n[1])),n[2],parseInt(n[2])>0&&(o=o+"-"+parseInt(n[2])),common.create_dom_element({element_type:"div",class_name:"info_value",text_content:o,parent:t}),t.classList.remove("hide")}return t},row_title:function(){const e=this.biblio_object,t=this.get_typology(),n=e.pdf||"[]",o=JSON.parse(n),l=o.length,a=common.create_dom_element({element_type:"div",class_name:"info_line row_title"}),i=e.title||"",_="book"===t?" italic":"";common.create_dom_element({element_type:"div",class_name:"title"+_+(l>0?" blue":""),text_content:i,parent:a});for(let e=0;e<l;e++){const t=o[e];common.create_dom_element({element_type:"div",class_name:"pdf",title:t.title,parent:a}).addEventListener("click",e=>{window.open(t.iri,"PDF","menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes")})}return a},row_body:function(){const e=this.biblio_object,t=this.get_typology(),n=common.create_dom_element({element_type:"div",class_name:"info_line row_body "+t});switch(t){case"book":e.place&&common.create_dom_element({element_type:"div",class_name:"info_value place grey",text_content:e.place,parent:n}),e.editor&&common.create_dom_element({element_type:"div",class_name:"info_value editor grey",text_content:": "+e.editor,parent:n});break;default:if(e.magazine&&common.create_dom_element({element_type:"div",class_name:"info_value magazine grey italic",text_content:e.magazine,parent:n}),e.serie&&common.create_dom_element({element_type:"div",class_name:"info_value serie grey",text_content:": "+e.serie,parent:n}),e.volume){const t=e.serie.length>0?", "+e.volume:e.volume;common.create_dom_element({element_type:"div",class_name:"info_value volume grey italic",text_content:t,parent:n})}if(e.other_people_name&&e.other_people_name.length>0){const t=e.other_people_name.split(" | "),o=e.other_people_role.split(" | ");for(let l=0;l<t.length;l++){const a=t[l],i=void 0!==o[l]?" ("+o[l]+")":"",_=e.serie.length>0||e.volume&&e.volume.length>0?", "+a+i:a+i;common.create_dom_element({element_type:"div",class_name:"info_value other_people_name grey",text_content:_,parent:n})}}if(e.physical_description){const t=e.serie.length>0||e.volume&&e.volume.length>0?", "+e.physical_description:e.physical_description;common.create_dom_element({element_type:"div",class_name:"info_value physical_description grey",text_content:t,parent:n})}}return n},row_url:function(){const e=this.biblio_object,t=common.create_dom_element({element_type:"div",class_name:"info_line row_url"}),n=e.url_data;if(n&&n.length>0){const e=JSON.parse(n),o=e.length;for(let n=0;n<o;n++){const l=e[n];common.create_dom_element({element_type:"a",class_name:"url_data",title:l.title,text_content:l.title,href:l.iri,parent:t}),!(n%2)&&n<o&&o>1&&common.create_dom_element({element_type:"span",class_name:"separator",text_content:" | ",parent:t})}}return t},descriptors:function(e){const t=this,n=(this.biblio_object,common.create_dom_element({element_type:"div",class_name:"info_line descriptors"})),o=e.split(" - ");for(let e=0;e<o.length;e++){const l=o[e];common.create_dom_element({element_type:"a",class_name:"descriptors_link",text_content:l,parent:n}).addEventListener("click",(function(){t.caller.search_item("descriptors",l)}))}return n}};