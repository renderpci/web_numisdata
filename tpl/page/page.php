<?php
# Controller


	# base_links
		// $base_links = common::get_base_links();
		// define('BASE_LINKS', $base_links);


	# required classes
		#include( __WEB_TEMPLATE_PATH__ . '/common/class.mht.php');


	# breadcrumb
		$this->breadcrumb = [];

	# css
		page::$css_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/css/main.css';
		#page::$css_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/bootstrap/css/bootstrap.min.css';
		// page::$css_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/leaflet/leaflet.css';
		// page::$css_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/jquery-ui/jquery-ui.min.css';
		page::$css_ar_url[] = __WEB_TEMPLATE_WEB__ . '/page/css/page.css';
		#page::$css_ar_url[] = __WEB_TEMPLATE_WEB__ . '/menu/css/menu.css';


	# js
		// app_utils . web application useful es6 modules compatible with old browsers (Configure CodeKit to ES6 Bundle IIFE)
		// page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/page/js/app_utils-min.js';

		page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/js/jquery.min.js';
		page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/jquery-ui/jquery-ui.min.js';
		page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/js/browser.min.js';
		page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/js/breakpoints.min.js';
		page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/js/chart.min.js';
		page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/js/iro.min.js';
		page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/js/canvas2svg.js';
		page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/js/d3.min.js';
		page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/js/util'.JS_SUFFIX.'.js';
		page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/js/main'.JS_SUFFIX.'.js';
		//page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/js/jquery.poptrox.min.js';
		page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/js/image_gallery'.JS_SUFFIX.'.js';
		page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/lz-string/lz-string.min.js';
		// page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/lz-string/base64-string.js';


		page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/page/js/page'.JS_SUFFIX.'.js';
		page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/page/js/page_render'.JS_SUFFIX.'.js';
		page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/page/js/data'.JS_SUFFIX.'.js';
		page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/page/js/data_export'.JS_SUFFIX.'.js';
		page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/page/js/biblio_row_fields'.JS_SUFFIX.'.js';
		page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/page/js/paginator'.JS_SUFFIX.'.js';
		page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/page/js/app-min.js';


	# footer_html
		$this->footer_html = '';
		#$footer_template_map = new stdClass();
		#	$footer_template_map->template = 'footer';

		#$footer_info = ''; //tpl_common::get_footer_info();

		#$footer_options = new stdClass();
		#	$footer_options->template_map 		= $footer_template_map;
		#	$footer_options->mode 				= false;
		#	$footer_options->add_common_css 	= false;
		#	$footer_options->add_template_css 	= false;
		#	$footer_options->resolve_values 	= false;
		#	$footer_options->content 		 	= $footer_info;

		#$footer_html = $this->get_template_html($footer_options);

		## Fix to recover from content
		#$this->footer_html = $footer_html;


	// menu tree
		$menu_tree = $this->get_menu_tree_plain();
		// ul drawer
			$ul_drawer = function($term_id, $html) {
				if($term_id===WEB_MENU_PARENT) {
					$html = PHP_EOL . '<ul class="links root">'.$html.'</ul>';
				}else{
					$html = PHP_EOL . '<ul class="links links_inside">'.$html.'</ul>';
				}

				return $html;
			};

		// li drawer
			$li_drawer = function($menu_element, $embed_html='') {
				$html  = '';
				$html .= PHP_EOL . '<li role="'.$menu_element->web_path.'">';
				$web_path = $menu_element->web_path==='main_home' ? '' : $menu_element->web_path;
				if (isset($menu_element->active) && $menu_element->active==='no') {
					$html .= '<span class="unactive">'.$menu_element->term.'</span>';
				}else{
					$html .= '<a href="'.__WEB_ROOT_WEB__.'/'.$web_path.'">'.$menu_element->term.'</a>';
				}
				$html .= $embed_html;
				$html .= '</li>';

				return $html;
			};

		// menu_tree_html
			$this->menu_tree_html = page::render_menu_tree_plain(WEB_MENU_PARENT, $menu_tree, $li_drawer, $ul_drawer, 'children');

	// footer_data. get children recursive of menu element template_name='footer'
		$footer_row = array_find($menu_tree, function($el){
			return $el->template_name==='footer';
		});
		$footer_children = empty($footer_row)
			? []
			: page::get_children(
				$footer_row->term_id,
				$menu_tree,
				$recursive=true,
				$children_column_name='children'
			);
		// dump($footer_children, ' footer_children ++ '.to_string());
		$footer_data = [];
		foreach ($footer_children as $el) {

			// exclude
			// if ($el->menu!=='yes') {
			// 	continue;
			// }

			// images (get only url)
				$images = (!empty($el->imagen) && is_array($el->imagen))
					? array_map(function($item){
						return $item->image;
					  }, $el->imagen)
					: null;

			// children
				$children = (!empty($el->children) && is_array($el->children))
					? array_map(function($item){
						return $item->section_tipo .'_'. $item->section_id;
					  }, $el->children)
					: null;

			$item = (object)[
				'term_id'	=> $el->term_id,
				'term'		=> $el->term,
				'label'		=> $el->titulo,
				'web_path'	=> $el->web_path,
				'menu'		=> $el->menu,
				'parent'	=> $el->parent,
				'children'	=> $children,
				'images'	=> $images
			];

			$footer_data[] = $item;
		}
		// dump($footer_data, ' footer_data ++ '.to_string());
		$this->footer_data = $footer_data;
		$this->footer_root = $footer_row;

	# content_html
		$content_options = new stdClass();
			$content_options->template_map 		= $template_map; // Defined in method page->render_page_html
			$content_options->mode 				= $mode; // Defined in method page->render_page_html
			$content_options->add_common_css 	= false;
			$content_options->add_template_css 	= true;
			$content_options->resolve_values 	= true;

		$content_html = $this->get_template_html($content_options);


	# page title
		#if(isset($this->row->term)) {
		#	$this->page_title = $this->row->term;
		#}
		$page_title = $this->get_page_title();




	# build links css/js
		$css_links 	= $this->get_header_links('css');
		$js_links 	= $this->get_header_links('js', ['js_async' => 'defer']);
