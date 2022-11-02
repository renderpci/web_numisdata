"use strict";var analysis={form:null,area_name:null,row:null,export_data_container:null,form_items_container:null,chart_wrapper_container:null,chart_wrapper:null,set_up:function(t){const e=this;e.area_name=t.area_name,e.export_data_container=t.export_data_container,e.row=t.row,e.form_items_container=t.form_items_container,e.chart_wrapper_container=t.chart_wrapper_container;const n=e.render_form();return e.form_items_container.appendChild(n),!0},render_form:function(){const t=this,e=new DocumentFragment;t.form=t.form||new form_factory;const n=common.create_dom_element({element_type:"div",class_name:"form-row fields",parent:e});t.form.item_factory({id:"mint",name:"mint",label:tstring.mint||"mint",q_column:"p_mint",value_wrapper:['["','"]'],eq:"LIKE",eq_in:"%",eq_out:"%",is_term:!0,parent:n,callback:function(e){t.form.activate_autocomplete({form_item:e,table:"catalog"})}});const i=common.create_dom_element({element_type:"div",class_name:"form-group field button_submit",parent:e});common.create_dom_element({element_type:"input",type:"submit",id:"submit",value:tstring.search||"Search",class_name:"btn btn-light btn-block primary",parent:i}).addEventListener("click",(function(e){e.preventDefault(),t.form_submit(s)}));common.create_dom_element({element_type:"input",type:"button",id:"button_reset",value:tstring.reset||"Reset",class_name:"btn btn-light btn-block secondary button_reset",parent:i}).addEventListener("click",(function(t){t.preventDefault(),window.location.replace(window.location.pathname)}));const a=t.form.build_operators_node();e.appendChild(a);const s=common.create_dom_element({element_type:"form",id:"search_form",class_name:"form-inline"});return s.appendChild(e),s},form_submit:function(t,e={}){const n=this,i=("boolean"!=typeof e.scroll_result||e.scroll_result,e.form_items||n.form.form_items),a=n.form.build_filter({form_items:i});if(!a||a.length<1)return!1;n.search_rows({filter:a,limit:0}).then((t=>{event_manager.publish("form_submit",t);const e=t.map((t=>t.ref_type_averages_diameter)).filter((t=>null!=t));this.chart_wrapper=new histogram_wrapper(this.chart_wrapper_container,e,"Diameter"),this.chart_wrapper.render()}))},search_rows:function(t){const e=this,n=t.filter||null,i=t.ar_fields||["*"],a=t.order||"norder ASC",s=page_globals.WEB_CURRENT_LANG_CODE,r=t.process_result||null,o=null!=t.limit?t.limit:30;return new Promise((function(t){const l=[],c=e.form.parse_sql_filter(n),_={dedalo_get:"records",table:"catalog",ar_fields:i,lang:s,sql_filter:c,limit:o,group:l.length>0?l.join(","):null,count:!1,order:a,process_result:r};data_manager.request({body:_}).then((e=>{const n=page.parse_catalog_data(e.result);t(n)}))}))}};class chart_wrapper{constructor(t){this.div_wrapper=t,this.canvas=void 0,this.chart=void 0,this.controls_container=void 0}render(){this.canvas=common.create_dom_element({element_type:"canvas",id:"result_graph",class_name:"o-blue"}),this.div_wrapper.replaceChildren(this.canvas),this.chart=void 0,this.controls_container=void 0}}class histogram_wrapper extends chart_wrapper{constructor(t,e,n){super(t),this.data=e,this._density=!1,this.n_bins_default=Math.ceil(Math.sqrt(this.data.length)),this._n_bins=void 0,this.xlabel=n,this.n_decimals=3,this.max_bins_multiplier=3}get density(){return this._density}set density(t){if(this._density=t,!this.chart)return;const[e,n,i,a,s]=this.get_plotting_data();this.chart.data.datasets[0].label=this.density_string,this.chart.data.datasets[0].data=n,this.chart.options.scales.y.title.text=this.density_string,this.chart.update()}get density_string(){return this.density?"Density":"Frequency"}get n_bins(){return this._n_bins}set n_bins(t){if(this._n_bins=t,!this.chart)return;const[e,n,i,a,s]=this.get_plotting_data();this.chart.data.datasets[0].data=n,this.chart.options.scales.x.min=a,this.chart.options.scales.x.max=s,this.chart.options.scales.x.ticks.stepSize=2*i,this.chart.options.plugins.tooltip.callbacks.title=this.getTooltipTitleCallback(e,i),this.chart.update()}get_plotting_data(){const t=Math.max(...this.data),e=Math.min(...this.data),n=(t-e)/this.n_bins,i=.5*n,a=Array.apply(null,Array(this.n_bins)).map(((t,n)=>e+(2*n+1)*i));let s=Array.apply(null,Array(this.n_bins)).map((()=>0));for(let e=0;e<this.data.length;e++)if(this.data[e]!==t){for(let t=0;t<this.n_bins;t++)if(this.data[e]>=a[t]-i&&this.data[e]<a[t]+i){s[t]++;break}}else a[this.n_bins-1]++;if(this.density){const t=s.reduce(((t,e)=>t+e),0);for(let e=0;e<this.n_bins;e++)s[e]/=t*n}return[a,a.map(((t,e)=>({x:t,y:s[e]}))),i,e,t]}getTooltipTitleCallback(t,e){const n=this.xlabel,i=this.n_decimals;return function(a){if(!a.length)return"";const s=a[0].dataIndex,r=t[s]-e,o=t[s]+e;return`${n}: ${r.toFixed(i)} - ${o.toFixed(i)}`}}render(){super.render(),this.n_bins=this.n_bins_default;const[t,e,n,i,a]=this.get_plotting_data(),s={datasets:[{label:this.density_string,data:e,categoryPercentage:1,barPercentage:1}]},r={x:{type:"linear",min:i,max:a,offset:!1,grid:{offset:!1},ticks:{stepSize:2*n,callback:(t,e,n)=>Number(t).toFixed(this.n_decimals)},title:{display:!0,text:this.xlabel,font:{size:14}}},y:{title:{display:!0,text:this.density_string,font:{size:14}}}},o={legend:{display:!1},tooltip:{callbacks:{title:this.getTooltipTitleCallback(t,n)}}};this.chart=new Chart(this.canvas,{type:"bar",data:s,options:{scales:r,plugins:o}}),this.controls_container=common.create_dom_element({element_type:"div",id:"controls",class_name:"o-green",parent:this.div_wrapper});const l=common.create_dom_element({element_type:"input",type:"range",value:this.n_bins_default,parent:this.controls_container});l.setAttribute("min",1),l.setAttribute("max",this.max_bins_multiplier*this.n_bins_default),l.addEventListener("input",(()=>{this.n_bins=Number(l.value)}));common.create_dom_element({element_type:"button",type:"button",text_content:"Reset",parent:this.controls_container}).addEventListener("click",(()=>{l.value=this.n_bins_default,this.n_bins=Number(l.value)}));const c=common.create_dom_element({element_type:"input",type:"checkbox",id:"density_checkbox",parent:this.controls_container});common.create_dom_element({element_type:"label",text_content:"Density",parent:this.controls_container}).setAttribute("for","density_checkbox"),c.addEventListener("change",(()=>{this.density=Boolean(c.checked)}))}}
//# sourceMappingURL=analysis-min.js.map