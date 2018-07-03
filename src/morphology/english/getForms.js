const getNounFormsWithPossessives = require( "./getNounForms.js" ).getNounFormsWithPossessives;
const checkPossessive = require( "./getNounForms.js" ).checkPossessive;
const getVerbForms = require( "./getVerbForms.js" ).getVerbForms;
const getAdjectiveForms = require( "./getAdjectiveForms.js" ).getAdjectiveForms;
const unique = require( "lodash/uniq" );

const getForms = function( word ) {
	if ( checkPossessive( word ) ) {
		return unique( getNounFormsWithPossessives( word ) );
	}
	return unique( [].concat( getNounFormsWithPossessives( word ), getVerbForms( word ), getAdjectiveForms( word ) ) );
};

module.exports = getForms;
