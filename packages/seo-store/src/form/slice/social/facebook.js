const { createSlice } = require( "@reduxjs/toolkit" );
import { get } from "lodash";

export const defaultFacebookState = {
	title: "",
	description: "",
	image: {},
};

const facebookSlice = createSlice( {
	name: "facebook",
	initialState: defaultFacebookState,
	reducers: {
		updateFacebookTitle: ( state, action ) => {
			state.title = action.payload;
		},
		updateFacebookDescription: ( state, action ) => {
			state.description = action.payload;
		},
		updateFacebookImage: ( state, action ) => {
			state.image = action.payload;
		},
	},
} );

export const facebookSelectors = {
	selectFacebook: ( state ) => get( state, "form.social.facebook" ),
	selectFacebookTitle: ( state ) => get( state, "form.social.facebook.title" ),
	selectFacebookDescription: ( state ) => get( state, "form.social.facebook.description" ),
	selectFacebookImage: ( state ) => get( state, "form.social.facebook.image" ),
};

export const facebookActions = facebookSlice.actions;

export default facebookSlice.reducer;
