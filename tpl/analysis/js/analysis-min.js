"use strict";var analysis={form:null,area_name:null,row:null,export_data_container:null,form_items_container:null,chart_wrapper_container:null,chart_wrapper:null,set_up:function(t){const e=this;e.area_name=t.area_name,e.export_data_container=t.export_data_container,e.row=t.row,e.form_items_container=t.form_items_container,e.chart_wrapper_container=t.chart_wrapper_container;const n=e.render_form();return e.form_items_container.appendChild(n),!0},render_form:function(){const t=this,e=new DocumentFragment;t.form=t.form||new form_factory;const n=common.create_dom_element({element_type:"div",class_name:"form-row fields",parent:e});t.form.item_factory({id:"mint",name:"mint",label:tstring.mint||"mint",q_column:"p_mint",value_wrapper:['["','"]'],eq:"LIKE",eq_in:"%",eq_out:"%",is_term:!0,parent:n,callback:function(e){t.form.activate_autocomplete({form_item:e,table:"catalog"})}});const r=common.create_dom_element({element_type:"div",class_name:"form-group field button_submit",parent:e});common.create_dom_element({element_type:"input",type:"submit",id:"submit",value:tstring.search||"Search",class_name:"btn btn-light btn-block primary",parent:r}).addEventListener("click",(function(e){e.preventDefault(),t.form_submit(a)}));common.create_dom_element({element_type:"input",type:"button",id:"button_reset",value:tstring.reset||"Reset",class_name:"btn btn-light btn-block secondary button_reset",parent:r}).addEventListener("click",(function(t){t.preventDefault(),window.location.replace(window.location.pathname)}));const i=t.form.build_operators_node();e.appendChild(i);const a=common.create_dom_element({element_type:"form",id:"search_form",class_name:"form-inline"});return a.appendChild(e),a},form_submit:function(t,e={}){const n=this,r=("boolean"!=typeof e.scroll_result||e.scroll_result,e.form_items||n.form.form_items),i=n.form.build_filter({form_items:r});if(!i||i.length<1)return!1;n.search_rows({filter:i,limit:0}).then((t=>{event_manager.publish("form_submit",t);const e=t.map((t=>t.ref_type_averages_diameter)).filter((t=>null!=t));this.chart_wrapper=new histogram_wrapper(this.chart_wrapper_container,e,"Diameter"),this.chart_wrapper.render()}))},search_rows:function(t){const e=this,n=t.filter||null,r=t.ar_fields||["*"],i=t.order||"norder ASC",a=page_globals.WEB_CURRENT_LANG_CODE,o=t.process_result||null,s=null!=t.limit?t.limit:30;return new Promise((function(t){const _=[],l=e.form.parse_sql_filter(n),c={dedalo_get:"records",table:"catalog",ar_fields:r,lang:a,sql_filter:l,limit:s,group:_.length>0?_.join(","):null,count:!1,order:i,process_result:o};data_manager.request({body:c}).then((e=>{const n=page.parse_catalog_data(e.result);t(n)}))}))}};const COLOR_PICKER_WIDTH=200;function chart_wrapper(t){this.div_wrapper=t,this.canvas=void 0,this.chart=void 0,this.controls_container=void 0}function histogram_wrapper(t,e,n){chart_wrapper.call(this,t),this._data=e,this._density=!1,this._n_bins_default=Math.ceil(Math.sqrt(this._data.length)),this._n_bins=void 0,this._xlabel=n,this._n_decimals=3,this._max_bins_multiplier=3,this._bar_color="rgba(255,190,92,0.5)"}chart_wrapper.prototype.render=function(){this.canvas=common.create_dom_element({element_type:"canvas",id:"result_graph",class_name:"o-blue"}),this.div_wrapper.replaceChildren(this.canvas),this.chart=void 0,this.controls_container=void 0},histogram_wrapper.prototype.get_density=function(){return this._density},histogram_wrapper.prototype.set_density=function(t){if(this._density=t,!this.chart)return;const[e,n,r,i,a]=this._get_plotting_data();this.chart.data.datasets[0].label=this._get_density_string(),this.chart.data.datasets[0].data=n,this.chart.options.scales.y.title.text=this._get_density_string(),this.chart.update()},histogram_wrapper.prototype._get_density_string=function(){return this._density?"Density":"Frequency"},histogram_wrapper.prototype.get_n_bins=function(){return this._n_bins},histogram_wrapper.prototype.set_n_bins=function(t){if(this._n_bins=t,!this.chart)return;const[e,n,r,i,a]=this._get_plotting_data();this.chart.data.datasets[0].data=n,this.chart.options.scales.x.min=i,this.chart.options.scales.x.max=a,this.chart.options.scales.x.ticks.stepSize=2*r,this.chart.options.plugins.tooltip.callbacks.title=this._get_tooltip_title_callback(e,r),this.chart.update()},histogram_wrapper.prototype.get_bar_color=function(){return this._bar_color},histogram_wrapper.prototype.set_bar_color=function(t){this._bar_color=t,this.chart&&(this.chart.data.datasets[0].backgroundColor=this._bar_color,this.chart.update())},histogram_wrapper.prototype._get_plotting_data=function(){const t=Math.max(...this._data),e=Math.min(...this._data),n=(t-e)/this._n_bins,r=.5*n,i=Array.apply(null,Array(this._n_bins)).map(((t,n)=>e+(2*n+1)*r));let a=Array.apply(null,Array(this._n_bins)).map((()=>0));for(let e=0;e<this._data.length;e++)if(this._data[e]!==t){for(let t=0;t<this._n_bins;t++)if(this._data[e]>=i[t]-r&&this._data[e]<i[t]+r){a[t]++;break}}else a[this._n_bins-1]++;if(this._density){const t=a.reduce(((t,e)=>t+e),0);for(let e=0;e<this._n_bins;e++)a[e]/=t*n}return[i,i.map(((t,e)=>({x:t,y:a[e]}))),r,e,t]},histogram_wrapper.prototype._get_tooltip_title_callback=function(t,e){const n=this._xlabel,r=this._n_decimals;return function(i){if(!i.length)return"";const a=i[0].dataIndex,o=t[a]-e,s=t[a]+e;return`${n}: ${o.toFixed(r)} - ${s.toFixed(r)}`}},histogram_wrapper.prototype.render=function(){chart_wrapper.prototype.render.call(this),this._render_chart(),this._render_control_panel()},histogram_wrapper.prototype._render_chart=function(){this._n_bins=this._n_bins_default;const[t,e,n,r,i]=this._get_plotting_data(),a={datasets:[{label:this._get_density_string(),data:e,categoryPercentage:1,barPercentage:1,backgroundColor:this._bar_color}]},o={x:{type:"linear",min:r,max:i,offset:!1,grid:{offset:!1},ticks:{stepSize:2*n,callback:(t,e,n)=>Number(t).toFixed(this._n_decimals)},title:{display:!0,text:this._xlabel,font:{size:14}}},y:{title:{display:!0,text:this._get_density_string(),font:{size:14}}}},s={legend:{display:!1},tooltip:{callbacks:{title:this._get_tooltip_title_callback(t,n)}}};this.chart=new Chart(this.canvas,{type:"bar",data:a,options:{scales:o,plugins:s,parsing:!1,normalized:!0}})},histogram_wrapper.prototype._render_control_panel=function(){const t=this;this.controls_container=common.create_dom_element({element_type:"div",id:"controls",class_name:"o-green",parent:this.div_wrapper});const e=common.create_dom_element({element_type:"input",type:"range",value:this._n_bins_default,parent:this.controls_container});e.setAttribute("min",1),e.setAttribute("max",this._max_bins_multiplier*this._n_bins_default),e.addEventListener("input",(()=>{this.set_n_bins(Number(e.value))}));common.create_dom_element({element_type:"button",type:"button",text_content:"Reset",parent:this.controls_container}).addEventListener("click",(()=>{e.value=this._n_bins_default,this.set_n_bins(Number(e.value))}));const n=common.create_dom_element({element_type:"input",type:"checkbox",id:"density_checkbox",parent:this.controls_container});common.create_dom_element({element_type:"label",text_content:"Density",parent:this.controls_container}).setAttribute("for","density_checkbox"),n.addEventListener("change",(()=>{this.set_density(Boolean(n.checked))}));const r=common.create_dom_element({element_type:"div",id:"color_picker_container",parent:this.controls_container});new window.iro.ColorPicker(r,{color:this._bar_color,width:200,layoutDirection:"horizontal",layout:[{component:window.iro.ui.Wheel},{component:window.iro.ui.Slider},{component:window.iro.ui.Slider,options:{sliderType:"alpha"}}]}).on("color:change",(function(e){t.set_bar_color(e.rgbaString)}))};
//# sourceMappingURL=analysis-min.js.map