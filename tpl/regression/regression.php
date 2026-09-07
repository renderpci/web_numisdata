<?php

// generic

	// css
		// page::$css_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/jquery-ui/jquery-ui.min.css';

	// js
		// page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/jquery-ui/jquery-ui.min.js';
		// page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/catalogo/js/catalogo'.JS_SUFFIX.'.js';
		// regression_logic (plain global) must load before the regression-min.js bundle, which spreads it
		array_unshift(page::$js_ar_url, __WEB_TEMPLATE_WEB__ . '/regression/js/regression_logic'.JS_SUFFIX.'.js');
		page::$js_ar_url[]  = __WEB_TEMPLATE_WEB__ . '/catalog/js/catalog_row_fields'.JS_SUFFIX.'.js';

	// area name
		$area_name = $_GET['area_name'] ?? '';

	// page basic vars
		$title		= $this->get_element_from_template_map('title', $template_map->{$mode});
		$abstract	= $this->get_element_from_template_map('abstract', $template_map->{$mode});
		$body		= $this->get_element_from_template_map('body', $template_map->{$mode});
		$ar_image	= $this->get_element_from_template_map('image', $template_map->{$mode});

	// body images fix url paths
		$body = str_replace('../../../media', __WEB_BASE_URL__ . '/dedalo/media', $body);

	// pdf
		$pdf_current = null;
		$pdf_title   = null;
		try {

			$pdf_url_raw   = $this->row->pdf_url ?? null;
			$pdf_title_raw = $this->row->pdf_title ?? null;
			$pdf_lang_raw  = $this->row->pdf_lang ?? null;

			if ($pdf_url_raw && $pdf_lang_raw) {
				$ar_pdf_url   = json_decode($pdf_url_raw);
				$ar_pdf_title = $pdf_title_raw ? json_decode($pdf_title_raw) : [];
				$ar_pdf_lang  = json_decode($pdf_lang_raw);

				// static section_id -> lang_code map
				$lang_map = [
					'17344' => 'lg-spa',
					'3032'  => 'lg-cat',
					'5101'  => 'lg-eng'
				];

				// find the index matching current lang
				$lang_index = null;
				foreach ($ar_pdf_lang as $i => $loc) {
					$lang_code = $lang_map[(string)$loc->section_id] ?? null;
					if ($lang_code === WEB_CURRENT_LANG_CODE) {
						$lang_index = $i;
						break;
					}
				}

				// fallback to Spanish, then to first element
				if ($lang_index === null) {
					foreach ($ar_pdf_lang as $i => $loc) {
						$lang_code = $lang_map[(string)$loc->section_id] ?? null;
						if ($lang_code === 'lg-spa') {
							$lang_index = $i;
							break;
						}
					}
				}
				if ($lang_index === null) {
					$lang_index = 0;
				}

				$pdf_current = $ar_pdf_url[$lang_index] ?? null;
				$pdf_title   = $ar_pdf_title[$lang_index] ?? null;
			}
		} catch (\Throwable $th) {
			if(SHOW_DEBUG){
				error_log('PDF parse error: ' . $th->getMessage(), E_USER_WARNING);
			}
		}