import { mapValues, mapKeys, zipObject } from "lodash";
import { Paper } from "yoastseo";
import { FOCUS_KEYPHRASE_ID } from "@yoast/seo-store";

/**
 * Creates a paper based on the given data, keyphrase and configuration.
 *
 * @param {Object} data The paper data and metadata, e.g. content, title, date, slug.
 * @param {Object} keyphrase The keyphrase to use for the analysis.
 * @param {Object} configuration Extra configuration.
 *
 * @returns {Paper} A paper that can be analyzed using the web worker.
 */
function createPaper( data, keyphrase, configuration ) {
	return new Paper(
		data.content,
		{
			// Keyphrase data.
			keyword: keyphrase.keyphrase,
			synonyms: keyphrase.synonyms,
			// General data and metadata.
			description: data.metaDescription,
			title: data.seoTitle,
			titleWidth: data.seoTitleWidth,
			permalink: data.slug,
			date: data.date,
			// Configuration data.
			locale: configuration.locale,
		},
	);
}

/**
 * Transforms the object with related keyphrases to a a structure
 * that the analysis web worker is able to consume.
 *
 * @param {Object} relatedKeyphrases The related keyphrases.
 *
 * @returns {Object} The transformed related keyphrases.
 */
function transformRelatedKeyprases( relatedKeyphrases ) {
	return mapValues( relatedKeyphrases, ( { keyphrase: keyword, synonyms } ) => ( { keyword, synonyms } ) );
}

/**
 * Transforms the results from the analysis to the structure
 * that the SEO store expects.
 *
 * @param {Object} results The results returned by the analysis web worker.
 *
 * @returns {Object} The adapted results.
 */
function transformAnalysisResults( results ) {
	const { seo, readability } = results.result;

	return {
		// Put the focus keyphrase results under the `FOCUS_KEYPHRASE_ID` key, instead of the "" key.
		seo: mapKeys( seo, ( _, key ) => key === "" ? FOCUS_KEYPHRASE_ID : key ),
		readability,
	};
}

/**
 * Analyzes a given paper inside of the analysis web worker.
 *
 * @param {AnalysisWorkerWrapper} worker The analysis web worker.
 * @param {Paper} paper The paper to analyze.
 * @param {Object} relatedKeyphrases The related keyphrases to use in the analysis.
 *
 * @returns {Promise<{Object}>} The results of the analysis.
 */
async function analyzePaper( worker, paper, relatedKeyphrases ) {
	// Analyzing related keyphrases also analyzes the focus keyphrase.
	const results = await worker.analyzeRelatedKeywords(
		paper,
		transformRelatedKeyprases( relatedKeyphrases ),
	);

	return transformAnalysisResults( results );
}

/**
 * Runs a list of researches inside of the web worker.
 *
 * @param {string[]} researches The list of research names to run.
 * @param {AnalysisWorkerWrapper} worker The analysis web worker.
 * @param {Paper} paper The paper to run the researches on.
 *
 * @returns {Promise<Object>} The research results.
 */
async function runResearches( researches, worker, paper ) {
	const results = await Promise.all(
		researches.map( research => worker.runResearch( research, paper ) ),
	);

	return zipObject( researches, results );
}

/**
 * Creates a callback function to trigger a new analysis
 * based on the given analysis web worker and configuration.
 *
 * @param {AnalysisWorkerWrapper} worker The web worker wrapper.
 * @param {Object} configuration Configuration.
 *
 * @returns {function} The analysis callback function.
 */
export default function createAnalyzeFunction( worker, configuration ) {
	/**
	 * A callback function that analyzes the data from the SEO store.
	 *
	 * @param {Object} data The data from the SEO store.
	 * @param {Object} keyphrases The keyphrases to analyze.
	 * @param {Object} [config] Optional extra configuration to use.
	 *
	 * @returns {Object} The results of the analysis.
	 */
	return async ( data, keyphrases, config = {} ) => {
		const { [ FOCUS_KEYPHRASE_ID ]: focusKeyphrase, ...relatedKeyphrases } = keyphrases;

		const paper = createPaper( data, focusKeyphrase, configuration );

		const analysisResults = await analyzePaper( worker, paper, relatedKeyphrases );
		analysisResults.research = await runResearches( config.researches, worker, paper );

		return analysisResults;
	};
}
