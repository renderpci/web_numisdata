var analysis_min=function(exports){"use strict";const t=["#1f77b4","#ff7f0e","#2ca02c","#d62728","#9467bd","#8c564b","#e377c2","#17becf"];function e(t,n){if(this.constructor===e)throw new Error("Abstract class 'chart_wrapper' cannot be instantiated");e._n_charts_created++,this.id=e._n_charts_created,this.div_wrapper=t,this._display_download=n.display_download||!1,this._download_chart_container=void 0,this.plot_container=void 0,this._display_control_panel=n.display_control_panel||!1,this.controls_container=void 0}function n(t,i){if(this.constructor===n)throw new Error("Abstract class 'd3_chart_wrapper' cannot be instantiated");e.call(this,t,i),this.svg=void 0}function i(t){0==t.attr("opacity")?t.transition().attr("opacity",1):t.transition().attr("opacity",0)}function r(t,e,n){const i=(e-t)/(n-1);return d3.range(n).map((e=>t+e*i))}e._n_charts_created=0,e.prototype.id_string=function(){return`chart${this.id}`},e.prototype.render=function(){this.div_wrapper.replaceChildren(),this._display_download&&this._render_download_panel(),this.render_plot(),this._display_control_panel&&this.render_control_panel()},e.prototype._render_download_panel=function(){const t=this.get_supported_export_formats();if(t.length){this.download_chart_container=common.create_dom_element({element_type:"div",id:`${this.id_string()}_download_chart_container`,class_name:"o-purple download_chart_container",style:{display:"flex","flex-direction":"row","justify-content":"center"},parent:this.div_wrapper});const e=common.create_dom_element({element_type:"select",id:`${this.id_string()}_chart_export_format`,style:{width:"80%"},parent:this.download_chart_container});for(const n of t)common.create_dom_element({element_type:"option",value:n,text_content:n.toUpperCase(),parent:e});common.create_dom_element({element_type:"button",text_content:"Download",style:{width:"20%"},parent:this.download_chart_container}).addEventListener("click",(()=>{this.download_chart(e.value)}))}},e.prototype.render_plot=function(){this.plot_container=common.create_dom_element({element_type:"div",id:`${this.id_string()}_plot_container`,class_name:"o-purple plot_container",parent:this.div_wrapper})},e.prototype.render_control_panel=function(){this.controls_container=common.create_dom_element({element_type:"div",id:`${this.id_string()}_control_panel`,class_name:"o-green control_panel",parent:this.div_wrapper})},e.prototype.download_chart=function(t){const e=`chart.${t}`,n=`download_chart_as_${t}`;if(void 0===this[n])throw new Error(`${n} is not implemented!`);this[n](e)},e.prototype.get_supported_export_formats=function(){return[]},Object.setPrototypeOf(n.prototype,e.prototype),n.prototype.render_plot=function(){e.prototype.render_plot.call(this),this.svg=d3.select(this.plot_container).append("svg").attr("version","1.1").attr("xmlns","http://www.w3.org/2000/svg").attr("width","100%")},n.prototype.get_supported_export_formats=function(){return["svg"]},n.prototype.download_chart_as_svg=function(t){const e=this.svg.node().outerHTML,n=new Blob([e],{type:"image/svg+xml;charset=utf-8"}),i=URL.createObjectURL(n),r=common.create_dom_element({element_type:"a",href:i});r.setAttribute("download",t),r.click(),r.remove(),URL.revokeObjectURL(i)};const o={Basis:d3.curveBasis,"Basis closed":d3.curveBasisClosed,"Basis open":d3.curveBasisOpen,Bundle:d3.curveBundle,"Bump X":d3.curveBumpX,"Bump Y":d3.curveBumpY,Cardinal:d3.curveCardinal,"Cardinal closed":d3.curveCardinalClosed,"Cardinal open":d3.curveCardinalOpen,"Catmull-Rom":d3.curveCatmullRom,"Catmull-Rom closed":d3.curveCatmullRomClosed,"Catmull-Rom open":d3.curveCatmullRomOpen,Linear:d3.curveLinear,"Linear closed":d3.curveLinearClosed,"Monotone X":d3.curveMonotoneX,"Monotone Y":d3.curveMonotoneY,Natural:d3.curveNatural,Step:d3.curveStep,"Step after":d3.curveStepAfter,"Step before":d3.curveStepBefore};function a(){}function s(...t){if(!t.length)throw new Error("There are no input arrays");const e=t[0].length;for(const n of t.slice(1))if(n.length!==e)return!1;for(let n=0;n<e;n++){const e=t[0][n];for(const i of t.slice(1))if(i[n]!==e)return!1}return!0}a.sqrt=function(t){return Math.ceil(Math.sqrt(t.length))},a.sturges=function(t){return Math.ceil(Math.log2(t.length))+1},a.rice=function(t){return Math.ceil(2*Math.pow(t.length,1/3))},a.doane=function(t){const e=t.length;if(e<2)throw new Error("Doane's rule needs at least 2 datapoints");const n=Math.sqrt(6*(e-2)/((e+1)*(e+3))),i=d3.deviation(t),r=d3.mean(t),o=d3.sum(t),a=Math.sqrt(e*(e+1))/(e-2)*((o-e*r)/(e*Math.pow(i,3)));return 1+Math.ceil(Math.log2(e))+Math.ceil(Math.log2(1+Math.abs(a)/n))},a.scott=function(t){if(t.length<2)throw new Error("Cannot compute standard deviation of an array with less than 2 values");return Math.ceil((d3.max(t)-d3.min(t))*Math.pow(t.length,1/3)/(3.49*d3.deviation(t)))},a.freedman_diaconis=function(t){const e=d3.quantile(t,.75),n=d3.quantile(t,.25),i=e-n;if(n===e)throw new Error("IQR is 0!");return Math.ceil((d3.max(t)-d3.min(t))*Math.pow(t.length,1/3)/(2*i))};const l={"text-align":"left",padding:"0.7em","padding-left":"0.8em","font-size":"0.9em"};function _(e,i,s,l){n.call(this,e,l),this._overflow=l.overflow||!1;const _=l.sort_xaxis||!1;if(!i.length)throw new Error("Data array is empty");this._data=_?i.sort(((t,e)=>t.key.join().localeCompare(e.key.join()))):i;for(const[t,e]of this._data.entries())e.index=t,e.metrics=c(e.values),e.outliers=e.values.filter((t=>t<e.metrics.lower_fence||t>e.metrics.upper_fence)),e.extent=d3.extent(e.values);this._data_extent=d3.extent(this._data.map((t=>t.extent)).flat()),this._key_strings=this._data.map((t=>d(t.key))),this._key_size=i[0].key.length,this._key_titles=s,this._colors=this._data.map(((e,n)=>t[n%t.length])),this._ylabel=l.ylabel||null,this.yaxis_padding=this._ylabel?62:35,this._full_width=330.664701211*Math.sqrt(this._data.length)-170.664701211+this.yaxis_padding,this._full_height=453,this._chart={},this._chart.margin={top:15,right:4,bottom:61,left:this.yaxis_padding},this._chart.width=this._full_width-this._chart.margin.left-this._chart.margin.right,this._chart.height=this._full_height-this._chart.margin.top-this._chart.margin.bottom,this._chart.yscale=d3.scaleLinear().range([this._chart.height,0]).domain(this._data_extent).clamp(!0),this._chart.yticks_division=2,this._chart.yaxis=d3.axisLeft(this._chart.yscale).tickFormat(((t,e)=>e%this._chart.yticks_division?"":t.toFixed(1))).ticks(19),this._chart.violin_scale={initial:.8,value:.8},this._chart.box_scale={initial:.3,value:.3},this._chart.xscale=d3.scaleBand().domain(this._key_strings).range([0,this._chart.width]),this._chart.xaxis=d3.axisBottom(this._chart.xscale).tickFormat((t=>{return(e=t,e.split(h))[1];var e})),this._chart.xticklabel_angle=l.xticklabel_angle||0,this._chart.n_bins=this._data.map((t=>{const e=a.sturges(t.values);return{initial:e,value:e}})),this._chart.histogram=this._data.map(((t,e)=>d3.bin().domain(t.extent).thresholds(r(t.extent[0],t.extent[1],this._chart.n_bins[e].value+1)))),this._chart.bins=this._data.map(((t,e)=>this._chart.histogram[e](t.values))),this._chart.supported_curves=["Basis","Bump Y","Cardinal","Catmull-Rom","Linear","Monotone Y","Natural","Step"],this._chart.violin_curve=o[this._chart.supported_curves[0]],this._graphics={root_g:null,yaxwl_g:null,xaxis_g:null,yaxwl_g:null,yaxis_g:null,cdividers_g:null,violins_g:null,violins:[],boxes_g:null,outliers:[],tooltip_div:null},this._controls={},this._controls.max_bins_multiplier=3,this._controls.selected_index=0}function c(t){const e={max:null,upper_fence:null,quartile3:null,median:null,mean:null,iqr:null,quartile1:null,lower_fence:null,min:null};return e.min=d3.min(t),e.quartile1=d3.quantile(t,.25),e.median=d3.median(t),e.mean=d3.mean(t),e.quartile3=d3.quantile(t,.75),e.max=d3.max(t),e.iqr=e.quartile3-e.quartile1,e.lower_fence=e.quartile1-1.5*e.iqr,e.upper_fence=e.quartile3+1.5*e.iqr,e}Object.setPrototypeOf(_.prototype,n.prototype),_.prototype._query_data=function(t){if(t.length!==this._key_size)throw new Error("Key template is of different size than the plot keys");return this._data.filter((e=>{const n=e.key;for(let e=0;e<n.length;e++)if(t[e]&&t[e]!==n[e])return!1;return!0}))},_.prototype._get_key_templates=function(t){if(t<1||t>this._key_size)throw new Error(`Invalid key number ${t}`);t=this._key_size-t;const e=this._data.map((e=>{return(n=e.key.slice(0,t+1),JSON.parse(JSON.stringify(n))).concat(Array(this._key_size-t-1).fill(null));var n}));if(!e.length)return e;const n=[e[0]];let i=e[0];for(const t of e.slice(1))s(i,t)||(n.push(t),i=t);return n},_.prototype._get_next_key_component_values=function(t){const e=t.length;if(e>=this._key_size)throw new Error(`Input key ${t} is longer than the data keys`);const n=t.concat(Array(this._key_size-e).fill(null)),i=this._query_data(n).map((t=>t.key[e]));if(!i.length)return i;const r=[i[0]];let o=i[0];for(const t of i.slice(1))t!==o&&(r.push(t),o=t);return r},_.prototype.get_index_of_key=function(t){const e=this._data.findIndex((e=>e.key.join()===t.join()));if(-1===e)throw new Error(`Key ${t} was not found in data`);return e},_.prototype.set_violin_scale=function(t){this._chart.violin_scale.value=t,this._graphics.violins_g.selectAll("*").remove(),this._render_violins(!0)},_.prototype.set_n_bins=function(t,e){const n=this._chart,i=this._data[t].extent;n.n_bins[t].value=e,n.histogram[t].thresholds(r(i[0],i[1],e+1)),n.bins[t]=n.histogram[t](this._data[t].values),this._graphics.violins[t].selectAll("*").remove(),this._render_violin(t)},_.prototype.set_violin_curve=function(t){this._chart.violin_curve=o[t],this._graphics.violins_g.selectAll("*").remove(),this._render_violins(!0)},_.prototype.set_box_scale=function(t){this._chart.box_scale.value=t,this._graphics.boxes_g.selectAll("*").remove(),this._render_boxes(!0)},_.prototype.render_plot=function(){n.prototype.render_plot.call(this),this._overflow&&(this.svg.attr("width",null),this.svg.attr("height","500px"),this.plot_container.style="overflow: auto;"),this.svg.attr("viewBox",`0 0 ${this._full_width} ${this._full_height}`),this._graphics.root_g=this.svg.append("g").attr("transform",`translate(${this._chart.margin.left},${this._chart.margin.top})`),this._render_axis(),this._render_ygrid(),this._key_size>1&&this._render_key2_dividers(),this._render_violins(),this._render_boxes()},_.prototype._render_axis=function(){const t=this._graphics.root_g;this._graphics.xaxwl_g=t.append("g").attr("transform",`translate(0,${this._chart.height})`);const e=this._graphics.xaxwl_g;this._graphics.xaxis_g=e.append("g").call(this._chart.xaxis),this.apply_xticklabel_angle(),e.append("text").attr("text-anchor","middle").attr("y",50).attr("x",this._chart.width/2).text(this._key_titles[this._key_titles.length-1]),this._graphics.yaxwl_g=t.append("g");const n=this._graphics.yaxwl_g;this._graphics.yaxis_g=n.append("g").call(this._chart.yaxis),n.append("text").attr("text-anchor","middle").attr("transform","rotate(-90)").attr("y",20-this._chart.margin.left).attr("x",-this._chart.height/2).text(this._ylabel)},_.prototype.apply_xticklabel_angle=function(){const t=this._chart.xticklabel_angle,e=this._graphics.xaxis_g;t<10?e.selectAll("text").attr("text-anchor","middle").attr("dy","0.8em").attr("dx","0").attr("transform",`rotate(${-this._chart.xticklabel_angle})`):(e.selectAll("text").attr("text-anchor","end").attr("dy",-t*t*6172839e-11+"em").attr("dx","-0.9em").attr("transform",`rotate(${-this._chart.xticklabel_angle})`),t<50&&e.selectAll("text").attr("dx","-0.7em"))},_.prototype._render_ygrid=function(){this._graphics.yaxis_g.selectAll("g.tick").append("line").attr("x1",0).attr("y1",0).attr("x2",this._chart.width).attr("y2",0).attr("stroke",((t,e)=>e%2?"#E0E0E0":"#D1D1D1")).attr("stroke-width",((t,e)=>e%2?.5:.8)).attr("class",((t,e)=>e%2?"minor":"major")).attr("opacity",0)},_.prototype.apply_ygrid_mode=function(t){const e=this._graphics.yaxis_g.selectAll("g.tick line.major"),n=e.attr("opacity"),r=this._graphics.yaxis_g.selectAll("g.tick line.minor"),o=r.attr("opacity");switch(t){case"None":1==n&&i(e),1==o&&i(r);break;case"Major":0==n&&i(e),1==o&&i(r);break;case"Major + Minor":0==n&&i(e),0==o&&i(r);break;default:throw new Error(`Grid mode '${t}' is not supported?`)}},_.prototype._render_key2_dividers=function(){this._graphics.key2_dividers_g=this._graphics.root_g.append("g");const t=this._graphics.key2_dividers_g,e="gray",n=this._get_key_templates(2);let i=0;for(const[r,o]of n.entries()){const n=this._query_data(o),a=this._chart.xscale(this._key_strings[i]),s=t.append("g").attr("transform",`translate(${a},0)`);0!==r&&s.append("line").attr("x1",0).attr("y1",0).attr("x2",0).attr("y2",this._chart.height).attr("stroke",e).attr("stroke-width",.9).attr("stroke-dasharray",this._chart.height/35),s.append("text").attr("text-anchor","end").attr("transform","rotate(-90)").attr("y","1.3em").attr("x","-0.6em").attr("font-size","0.8em").attr("fill",e).text(o[o.length-2]),i+=n.length}},_.prototype._render_violins=function(t=!1){const e=this._chart,n=this._graphics.root_g;t||(this._graphics.violins_g=n.append("g"));const i=this._graphics.violins_g;for(const[t,n]of this._key_strings.entries())this._graphics.violins[t]=i.append("g").attr("transform",`translate(${e.xscale(n)},0)`),this._render_violin(t)},_.prototype._render_violin=function(t){const e=this._chart.bins[t],n=this._chart.violin_scale.value,i=this._chart.xscale.bandwidth(),r=this._chart.yscale,o=this._chart.violin_curve,a=d3.max(e,(t=>t.length)),s=d3.scaleLinear().range([0,i]).domain([-a,a]);this._data[t].values.length>1&&this._graphics.violins[t].append("path").datum(e).style("stroke","gray").style("stroke-width",.4).style("fill","#d2d2d2").attr("d",d3.area().x0((t=>s(-t.length*n))).x1((t=>s(t.length*n))).y((t=>r(t.x0))).curve(o))},_.prototype._render_boxes=function(t=!1){const e=this._chart,n=this._graphics.root_g;t||(this._graphics.boxes_g=n.append("g"));const i=this._graphics.boxes_g,r=e.xscale.bandwidth(),o=this._chart.box_scale.value*r;for(const[t,n]of this._data.entries()){const a=n.metrics,s=this._colors[t],l=n.key,_=i.append("g").attr("transform",`translate(${e.xscale(d(l))+r/2},0)`);this._graphics.outliers[t]=_.append("g");const c=this._graphics.outliers[t];for(const t of n.outliers)c.append("circle").attr("cx",0).attr("cy",e.yscale(t)).attr("r",4).style("fill",s).style("opacity",.7);const h=_.append("g");h.append("line").attr("x1",0).attr("y1",e.yscale(a.lower_fence)).attr("x2",0).attr("y2",e.yscale(a.upper_fence)).attr("stroke",s).attr("stroke-width",2),h.append("line").attr("x1",-o/2).attr("y1",e.yscale(a.lower_fence)).attr("x2",o/2).attr("y2",e.yscale(a.lower_fence)).attr("stroke",s).attr("stroke-width",2),h.append("line").attr("x1",-o/2).attr("y1",e.yscale(a.upper_fence)).attr("x2",o/2).attr("y2",e.yscale(a.upper_fence)).attr("stroke",s).attr("stroke-width",2);const p=_.append("g");n.values.length>1&&p.append("rect").attr("x",-o/2).attr("y",e.yscale(a.quartile3)).attr("width",o).attr("height",e.yscale(a.quartile1)-e.yscale(a.quartile3)).attr("fill",s),p.append("line").attr("x1",-o/2).attr("y1",e.yscale(a.median)).attr("x2",o/2).attr("y2",e.yscale(a.median)).attr("stroke","black").attr("stroke-width",3),p.append("circle").attr("cx",0).attr("cy",e.yscale(a.median)).attr("r",4.5).style("fill","white").attr("stroke","black").attr("stroke-width",2)}},_.prototype._render_tooltip=function(){const t=common.create_dom_element({element_type:"div",id:`${this.id_string()}_tooltip_div`,class_name:"o-red"});var e,n;e=t,(n=this.plot_container).parentNode.insertBefore(e,n.nextSibling),this._graphics.tooltip_div=d3.select(t);const i=this._graphics.tooltip_div;i.style("display","none");for(const[t,e]of Object.entries(l))i.style(t,e)},_.prototype.tooltip_hover=function(t){const e=this._metrics[t],n=`<b>${split_class_group_name(t).join(" ")}</b><span style="font-size: smaller;"><br>Datapoints: ${this._data_flat[t].length}<br>Mean: ${e.mean.toFixed(3)}<br>Max: ${e.max.toFixed(3)}<br>Q3: ${e.quartile3.toFixed(3)}<br>Median: ${e.median.toFixed(3)}<br>Q1: ${e.quartile1.toFixed(3)}<br>Min: ${e.min.toFixed(3)}</span>`;this._graphics.tooltip_div.style("opacity",.9).html(n)},_.prototype.render_control_panel=function(){n.prototype.render_control_panel.call(this),this._render_grid_select(),this._render_xticklabel_angle_slider(),this._render_violin_curve_selector(),this._render_checkboxes(),this._render_scale_sliders(),this._render_n_bins_control()},_.prototype._render_grid_select=function(){const t=`${this.id_string()}_grid_select`;common.create_dom_element({element_type:"label",text_content:tstring.grid||"Grid",parent:this.controls_container}).setAttribute("for",t);const e=common.create_dom_element({element_type:"select",id:t,parent:this.controls_container});common.create_dom_element({element_type:"option",value:"None",text_content:tstring.none_f||"None",parent:e}),common.create_dom_element({element_type:"option",value:"Major",text_content:tstring.major||"Major",parent:e}),common.create_dom_element({element_type:"option",value:"Major + Minor",text_content:tstring.major_minor||"Major + Minor",parent:e}),e.addEventListener("change",(()=>{const t=e.value;this.apply_ygrid_mode(t)}))},_.prototype._render_xticklabel_angle_slider=function(){const t=`${this.id_string()}_xticklabel_angle_slider`;common.create_dom_element({element_type:"label",text_content:tstring.xticklabel_angle||"X-Tick label angle",parent:this.controls_container}).setAttribute("for",t);const e=common.create_dom_element({element_type:"input",type:"range",id:t,parent:this.controls_container});e.setAttribute("min",0),e.setAttribute("max",90),e.value=this._chart.xticklabel_angle,e.addEventListener("input",(()=>{this._chart.xticklabel_angle=Number(e.value),this.apply_xticklabel_angle()}))},_.prototype._render_violin_curve_selector=function(){const t=`${this.id_string()}_curve_select`;common.create_dom_element({element_type:"label",text_content:tstring.violin_interpolator||"Violin interpolator",parent:this.controls_container}).setAttribute("for",t);const e=common.create_dom_element({element_type:"select",id:t,parent:this.controls_container});for(const t of this._chart.supported_curves)common.create_dom_element({element_type:"option",value:t,text_content:t,parent:e});e.addEventListener("change",(()=>{this.set_violin_curve(e.value)}))},_.prototype._render_checkboxes=function(){const t=`${this.id_string()}_show_key2_checkbox`,e=common.create_dom_element({element_type:"input",type:"checkbox",id:t,parent:this.controls_container});e.checked=!0;common.create_dom_element({element_type:"label",text_content:(tstring.show||"Show")+" "+this._key_titles[this._key_size-2].toLowerCase(),parent:this.controls_container}).setAttribute("for",t),e.addEventListener("change",(()=>{i(this._graphics.key2_dividers_g)}));const n=`${this.id_string()}_show_violins_checkbox`,r=common.create_dom_element({element_type:"input",type:"checkbox",id:n,parent:this.controls_container});r.checked=!0;common.create_dom_element({element_type:"label",text_content:tstring.show_violins||"Show violins",parent:this.controls_container}).setAttribute("for",n),r.addEventListener("change",(()=>{i(this._graphics.violins_g)}));const o=`${this.id_string()}_show_boxes_checkbox`,a=common.create_dom_element({element_type:"input",type:"checkbox",id:o,parent:this.controls_container});a.checked=!0;common.create_dom_element({element_type:"label",text_content:tstring.show_boxes||"Show boxes",parent:this.controls_container}).setAttribute("for",o),a.addEventListener("change",(()=>{i(this._graphics.boxes_g)}));const s=`${this.id_string()}_show_outliers_checkbox`,l=common.create_dom_element({element_type:"input",type:"checkbox",id:s,parent:this.controls_container});l.checked=!0;common.create_dom_element({element_type:"label",text_content:tstring.show_outliers||"Show outliers",parent:this.controls_container}).setAttribute("for",s),l.addEventListener("change",(()=>{for(const t of this._graphics.outliers)i(t)}))},_.prototype._render_scale_sliders=function(){const t=`${this.id_string()}_violin_scale_slider`;common.create_dom_element({element_type:"label",text_content:tstring.violin_width||"Violin width",parent:this.controls_container}).setAttribute("for",t);const e=common.create_dom_element({element_type:"input",type:"range",id:t,parent:this.controls_container});e.setAttribute("min",0),e.setAttribute("max",1),e.setAttribute("step",.05),e.value=this._chart.violin_scale.initial,e.addEventListener("input",(()=>{this.set_violin_scale(Number(e.value))}));common.create_dom_element({element_type:"button",type:"button",text_content:tstring.reset||"Reset",parent:this.controls_container}).addEventListener("click",(()=>{e.value=this._chart.violin_scale.initial,this.set_violin_scale(Number(e.value))}));const n=`${this.id_string()}_box_scale_slider`;common.create_dom_element({element_type:"label",text_content:tstring.box_width||"Box width",parent:this.controls_container}).setAttribute("for",n);const i=common.create_dom_element({element_type:"input",type:"range",id:n,parent:this.controls_container});i.setAttribute("min",0),i.setAttribute("max",1),i.setAttribute("step",.05),i.value=this._chart.box_scale.initial,i.addEventListener("input",(()=>{this.set_box_scale(Number(i.value))}));common.create_dom_element({element_type:"button",type:"button",text_content:"Reset",parent:this.controls_container}).addEventListener("click",(()=>{i.value=this._chart.box_scale.initial,this.set_box_scale(Number(i.value))}))},_.prototype._render_n_bins_control=function(){const t=[],e=e=>{t[e].replaceChildren();const n=t.slice(0,e).map((t=>t.value)),i=this._get_next_key_component_values(n);for(const n of i)common.create_dom_element({element_type:"option",value:n,text_content:n,parent:t[e]})};for(let n=0;n<this._key_size;n++){const r=`${this.id_string()}_key${this._key_size-n}_select`;common.create_dom_element({element_type:"label",text_content:this._key_titles[n],parent:this.controls_container}).setAttribute("for",r);const o=common.create_dom_element({element_type:"select",id:r,parent:this.controls_container});t.push(o),e(n),o.addEventListener("change",(()=>{for(let i=n+1;i<t.length;i++)e(i);this._controls.selected_index=this.get_index_of_key(t.map((t=>t.value))),i.setAttribute("max",this._controls.max_bins_multiplier*this._chart.n_bins[this._controls.selected_index].initial),i.value=this._chart.n_bins[this._controls.selected_index].value}))}const n=`${this.id_string()}_violin_n_bins_slider`;common.create_dom_element({element_type:"label",text_content:tstring.violin_resolution||"Violin resolution",parent:this.controls_container}).setAttribute("for",n);const i=common.create_dom_element({element_type:"input",type:"range",id:n,parent:this.controls_container});i.setAttribute("min",2),i.setAttribute("max",this._controls.max_bins_multiplier*this._chart.n_bins[this._controls.selected_index].initial),i.value=this._chart.n_bins[this._controls.selected_index].value,i.addEventListener("input",(()=>{this.set_n_bins(this._controls.selected_index,Number(i.value))}));common.create_dom_element({element_type:"button",type:"button",text_content:tstring.reset||"Reset",parent:this.controls_container}).addEventListener("click",(()=>{i.value=this._chart.n_bins[this._controls.selected_index].initial,this.set_n_bins(this._controls.selected_index,Number(i.value))}));common.create_dom_element({element_type:"button",type:"button",text_content:tstring.reset_all_violins||"Reset all violins",parent:this.controls_container}).addEventListener("click",(()=>{i.value=this._chart.n_bins[this._controls.selected_index].initial;for(const[t,e]of this._chart.n_bins.entries())this.set_n_bins(t,e.initial)}))};const h="_^PoT3sRanaCantora_";function d(t){return t.join(h)}function p(t,n){if(this.constructor===p)throw new Error("Abstract class 'chartjs_chart_wrapper' cannot be instantiated");e.call(this,t,n),this.canvas=void 0,this.chart=void 0}function m(e,n,i){p.call(this,e,i),this._data=n,this._density=!1,this._n_bins_default=a.sqrt(this._data),this._n_bins=void 0,this._xlabel=i.xlabel||null,this._n_decimals=3,this._max_bins_multiplier=3,this._bar_color=t[0]}Object.setPrototypeOf(p.prototype,e.prototype),p.prototype.render_plot=function(){e.prototype.render_plot.call(this),this.canvas=common.create_dom_element({element_type:"canvas",id:"result_graph",class_name:"o-blue",parent:this.plot_container}),this.chart=void 0},p.prototype.get_supported_export_formats=function(){return["png"]},p.prototype.download_chart_as_png=function(t){const e=common.create_dom_element({element_type:"a",href:this.chart.toBase64Image()});e.setAttribute("download",t),e.click(),e.remove()},p.prototype.download_chart_as_svg=function(t){this._tweak_c2s();const e=this.canvas.offsetWidth,n=this.canvas.offsetHeight;this.chart.options.animation=!1,this.chart.options.reponsive=!1;const i=C2S(e,n);new Chart(i,this.chart.config._config);const r=common.create_dom_element({element_type:"a",href:"data:image/svg+xml;utf8,"+encodeURIComponent(i.getSerializedSvg())});r.setAttribute("download",t),r.click(),r.remove(),this.chart.options.animation=!0,this.chart.options.reponsive=!0},p.prototype._tweak_c2s=function(){C2S.prototype.getContext=function(t){return"2d"===t||"2D"===t?this:null},C2S.prototype.style=function(){return this.__canvas.style},C2S.prototype.getAttribute=function(t){return this[t]},C2S.prototype.addEventListener=function(t,e,n){}},Object.setPrototypeOf(m.prototype,p.prototype),m.prototype.get_density=function(){return this._density},m.prototype.set_density=function(t){if(this._density=t,!this.chart)return;const[e,n,i,r,o]=this._get_plotting_data();this.chart.data.datasets[0].label=this._get_density_string(),this.chart.data.datasets[0].data=n,this.chart.options.scales.y.title.text=this._get_density_string(),this.chart.update()},m.prototype._get_density_string=function(){return this._density?"Density":"Frequency"},m.prototype.get_n_bins=function(){return this._n_bins},m.prototype.set_n_bins=function(t){if(this._n_bins=t,!this.chart)return;const[e,n,i,r,o]=this._get_plotting_data();this.chart.data.datasets[0].data=n,this.chart.options.scales.x.min=r,this.chart.options.scales.x.max=o,this.chart.options.scales.x.ticks.stepSize=2*i,this.chart.options.plugins.tooltip.callbacks.title=this._get_tooltip_title_callback(e,i),this.chart.update()},m.prototype.get_bar_color=function(){return this._bar_color},m.prototype.set_bar_color=function(t){this._bar_color=t,this.chart&&(this.chart.data.datasets[0].backgroundColor=this._bar_color,this.chart.update())},m.prototype._get_plotting_data=function(){const t=Math.max(...this._data),e=Math.min(...this._data),n=(t-e)/this._n_bins,i=.5*n,r=Array.apply(null,Array(this._n_bins)).map(((t,n)=>e+(2*n+1)*i));let o=Array.apply(null,Array(this._n_bins)).map((()=>0));for(let e=0;e<this._data.length;e++)if(this._data[e]!==t){for(let t=0;t<this._n_bins;t++)if(this._data[e]>=r[t]-i&&this._data[e]<r[t]+i){o[t]++;break}}else o[this._n_bins-1]++;if(this._density){const t=o.reduce(((t,e)=>t+e),0);for(let e=0;e<this._n_bins;e++)o[e]/=t*n}return[r,r.map(((t,e)=>({x:t,y:o[e]}))),i,e,t]},m.prototype._get_tooltip_title_callback=function(t,e){const n=this._xlabel,i=this._n_decimals;return function(r){if(!r.length)return"";const o=r[0].dataIndex,a=t[o]-e,s=t[o]+e;return`${n}: ${a.toFixed(i)} - ${s.toFixed(i)}`}},m.prototype.render_plot=function(){p.prototype.render_plot.call(this),this._n_bins=this._n_bins_default;const[t,e,n,i,r]=this._get_plotting_data(),o={datasets:[{label:this._get_density_string(),data:e,categoryPercentage:1,barPercentage:1,backgroundColor:this._bar_color}]},a={x:{type:"linear",min:i,max:r,offset:!1,grid:{offset:!1},ticks:{stepSize:2*n,callback:(t,e,n)=>Number(t).toFixed(this._n_decimals)},title:{display:Boolean(this._xlabel),text:this._xlabel,font:{size:14}}},y:{title:{display:!0,text:this._get_density_string(),font:{size:14}}}},s={legend:{display:!1},tooltip:{callbacks:{title:this._get_tooltip_title_callback(t,n)}}};this.chart=new Chart(this.canvas,{type:"bar",data:o,options:{scales:a,plugins:s,parsing:!1,normalized:!0}})},m.prototype.render_control_panel=function(){p.prototype.render_control_panel.call(this);const t=this,e=common.create_dom_element({element_type:"input",type:"range",value:this._n_bins_default,parent:this.controls_container});e.setAttribute("min",1),e.setAttribute("max",this._max_bins_multiplier*this._n_bins_default),e.addEventListener("input",(()=>{this.set_n_bins(Number(e.value))}));common.create_dom_element({element_type:"button",type:"button",text_content:"Reset",parent:this.controls_container}).addEventListener("click",(()=>{e.value=this._n_bins_default,this.set_n_bins(Number(e.value))}));const n=`${this.id_string()}_density_checkbox`,i=common.create_dom_element({element_type:"input",type:"checkbox",id:n,parent:this.controls_container});common.create_dom_element({element_type:"label",text_content:"Density",parent:this.controls_container}).setAttribute("for",n),i.addEventListener("change",(()=>{this.set_density(Boolean(i.checked))}));const r=common.create_dom_element({element_type:"div",id:`${this.id_string()}_color_picker_container`,parent:this.controls_container});new window.iro.ColorPicker(r,{color:this._bar_color,width:200,layoutDirection:"horizontal",layout:[{component:window.iro.ui.Wheel},{component:window.iro.ui.Slider},{component:window.iro.ui.Slider,options:{sliderType:"alpha"}}]}).on("color:change",(function(e){t.set_bar_color(e.rgbaString)}))};const u={form:null,area_name:null,row:null,export_data_container:null,form_items_container:null,diameter_chart_container:null,weight_chart_container:null,diameter_chart_wrapper:null,weight_chart_wrapper:null,set_up:function(t){const e=this;e.area_name=t.area_name,e.export_data_container=t.export_data_container,e.row=t.row,e.form_items_container=t.form_items_container,e.diameter_chart_container=t.diameter_chart_container,e.weight_chart_container=t.weight_chart_container;const n=e.render_form();return e.form_items_container.appendChild(n),!0},render_form:function(){const t=this,e=new DocumentFragment;t.form=t.form||new form_factory;const n=common.create_dom_element({element_type:"div",class_name:"form-row fields",parent:e});t.form.item_factory({id:"mint",name:"mint",label:tstring.mint||"mint",q_column:"p_mint",value_wrapper:['["','"]'],eq:"LIKE",eq_in:"%",eq_out:"%",is_term:!0,parent:n,callback:function(e){t.form.activate_autocomplete({form_item:e,table:"catalog"})}}),t.form.item_factory({id:"number",name:"number",q_column:"term",q_table:"types",label:tstring.number_key||"Number & Key",is_term:!1,parent:n,group_op:"$or",callback:function(e){t.form.activate_autocomplete({form_item:e,table:"catalog"})}}),t.form.item_factory({id:"material",name:"material",q_column:"ref_type_material",q_table:"any",label:tstring.material||"material",is_term:!1,parent:n,callback:function(e){t.form.activate_autocomplete({form_item:e,table:"catalog"})}}),t.form.item_factory({id:"denomination",name:"denomination",q_column:"ref_type_denomination",q_table:"any",label:tstring.denomination||"denomination",is_term:!1,parent:n,callback:function(e){t.form.activate_autocomplete({form_item:e,table:"catalog"})}});const i=common.create_dom_element({element_type:"div",class_name:"form-group field button_submit",parent:e});common.create_dom_element({element_type:"input",type:"submit",id:"submit",value:tstring.search||"Search",class_name:"btn btn-light btn-block primary",parent:i}).addEventListener("click",(function(e){e.preventDefault(),t.form_submit(o)}));common.create_dom_element({element_type:"input",type:"button",id:"button_reset",value:tstring.reset||"Reset",class_name:"btn btn-light btn-block secondary button_reset",parent:i}).addEventListener("click",(function(t){t.preventDefault(),window.location.replace(window.location.pathname)}));const r=t.form.build_operators_node();e.appendChild(r);const o=common.create_dom_element({element_type:"form",id:"search_form",class_name:"form-inline"});return o.appendChild(e),o},form_submit:function(t,e={}){
const n=this,i="boolean"!=typeof e.scroll_result||e.scroll_result,r=e.form_items||n.form.form_items,o=n.form.build_filter({form_items:r});if(!o||o.length<1)return!1;i&&this.diameter_chart_container.scrollIntoView({behavior:"smooth",block:"start",inline:"nearest"}),n.search_rows({filter:o,limit:0,process_result:{fn:"process_result::add_parents_and_children_recursive",columns:[{name:"parents"}]}}).then((t=>{event_manager.publish("form_submit",t),console.log(t);const e=[];for(const[n,i]of t.entries()){const t=i.ref_type_number?i.ref_type_number:`Missing Number & Key (${n})`,r=i.p_mint?i.p_mint[0]:`Missing mint (${n})`,o=i.ref_type_material?i.ref_type_material:`Missing material (${n})`,a=i.ref_type_denomination?i.ref_type_denomination:`Missing denomination ${n}`,s={},l=i.full_coins_reference_calculable,_=i.full_coins_reference_diameter_max,c=i.full_coins_reference_diameter_min,h=i.full_coins_reference_weight;if(_&&_.length){const t=_.filter(((t,e)=>t&&l[e]));t.length&&(s.diameter_max=t)}if(c&&c.length){const t=c.filter(((t,e)=>t&&l[e]));t.length&&(s.diameter_min=t)}if(h&&h.length){const t=h.filter(((t,e)=>t&&l[e]));t.length&&(s.weight=t)}Object.keys(s).length&&(s.number_key=t,s.mint=r,s.material=o,s.denomination=a,e.push(s))}console.log(e);const n=e.filter((t=>t.weight)).map((t=>({key:[t.mint,t.number_key],values:t.weight})));console.log("Weights:"),console.log(n),this.weight_chart_wrapper=new _(this.weight_chart_container,n,[tstring.mint||"Mint",tstring.number_key||"Number & Key"],{ylabel:tstring.weight||"Weight",overflow:!0,display_control_panel:!0,display_download:!0,sort_xaxis:!0}),this.weight_chart_wrapper.render();const i=e.filter((t=>t.diameter_max)).map((t=>({key:[t.mint,t.number_key],values:t.diameter_max})));console.log("Diameters:"),console.log(i)}))},search_rows:function(t){const e=this,n=t.filter||null,i=t.ar_fields||["*"],r=t.order||"norder ASC",o=page_globals.WEB_CURRENT_LANG_CODE,a=t.process_result||null,s=null!=t.limit?t.limit:30;return new Promise((function(t){const l=[],_=e.form.parse_sql_filter(n),c={dedalo_get:"records",table:"catalog",ar_fields:i,lang:o,sql_filter:_,limit:s,group:l.length>0?l.join(","):null,count:!1,order:r,process_result:a};data_manager.request({body:c}).then((e=>{const n=page.parse_catalog_data(e.result);t(n)}))}))}};return exports.analysis=u,Object.defineProperty(exports,"__esModule",{value:!0}),exports}({});
//# sourceMappingURL=analysis-min.js.map