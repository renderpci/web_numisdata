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
		page::$css_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/jquery-ui/jquery-ui.min.css';
		page::$css_ar_url[] = __WEB_TEMPLATE_WEB__ . '/page/css/page.css';
		#page::$css_ar_url[] = __WEB_TEMPLATE_WEB__ . '/menu/css/menu.css';


	# js
		// app_utils . web application useful es6 modules compatible with old browsers (Configure CodeKit to ES6 Bundle IIFE)
		// page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/page/js/app_utils-min.js';
		
		page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/js/jquery.min.js';
		page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/jquery-ui/jquery-ui.min.js';
		page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/js/browser.min.js';
		page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/js/breakpoints.min.js';
		page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/js/util.js';
		page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/js/main.js';
		page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/js/jquery.poptrox.min.js';

		
		page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/page/js/page.js';
		page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/page/js/page_render.js';
		page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/page/js/data.js';
		page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/page/js/biblio_row_fields.js';
		page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/page/js/paginator.js';
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
				$html .= '<a href="'.__WEB_ROOT_WEB__.'/'.$web_path.'">'.$menu_element->term.'</a>';
				$html .= $embed_html;
				$html .= '</li>';

				return $html;
			};

		// menu_tree_html
			$this->menu_tree_html = page::render_menu_tree_plain(WEB_MENU_PARENT, $menu_tree, $li_drawer, $ul_drawer, 'children');

		

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


