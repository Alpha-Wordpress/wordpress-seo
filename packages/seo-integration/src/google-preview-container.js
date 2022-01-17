import { useDispatch, useSelect } from "@wordpress/data";
import { useCallback, useMemo, useRef, useState } from "@wordpress/element";
import { SEO_STORE_NAME } from "@yoast/seo-store";
import { filter, get, map } from "lodash";
import { PropTypes } from "prop-types";
import { useSeoContext } from "./seo-context";

/**
 * Formats the replacement variables for the Google Preview.
 *
 * Caches the given replacement variables so that the memory address only changes when any value changes.
 *
 * @returns {{replacementVariables: {name: string, label: string, value: *}[], recommendedReplacementVariables: string[]}} The replacement variables
 *     and recommended replacement variables.
 */
const useGooglePreviewReplacementVariables = () => {
	const analysisType = useSelect( select => select( SEO_STORE_NAME ).selectAnalysisType() );
	const { analysisTypeReplacementVariables } = useSeoContext();
	const replacementVariables = get( analysisTypeReplacementVariables, `${ analysisType }.variables`, [] );

	const cache = useRef();

	const values = map( replacementVariables, variable => variable.getReplacement() ).join( "" );
	const cachedValues = map( cache.current?.replacementVariables, "value" ).join( "" );

	// Set the cache when any value changed, or when it was not set before.
	if ( cachedValues !== values || ! cache.current ) {
		cache.current = {
			replacementVariables: map( replacementVariables, replacementVariable => ( {
				name: replacementVariable.name,
				label: replacementVariable.label,
				value: replacementVariable.getReplacement(),
				hidden: ! replacementVariable.isVisible,
			} ) ),
			recommendedReplacementVariables: map( filter( replacementVariables, "isRecommended" ), "name" ),
		};
	}

	return cache.current;
};

/**
 * Retrieves the base URL from the permalink.
 *
 * Uses a fallback URL in order to keep working when there is no permalink (development environment).
 *
 * @returns {string} The base URL.
 */
const useBaseUrl = () => {
	const permalink = useSelect( select => select( SEO_STORE_NAME ).selectPermalink() );

	return useMemo( () => {
		// Strip the last part of the permalink.
		let url;
		try {
			url = new URL( permalink );
		} catch ( e ) {
			// Fallback on current href
			return window.location.href;
		}

		// Enforce ending with a slash because of the internal handling in the SnippetEditor component.
		if ( ! url.pathname.endsWith( "/" ) ) {
			url.pathname += "/";
		}

		return url.href;
	}, [ permalink ] );
};

/**
 * Handles known data for a Google preview component.
 *
 * @param {JSX.Element} as A Google preview component.
 * @param {Object} restProps Props to pass to the Google preview component, that are unhandled by this container.
 *
 * @returns {JSX.Element} A wrapped Google preview component.
 */
const GooglePreviewContainer = ( { as: Component, ...restProps } ) => {
	const title = useSelect( select => select( SEO_STORE_NAME ).selectSeoTitle() );
	const description = useSelect( select => select( SEO_STORE_NAME ).selectMetaDescription() );
	const slug = useSelect( select => select( SEO_STORE_NAME ).selectSlug() );
	let date = useSelect( select => select( SEO_STORE_NAME ).selectDate() );
	const focusKeyphrase = useSelect( select => select( SEO_STORE_NAME ).selectKeyphrase() );
	const morphologyResults = useSelect( select => select( SEO_STORE_NAME ).selectResearchResults( "morphology" ) );
	const isCornerstone = useSelect( select => select( SEO_STORE_NAME ).selectIsCornerstone() );
	const [ previewMode, setPreviewMode ] = useState( "mobile" );
	const { updateSlug, updateSeoTitle, updateMetaDescription } = useDispatch( SEO_STORE_NAME );

	const data = useMemo( () => ( { title, description, slug } ), [ title, description, slug ] );
	const focusKeyphraseWordForms = useMemo( () => get( morphologyResults, "keyphraseForms", [] ).flat(), [ morphologyResults ] );
	// eslint-disable-next-line no-undefined
	if ( date !== "" ) {
		date = useMemo( () => new Date( date ).toLocaleDateString( undefined, {
			day: "numeric",
			month: "short",
			year: "numeric",
		} ), [ date ] );
	}

	const baseUrl = useBaseUrl();
	const {
		replacementVariables,
		recommendedReplacementVariables,
	} = useGooglePreviewReplacementVariables();

	const handleChange = useCallback( ( key, value ) => {
		switch ( key ) {
			case "mode":
				setPreviewMode( value );
				break;
			case "slug":
				updateSlug( value );
				break;
			case "title":
				updateSeoTitle( value );
				break;
			case "description":
				updateMetaDescription( value );
				break;
			default:
				console.warn( "Unhandled change event in Google Preview container", key, value );
				break;
		}
	}, [ setPreviewMode ] );

	return <Component
		baseUrl={ baseUrl }
		data={ data }
		date={ date }
		keyword={ focusKeyphrase }
		mode={ previewMode }
		wordsToHighlight={ focusKeyphraseWordForms }
		replacementVariables={ replacementVariables }
		recommendedReplacementVariables={ recommendedReplacementVariables }
		isCornerstone={ isCornerstone }
		onChange={ handleChange }
		{ ...restProps }
	/>;
};

GooglePreviewContainer.propTypes = {
	as: PropTypes.elementType.isRequired,
};

GooglePreviewContainer.defaultProps = {};

export default GooglePreviewContainer;
