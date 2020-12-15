"use strict";var forms={build_form_item:function(e){return{id:e.name,name:e.name,label:e.label,q:"",q_selected:[],q_column:e.q_column,eq:"LIKE",eq_in:e.eq_in||"",eq_out:e.eq_out||"%",is_term:e.is_term||!1,node_input:null,node_values:null}},build_form_node:function(e,t){const n=common.create_dom_element({element_type:"div",class_name:"form-group field field_"+e.id,parent:t}),o=common.create_dom_element({element_type:"input",type:"text",id:e.id,class_name:"form-control ui-autocomplete-input",placeholder:e.label,parent:n});o.addEventListener("keyup",(function(t){e.q=t.target.value})),o.addEventListener("change",(function(t){e.q=t.target.value})),e.node_input=o;const r=common.create_dom_element({element_type:"div",class_name:"container_values",parent:n});return e.node_values=r,!0},build_operators_node:function(){const e=common.create_dom_element({element_type:"div",class_name:"form-group field field_operators"}),t=(common.create_dom_element({element_type:"span",class_name:"operators",text_content:tstring.operator||"Operator",parent:e}),common.create_dom_element({element_type:"input",type:"radio",id:"operator_or",parent:e}));t.setAttribute("name","operators"),t.setAttribute("value","OR");common.create_dom_element({element_type:"label",text_content:tstring.or||"or",parent:e});const n=common.create_dom_element({element_type:"input",type:"radio",id:"operator_and",name:"operators",parent:e});n.setAttribute("name","operators"),n.setAttribute("value","AND"),n.setAttribute("checked","checked");common.create_dom_element({element_type:"label",text_content:tstring.and||"and",parent:e});return e}};