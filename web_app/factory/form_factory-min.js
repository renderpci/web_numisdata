"use strict";function form_factory(){this.form_items=[],this.node=null,this.item_factory=function(e){const t=this.build_form_item(e);return this.build_form_node(t,e.parent),"function"==typeof e.callback&&e.callback(t.node_input),this.form_items[e.id]=t,t},this.build_form_item=function(e){return{id:e.name,name:e.name,label:e.label,class_name:e.class_name||null,q:e.q||"",q_selected:[],q_selected_eq:e.q_selected_eq||"=",q_column:e.q_column,q_splittable:e.q_splittable||!1,eq:e.eq||"LIKE",eq_in:void 0!==e.eq_in?e.eq_in:"",eq_out:void 0!==e.eq_out?e.eq_out:"%",is_term:e.is_term||!1,callback:e.callback||!1,node_input:null,node_values:null,input_type:e.input_type,input_values:e.input_values}},this.build_form_node=function(e,t){const n=common.create_dom_element({element_type:"div",class_name:"form-group field "+e.class_name,parent:t});switch(e.input_type){case"select":const t=common.create_dom_element({element_type:"select",id:e.id,class_name:"form-control ui-autocomplete-select"+(e.class_name?" "+e.class_name:""),value:e.q||"",parent:n});for(let n=0;n<e.input_values.length;n++)e.input_values[n],common.create_dom_element({element_type:"option",value:e.input_values[n].value,inner_html:e.input_values[n].label,parent:t});t.addEventListener("change",(function(t){console.log("e.target.value:",t.target.value),t.target.value&&(e.q=t.target.value,console.log("form_item:",e))})),e.node_input=t;break;default:const o=common.create_dom_element({element_type:"input",type:"text",id:e.id,class_name:"form-control ui-autocomplete-input"+(e.class_name?" "+e.class_name:""),placeholder:e.label,value:e.q||"",parent:n});o.addEventListener("keyup",(function(t){e.q=t.target.value})),e.node_input=o}const o=common.create_dom_element({element_type:"div",class_name:"container_values",parent:n});return e.node_values=o,!0},this.build_operators_node=function(){const e=common.create_dom_element({element_type:"div",class_name:"form-group field field_operators"}),t=(common.create_dom_element({element_type:"span",class_name:"radio operators",text_content:tstring.operator||"Operator",parent:e}),common.create_dom_element({element_type:"input",type:"radio",id:"operator_or",parent:e}));t.setAttribute("name","operators"),t.setAttribute("value","OR");common.create_dom_element({element_type:"label",text_content:tstring.or||"or",parent:e}).setAttribute("for","operator_or");const n=common.create_dom_element({element_type:"input",type:"radio",id:"operator_and",name:"operators",parent:e});n.setAttribute("name","operators"),n.setAttribute("value","AND"),n.setAttribute("checked","checked");return common.create_dom_element({element_type:"label",text_content:tstring.and||"and",parent:e}).setAttribute("for","operator_and"),e},this.add_selected_value=function(e,t,n){const o=e.node_values,a=o.querySelectorAll(".input_values");for(let e=a.length-1;e>=0;e--)if(n===a[e].value)return!1;const l=common.create_dom_element({element_type:"div",class_name:"line_value",parent:o});common.create_dom_element({element_type:"i",class_name:"icon remove fal far fa-trash-alt",parent:l}).addEventListener("click",(function(){const t=e.q_selected.indexOf(n);t>-1&&(e.q_selected.splice(t,1),this.parentNode.remove(),!0===SHOW_DEBUG&&console.log("form_item.q_selected removed value:",n,e.q_selected))}));common.create_dom_element({element_type:"span",class_name:"value_label",text_content:t,parent:l});return common.create_dom_element({element_type:"input",class_name:"input_values",parent:l}).value=n,e.q_selected.push(n),e.node_input.value="",e.q="",!0},this.build_filter=function(){const e=this.form_items,t=[];for(let[n,o]of Object.entries(e)){const e=!0===o.is_term?"OR":"AND",n={};if(n[e]=[],o.q.length>0&&"*"!==o.q){const t="AND",a={};a[t]=[];const l={field:o.q_column,value:`'${o.eq_in}${o.q}${o.eq_out}'`,op:o.eq};a[t].push(l),n[e].push(a)}if(o.q_selected.length>0)for(let t=0;t<o.q_selected.length;t++){const a=o.q_selected[t],l="AND",r={};r[l]=[];const s={field:o.q_column,value:"LIKE"===o.q_selected_eq?`'%${a}%'`:`'${a}'`,op:o.q_selected_eq};r[l].push(s),n[e].push(r)}n[e].length>0&&t.push(n)}if(SHOW_DEBUG,t.length<1)return!1;const n=this.node.querySelector('input[name="operators"]:checked'),o={};return o[n?n.value:"AND"]=t,o},this.full_text_search_operators_info=function(){const e=common.create_dom_element({element_type:"div",class_name:"full_text_search_operators_info"}),t=[{op:tstring.operator,info:tstring.description},{op:"+",info:tstring.include_the_word||"Include, the word must be present."},{op:"-",info:tstring.exclude_the_word||"Exclude, the word must not be present."},{op:">",info:tstring.increase_ranking||"Include, and increase ranking value."},{op:"<",info:tstring.decrease_ranking||"Include, and decrease the ranking value."},{op:"()",info:tstring.group_words||"Group words into subexpressions (allowing them to be included, excluded, ranked, and so forth as a group)."},{op:"~",info:tstring.negate_word||"Negate a word’s ranking value."},{op:"*",info:tstring.wildcard_at_end||"Wildcard at the end of the word."},{op:"“”",info:tstring.defines_phrase||"Defines a phrase (as opposed to a list of individual words, the entire phrase is matched for inclusion or exclusion)."}];for(let n=0;n<t.length;n++)common.create_dom_element({element_type:"div",class_name:"op",text_content:t[n].op,parent:e}),common.create_dom_element({element_type:"div",class_name:"info",text_content:t[n].info,parent:e});return e}}