import JapaneseResearcher from "../../../src/languageProcessing/languages/ja/Researcher";
import getProminentWordsForInsights from "../../../src/languageProcessing/researches/getProminentWordsForInsights";
import Paper from "../../../src/values/Paper";
import Researcher from "../../../src/languageProcessing/languages/en/Researcher";
import CatalanResearcher from "../../../src/languageProcessing/languages/ca/Researcher";
import ProminentWord from "../../../src/languageProcessing/values/ProminentWord";
import getMorphologyData from "../../specHelpers/getMorphologyData";

const morphologyData = getMorphologyData( "en" );
const morphologyDataJA = getMorphologyData( "ja" );

describe( "getProminentWordsForInsights research", function() {
	it( "does not break if no morphology support is available for the language", function() {
		const paper = new Paper( "texte  et texte et texte et texte et texte", { locale: "ca" } );

		const researcher = new CatalanResearcher( paper );

		const expected = [
			new ProminentWord( "texte", "texte", 5 ),
		];

		const words = getProminentWordsForInsights( paper, researcher );

		expect( words ).toEqual( expected );
	} );

	it( "returns insights from the text alone (not attributes)", function() {
		const paper = new Paper( "Here are a ton of syllables. Syllables are very important. I think the syllable " +
			"combinations are even more important. Syllable combinations for the win! Here are a ton of syllables. " +
			"Syllables are very important. I think the syllable combinations are even more important. " +
			"I say I think the syllable combinations are even more important. Syllable combinations for the win!", { keyword: "hahahahahaha" } );

		const researcher = new Researcher( paper );
		researcher.addResearchData( "morphology", morphologyData );

		const expected = [
			new ProminentWord( "syllable", "syllable", 9 ),
			new ProminentWord( "combinations", "combination", 5 ),
		];

		const words = getProminentWordsForInsights( paper, researcher );

		expect( words ).toEqual( expected );
	} );

	it( "does not return words that were used less than 5 times", function() {
		const paper = new Paper( "As we announced at YoastCon, we???re working together with Bing and Google to allow live indexing for " +
			"everyone who uses Yoast SEO ??? free and premium. <h2>Subheading!</h2>In an update currently planned for the end of March, we'll " +
			"allow users to connect their sites to MyYoast, our customer portal. After that we'll roll out live indexing, " +
			"which means every time you publish, update, or delete a post, that will be reflected almost instantly into " +
			"Bing and Google???s indices. How does this work? When you connect your site to MyYoast. " +
			"As we announced at YoastCon, we???re working together with Bing and Google to allow live indexing for " +
			"everyone who uses Yoast SEO ??? free and premium. <h2>Subheading!</h2>In an update currently planned for the end of March, we'll " +
			"allow users to connect their sites to MyYoast, our customer portal. After that we'll roll out live indexing, " +
			"which means every time you publish, update, or delete a post, that will be reflected almost instantly into " +
			"Bing and Google???s indices. How does this work? When you connect your site to MyYoast. " +
			"As we announced at YoastCon, we???re working together with Bing and Google to allow live indexing for " +
			"everyone who uses Yoast SEO ??? free and premium. <h2>Subheading!</h2>In an update currently planned for the end of March, we'll " +
			"allow users to connect their sites to MyYoast, our customer portal. After that we'll roll out live indexing, " +
			"which means every time you publish, update, or delete a post, that will be reflected almost instantly into " +
			"Bing and Google???s indices. How does this work? When you connect your site to MyYoast.", {
			keyword: "live indexing Yoast SEO",
			synonyms: "live index",
			title: "Amazing title",
			description: "Awesome metadescription",
			locale: "en_EN",
		} );

		const researcher = new Researcher( paper );
		researcher.addResearchData( "morphology", morphologyData );

		/*
		 *  The research does not consider relevant words coming from paper attributes, only the text.
		 */
		const expected = [
			new ProminentWord( "indexing", "index", 9 ),
			new ProminentWord( "allow", "allow", 6 ),
			new ProminentWord( "bing", "bing", 6 ),
			new ProminentWord( "connect", "connect", 6 ),
			new ProminentWord( "google", "google", 6 ),
			new ProminentWord( "live", "live", 6 ),
			new ProminentWord( "myyoast", "myyoast", 6 ),
			new ProminentWord( "site", "site", 6 ),
			new ProminentWord( "update", "update", 6 ),
			new ProminentWord( "work", "work", 6 ),
		];

		const words = getProminentWordsForInsights( paper, researcher );

		expect( words ).toEqual( expected );
	} );
} );

