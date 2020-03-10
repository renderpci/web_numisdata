"use strict";var row_fields={biblio_object:null,get_typology:function(){const e=this.biblio_object.typology||"[]",t=JSON.parse(e);return"1"==(void 0!==t[0]?t[0]:0)?"book":"article"},author:function(){const e=this.biblio_object,t=common.create_dom_element({element_type:"div",class_name:"info_line author"});if(common.create_dom_element({element_type:"span",class_name:"section_id",text_content:e.section_id,parent:t}),e.authors&&e.authors.length>0){const o=e.authors_data,a=o.length,i=[];for(var n=0;n<a;n++){const e=[];o[n].surname&&e.push(o[n].surname),o[n].name&&e.push(o[n].name);const t=e.join(", ");i.push(t)}const l=i.join("; ");common.create_dom_element({element_type:"div",class_name:"info_value",text_content:l,parent:t})}else common.create_dom_element({element_type:"div",class_name:"info_value",text_content:"Undefined author",parent:t});return t},publication_date:function(){const e=this.biblio_object,t=common.create_dom_element({element_type:"div",class_name:"info_line publication_date hide"});if(e.publication_date){const n=e.publication_date.split("-");let o=parseInt(n[0]);n[1],parseInt(n[1])>0&&(o=o+"-"+parseInt(n[1])),n[2],parseInt(n[2])>0&&(o=o+"-"+parseInt(n[2])),common.create_dom_element({element_type:"div",class_name:"info_value",text_content:o,parent:t}),t.classList.remove("hide")}return t},row_title:function(){const e=this.biblio_object,t=this.get_typology(),n=e.pdf||"[]",o=JSON.parse(n),a=o.length,i=common.create_dom_element({element_type:"div",class_name:"info_line row_title"}),l=e.title||"",_="book"===t?" italic":"";common.create_dom_element({element_type:"div",class_name:"title"+_+(a>0?" blue":""),text_content:l,parent:i});for(let e=0;e<a;e++){const t=o[e];common.create_dom_element({element_type:"div",class_name:"pdf",title:t.title,parent:i}).addEventListener("click",e=>{window.open(t.iri,"PDF","menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes")})}return i},row_body:function(){const e=this.biblio_object,t=this.get_typology(),n=common.create_dom_element({element_type:"div",class_name:"info_line row_body "+t});switch(t){case"book":e.place&&common.create_dom_element({element_type:"div",class_name:"info_value place grey",text_content:e.place,parent:n}),e.editor&&common.create_dom_element({element_type:"div",class_name:"info_value editor grey",text_content:": "+e.editor,parent:n});break;default:if(e.magazine&&common.create_dom_element({element_type:"div",class_name:"info_value magazine grey italic",text_content:e.magazine,parent:n}),e.serie&&common.create_dom_element({element_type:"div",class_name:"info_value serie grey",text_content:": "+e.serie,parent:n}),e.physical_description){const t=e.serie.length>0?", "+e.physical_description:e.physical_description;common.create_dom_element({element_type:"div",class_name:"info_value physical_description grey",text_content:t,parent:n})}}return n},row_url:function(){const e=this.biblio_object,t=common.create_dom_element({element_type:"div",class_name:"info_line row_url"}),n=e.url_data;if(n&&n.length>0){const e=JSON.parse(n),o=e.length;for(let n=0;n<o;n++){const a=e[n];common.create_dom_element({element_type:"a",class_name:"url_data",title:a.title,text_content:a.title,href:a.iri,parent:t}),!(n%2)&&n<o&&o>1&&common.create_dom_element({element_type:"span",class_name:"separator",text_content:" | ",parent:t})}}return t}};