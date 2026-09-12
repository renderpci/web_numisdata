<?php declare(strict_types=1);

// type

	// area name
		$area_name 	= $_GET['area_name'];
		$ar_parts 	= explode('/', $area_name);

	// section_id (is inside get var 'area_name' as '/min/36')
		// url_id. URL var could be number or text as '19874' or '19874.rdf'
		$url_id		= $ar_parts[1] ?? '';
		// section_id integer value like: 19874
		$section_id = (int) preg_replace('/\D/', '', $url_id);

	// extension
		$url_id_parts	= pathinfo($url_id);
		$extension		= $url_id_parts['extension'] ?? '';   // '' if no extension

		switch (strtolower($extension)) {
			case 'rdf':

				$rdf_data = page::get_rdf_data('types', $section_id);

				// Empty data case
				if (empty($rdf_data)) {
					// The request was valid, but nothing to return.
					header('HTTP/1.1 204 No Content');
					// Optionally set headers that are always sent:
					header('X-Content-Type-Options: nosniff');
					die(); // No body
				}

				// Send headers
				header('Content-Type: text/turtle; charset=utf-8');
				header('Cache-Control: no-cache, no-store, must-revalidate'); // or max-age=3600
				header('Expires: 0');
				header('X-Content-Type-Options: nosniff');

				// Optional CORS (uncomment if needed)
				// header('Access-Control-Allow-Origin: *');

				echo $rdf_data;
				die();
				break;

			case 'json':

				$json_data = page::get_json_data('types', $section_id);

				// Empty data case
				if (empty($json_data)) {
					// The request was valid, but nothing to return.
					header('HTTP/1.1 204 No Content');
					// Optionally set headers that are always sent:
					header('X-Content-Type-Options: nosniff');
					die(); // No body
				}

				// Send headers
				header('Content-Type: application/json; charset=utf-8');
				header('Cache-Control: no-store, no-cache, must-revalidate');
				header('Pragma: no-cache');

				// Optional CORS (uncomment if needed)
				// header('Access-Control-Allow-Origin: *');

				echo json_encode($json_data, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
				die();
				break;

			default:

				// css
					// page::$css_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/jquery-ui/jquery-ui.min.css';
					array_unshift(page::$css_ar_url,
						__WEB_TEMPLATE_WEB__ . '/assets/lib/leaflet/leaflet.css',
						__WEB_TEMPLATE_WEB__ . '/assets/lib/leaflet/markercluster/MarkerCluster.css',
						// __WEB_TEMPLATE_WEB__ . '/catalog/css/catalog.css'
					);

				// js
					// page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/jquery-ui/jquery-ui.min.js';
					// page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/page/js/paginator'.JS_SUFFIX.'.js';
					page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/leaflet/leaflet.js';
					page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/leaflet/markercluster/leaflet.markercluster.js';
					page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/catalog/js/catalog'.JS_SUFFIX.'.js';
					page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/catalog/js/catalog_row_fields'.JS_SUFFIX.'.js';
					// regression_logic (plain global) shared with the regression/mint pages for the die estimation
					page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/regression/js/regression_logic'.JS_SUFFIX.'.js';
					// page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/mints/js/mints'.JS_SUFFIX.'.js';

					// row_fields js add
					page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/' . $cwd . '/js/type_row_fields'.JS_SUFFIX.'.js';

				// page basic vars
					$title		= $this->get_element_from_template_map('title', $template_map->{$mode});
					$abstract	= $this->get_element_from_template_map('abstract', $template_map->{$mode});
					$body		= $this->get_element_from_template_map('body', $template_map->{$mode});
					$ar_image	= $this->get_element_from_template_map('image', $template_map->{$mode});

				// page_title fix
					$this->page_title = $this->row->term;

				break;
		}