describe( "test for prominent words research for languages that have custom helpers", function() {
	// Japanese has custom helpers for getting words from the text, for counting text length
	// And for returning custom function to return the stem of a word.
	it( "returns no prominent words for texts under 200 characters with no words that occur more than 5 times", function() {
		const paper = new Paper( "?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????" );

		const researcher = new JapaneseResearcher( paper );
		researcher.addResearchData( "morphology", morphologyDataJA );

		const words = getProminentWordsForInsights( paper, researcher );
		expect( words ).toEqual( [] );
	} );

	it( "returns no prominent words for texts under 200 characters with some words that occur more than 5 times", function() {
		const paper = new Paper( "?????????".repeat( 6 ) + "??????".repeat( 7 ) +
			"????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????"  + "?????????".repeat( 10 ) );

		const researcher = new JapaneseResearcher( paper );
		researcher.addResearchData( "morphology", morphologyDataJA );

		const expected = [
			new ProminentWord( "?????????", "?????????", 10 ),
			new ProminentWord( "??????", "??????", 7 ),
			new ProminentWord( "?????????", "?????????", 6 ),
		];

		const words = getProminentWordsForInsights( paper, researcher );

		expect( words ).toEqual( expected );
	} );

	it( "returns prominent words for texts with more than 300 characters, in which the morphology data is available", function() {
		const paper = new Paper( "????????????????????????????????????".repeat( 180 ) );

		const researcher = new JapaneseResearcher( paper );
		researcher.addResearchData( "morphology", morphologyDataJA );

		const expected = [
			new ProminentWord( "???", "???", 181 ),
			new ProminentWord( "?????????", "?????????", 180 ),
			new ProminentWord( "?????????", "?????????", 179 ),
			new ProminentWord( "??????", "??????", 179 ),
		];

		const words = getProminentWordsForInsights( paper, researcher );

		expect( words ).toEqual( expected );
	} );

	it( "returns relevant words from the text alone even when the attributes are available", function() {
		const paper = new Paper( ( "?????????????????????????????????????????????????????????????????????????????????????????????" ).repeat( 100 ), { title: "??????", keyword: "??????", metadescription: "???????????????" }  );

		const researcher = new JapaneseResearcher( paper );
		researcher.addResearchData( "morphology", morphologyDataJA );

		const expected = [
			new ProminentWord( "?????????", "?????????", 200 ),
			new ProminentWord( "????????????", "????????????", 100 ),
			new ProminentWord( "??????", "??????", 100 ),
			new ProminentWord( "???", "???", 100 ),
			new ProminentWord( "?????????", "?????????", 100 ),
		];

		const words = getProminentWordsForInsights( paper, researcher );

		expect( words ).toEqual( expected );
	} );


	it( "returns prominent words for texts with more than 300 words, in which the morphology data is not available", function() {
		const paper = new Paper( "???????????????" + "??????????????????".repeat( 180 ), { title: "??????" } );

		const researcher = new JapaneseResearcher( paper );

		const expected = [
			new ProminentWord( "???", "???", 180 ),
			new ProminentWord( "?????????", "?????????", 179 ),
		];

		const words = getProminentWordsForInsights( paper, researcher );

		expect( words ).toEqual( expected );
	} );
} );
