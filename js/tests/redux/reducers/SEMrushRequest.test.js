import { setSEMrushChangeCountry, setSEMrushNewRequest, setSEMrushRequestSucceeded, setSEMrushRequestFailed, setSEMrushSetRequestLimitReached, setSEMrushNoResultsFound } from "../../../src/redux/actions/SEMrushRequest";
import SEMrushRequestReducer from "../../../src/redux/reducers/SEMrushRequest";



describe( "SEMrushRequestReducer", () => {
	it( "sets countryCode to nl when the reducer is called with a setSEMrushChangeCountry action creator that is called with nl", () => {
		const state = {
			isRequestPending: false,
			keyphrase: "",
			countryCode: "us",
			isSuccess: false,
			response: null,
			limitReached: false,
			hasData: true,
		};

		const action = setSEMrushChangeCountry( "nl" );

		const expected = {
			isRequestPending: false,
			keyphrase: "",
			countryCode: "nl",
			isSuccess: false,
			response: null,
			limitReached: false,
			hasData: true,
		};
		const actual = SEMrushRequestReducer( state, action );

		expect( actual ).toEqual( expected );
	} );

	it( "sets the state to an open request when the reducer is called with a setSEMrushNewRequest action creator that is called with nl and yoast", () => {
		const state = {
			isRequestPending: false,
			keyphrase: "",
			countryCode: "us",
			isSuccess: false,
			response: null,
			limitReached: false,
			hasData: true,
		};

		const action = setSEMrushNewRequest( "nl", "yoast" );

		const expected = {
			isRequestPending: true,
			keyphrase: "yoast",
			countryCode: "nl",
			isSuccess: false,
			response: null,
			limitReached: false,
			hasData: true,
		};
		const actual = SEMrushRequestReducer( state, action );

		expect( actual ).toEqual( expected );
	} );

	it( "sets the state to an succeeded request when the reducer is called with a setSEMrushRequestSucceeded action creator that is called with a sample response", () => {
		const state = {
			isRequestPending: false,
			keyphrase: "",
			countryCode: "us",
			isSuccess: false,
			response: null,
			limitReached: false,
			hasData: true,
		};
		state.keyphrase = "yoast";
		state.countryCode = "nl";

		const action = setSEMrushRequestSucceeded( { response: "exampleresponse" } );

		const expected = {
			isRequestPending: false,
			keyphrase: "yoast",
			countryCode: "nl",
			isSuccess: true,
			response: { response: "exampleresponse" },
			limitReached: false,
			hasData: true,
		};
		const actual = SEMrushRequestReducer( state, action );

		expect( actual ).toEqual( expected );
	} );

	it( "sets the state to an failed request when the reducer is called with a setSEMrushRequestFailed action creator that is called with a sample response", () => {
		const state = {
			isRequestPending: false,
			keyphrase: "",
			countryCode: "us",
			isSuccess: false,
			response: null,
			limitReached: false,
			hasData: true,
		};
		state.keyphrase = "yoast";
		state.countryCode = "nl";

		const action = setSEMrushRequestFailed( { response: "exampleresponse" } );

		const expected = {
			isRequestPending: false,
			keyphrase: "yoast",
			countryCode: "nl",
			isSuccess: false,
			response: { response: "exampleresponse" },
			limitReached: false,
			hasData: false,
		};
		const actual = SEMrushRequestReducer( state, action );

		expect( actual ).toEqual( expected );
	} );

	it( "sets the state to limit reached when the reducer is called with a setSEMrushSetRequestLimitReached action creator that is called", () => {
		const state = {
			isRequestPending: false,
			keyphrase: "",
			countryCode: "us",
			isSuccess: false,
			response: null,
			limitReached: false,
			hasData: true,
		};

		const action = setSEMrushSetRequestLimitReached();

		const expected = {
			isRequestPending: false,
			keyphrase: "",
			countryCode: "us",
			isSuccess: false,
			response: null,
			limitReached: true,
			hasData: false,
		};
		const actual = SEMrushRequestReducer( state, action );

		expect( actual ).toEqual( expected );
	} );

	it( "sets the state to no results found when the reducer is called with a setSEMrushNoResultsFound action creator that is called", () => {
		const state = {
			isRequestPending: false,
			keyphrase: "yoast",
			countryCode: "nl",
			isSuccess: false,
			response: null,
			limitReached: false,
			hasData: true,
		};

		const action = setSEMrushNoResultsFound("nl", "yoast");

		const expected = {
			isRequestPending: false,
			keyphrase: "yoast",
			countryCode: "nl",
			isSuccess: true,
			response: null,
			limitReached: false,
			hasData: false,
		};

		const actual = SEMrushRequestReducer( state, action );

		expect( actual ).toEqual( expected );
	} );



} );
