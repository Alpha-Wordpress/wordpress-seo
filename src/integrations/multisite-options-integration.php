<?php

namespace Yoast\WP\SEO\Integrations;

use Yoast\WP\SEO\Conditionals\Multisite_Conditional;
use Yoast\WP\SEO\Helpers\Options_Helper;
use Yoast\WP\SEO\Services\Options\Site_Options_Service;

/**
 * Adds hooks for the multisite options service.
 */
class Multisite_Options_Integration implements Integration_Interface {

	/**
	 * Holds the site options service instance.
	 *
	 * @var Options_Helper
	 */
	protected $site_options_service;

	/**
	 * Constructs the multisite options integration.
	 *
	 * @param Site_Options_Service $site_options_service The site options service.
	 */
	public function __construct( Site_Options_Service $site_options_service ) {
		$this->site_options_service = $site_options_service;
	}

	/**
	 * Returns the conditionals based in which this loadable should be active.
	 *
	 * @return array The array of conditionals.
	 */
	public static function get_conditionals() {
		return [ Multisite_Conditional::class ];
	}

	/**
	 * Registers the hooks.
	 *
	 * @return void
	 */
	public function register_hooks() {
		\add_filter(
			'wpseo_multisite_options_additional_configurations',
			[ $this, 'add_multisite_verify_configurations' ]
		);
	}

	/**
	 * Adds the multisite verify configurations.
	 *
	 * @param array $configurations The configurations.
	 *
	 * @return array The configurations.
	 */
	public function add_multisite_verify_configurations( array $configurations ) {
		$ms_verify_configurations = [];
		foreach ( $this->site_options_service->get_configurations() as $key => $configuration ) {
			if ( $this->is_multisite_verify_configuration( $configuration ) ) {
				$ms_verify_configurations["allow_$key"] = [
					// Use the `ms_verify` value as the default value, but ensure the type is boolean only.
					'default' => (bool) $configuration['ms_verify'],
					'types'   => [ 'boolean' ],
				];
			}
		}

		return \array_merge( $configurations, $ms_verify_configurations );
	}

	/**
	 * Checks if the configuration contains a multisite verify.
	 *
	 * @param array $configuration The configuration.
	 *
	 * @return bool Whether this configuration contains a multisite verify.
	 */
	protected function is_multisite_verify_configuration( array $configuration ) {
		return \array_key_exists( 'ms_verify', $configuration );
	}
}
