/**
* The Kiwi.JS Preloader is a custom State used to load assets into a game
* using a loading bar and animated loading screen.
*
* Using this Class is very easy:
* 1 - Instantiate this Class instead of a State and pass required parameters.
* 2 - Create a preload method on the new Object, ensuring you call the preload
*	method on this Class.
* 3 - Switch to it as normal.
* 4 - And DONE!
*
* ```
* var loadingState = new KiwiLoadingScreen(
*	"loadingState",
*	"nextState",
*	"assets/loadingAssets/",
*	{ width: 1024, height: 768 } );
*
* loadingState.preload = function() {
*	KiwiLoadingScreen.prototype.preload.call( this );
*
*	// Your code here
* };
* ```
*
* @class KiwiLoadingScreen
* @constructor
* @extends Kiwi.State
* @param name {string} Name of this state.
* @param stateToSwitch {string} Name of the state to switch to AFTER all the
*	assets have loaded. Note: The state you want to switch to should already 
*	have been added to the game.
* @param subfolder {string} Folder wherein the loading graphics are located.
* @param [dimensions] {object} Object containing the width/height of the game.
*	For example, `{width: 1024, height: 768}`. Defaults to the stage's
*	width/height if not passed.
* @return {KiwiLoadingScreen}
*/


var KiwiLoadingScreen =
	function( name, stateToSwitch, subfolder, dimensions ) {

	// Call the Super
	Kiwi.State.call(this, name);

	// Check the width/height
	if ( dimensions !== undefined &&
			dimensions.width !== undefined &&
			dimensions.height !== undefined ) {
		this.newDimensions = dimensions;
	} else {
		this.newDimensions = null;
	}

	// Save the state to load afterwards
	this.afterState = stateToSwitch;
	this.kiwiAlpha = 0;

	// The Loading children we are going to make
	this.html5Logo = null;

	// Splash
	this.kiwijsLogo = null;
	this.kiwijsText = null;
	this.radial = null;
	this.madeWith = null;
	this.loadingBar = null;

	// The subfolder where everything will be saved
	this.subfolder = subfolder;
};
// Extend the State
Kiwi.extend(KiwiLoadingScreen, Kiwi.State);


KiwiLoadingScreen.prototype.init = function() {
	Kiwi.State.prototype.init.call(this);

	if ( this.newDimensions !== null ) {
		this.game.stage.resize(
			this.newDimensions.width, this.newDimensions.height );
	}
};


/** 
* Preload Method. This is the method you override to load in your assets.
* Note: Make sure you call this method! Otherwise the loading graphics will
* never load and this state won't work.
* Also best to call it at the start of the `preload`.
* @method preload
* @public
*/
KiwiLoadingScreen.prototype.preload = function() {

	// Background colour
	this.game.stage.color = "FFFFFF";

	// New Dimensions
	var shortest = (this.game.stage.width > this.game.stage.height) ?
			this.game.stage.height : this.game.stage.width;

	if ( shortest < 600 ) {
		this.scaled = shortest / 600;
	} else {
		this.scaled = 1;
	}

	this.currentSplashState = 0;	// 0 = HTML 5 LOGO FADING IN
									// 1 = KIWIJS READY TO APPEAR
									// 2 = KIWIJS FADING IN
									// 3 = LOADING WITH KIWIJS THERE
									// 4 = DONE. SWITCHING TO NEXT STATE

	this.addTextureAtlas(
		"loadingGraphic",
		this.subfolder + "loading-texture-atlas.png",
		"loadingJSON",
		this.subfolder + "loading-texture-atlas.json",
		false);
	this.addImage( "logo", "assets/img/logo.png" );
	// Information about the files we need to load
	this.loadingData = { toLoad: 0, loaded: 0 };
	this.filesToLoad = [ "loadingGraphic", "loadingJSON", "logo" ];
	this.percentLoaded = 0;
};


/**
* Start loading everything in. 
* @method loadProgress
* @public
*/
KiwiLoadingScreen.prototype.loadProgress =
	function ( percent, bytesLoaded, file ) {

	this.percentLoaded = percent;


	if ( this.currentSplashState === 3 ) {
		this.loadingBar.scaleX = this.percentLoaded / 100 * this.scaled;
		this.finishLoading();
	}

	if ( file == null ) {
		return;
	}

	if ( this.filesToLoad.length > 0 ) {
		var index = this.filesToLoad.indexOf( file.key );

		if ( index !== -1 ) {
			this.filesToLoad.splice( index, 1 );
		}

		if ( this.filesToLoad.length === 0 ) {

			// Add to the Library
			this.game.states.rebuildLibraries();

			// Create the StaticImage
			this.html5Logo = new Kiwi.GameObjects.StaticImage(
				this,
				this.textures[ "logo" ],
				this.game.stage.width / 2,
				this.game.stage.height / 2 );

			this.html5Logo.scaleX = this.scaled;
			this.html5Logo.scaleY = this.scaled;
			this.html5Logo.x -= this.html5Logo.box.bounds.width / 2;
			this.html5Logo.y -= this.html5Logo.box.bounds.height / 2;
			this.html5Logo.alpha = 0;
			this.html5Logo.rotPointX = 0;
			this.html5Logo.rotPointY = 0;
			this.addChild( this.html5Logo );

			// Tween
			this.loadingTween = this.game.tweens.create( this.html5Logo );
			this.loadingTween.onComplete( this.fadeInHTML5, this );
			this.loadingTween.to(
				{ alpha: 1 },
				200,
				Kiwi.Animations.Tweens.Easing.Linear.None );
			this.loadingTween._onCompleteCalled = false;
			this.loadingTween.start();

			return;
		}
	}

	if ( this.currentSplashState <= 1 &&
			this.loadingData.loaded === this.loadingData.toLoad ) {

		// So the HTML 5 logo was waiting for the KiwiJS splash assets to load.
		if ( this.currentSplashState === 1 ) {

			// Play the tween. No delay as there probably already was one
			this.loadingTween._onCompleteCalled = false;
			this.loadingTween.start();
			this.currentSplashState = 2;

		// Still waiting for the logo to fade in?
		// Tell it to fade out when it's done.
		} else {
			this.currentSplashState = 1;
		}
	}
};


/**
* Create: rebuild html5Logo
* @method create
* @public
*/
KiwiLoadingScreen.prototype.create = function() {
	Kiwi.State.prototype.create.call( this );

	// Reassign texture atlas to html5Logo,
	// as it has just been rebuilt and WebGL may have lost track of it
	this.html5Logo.atlas = this.textures.logo;
};


/**
* Called when the fading in of the HTML5 logo is completed.
* Makes the HTML5 logo fade out oafter a period of time.
* @method fadeInHTML5
* @public
*/
KiwiLoadingScreen.prototype.fadeInHTML5 = function() {
	this.loadingTween.to(
		{ alpha: 0 },
		200,
		Kiwi.Animations.Tweens.Easing.Linear.None );
	this.loadingTween.onComplete( this.fadeOutHTML5, this );

	// Have all the assets for the next splash screen loaded
	// in the time it has taken us to fade the logo in?
	if ( this.currentSplashState >= 1) {

		// Start the fadeout tween after a delay
		this.loadingTween.delay( 1000 );
		this.loadingTween._onCompleteCalled = false;
		this.loadingTween.start();
		this.currentSplashState = 4;

	//Otherwise say we are ready.
	} else {
		this.currentSplashState = 1;
	}
};


/**
* Called when the HTML5 logo has fulled faded in. Creates/fades in the KIWI.
* @method fadeOutHTML5
* @public
*/
KiwiLoadingScreen.prototype.fadeOutHTML5 = function() {

	this.currentSplashState = 4;

	// Remove the logo
	this.html5Logo.exists = false;

	this.finishLoading();
};

/**
* Checks to see if all the assets have loaded. Fades out the Kiwi.
* @method finishLoading
* @public
*/
KiwiLoadingScreen.prototype.finishLoading = function() {
	if ( this.percentLoaded === 100 ) {
		this.completed();
	}
};


/**
* Called when the game is ready, so we can switch to the next state now.
* @method completed
* @public
*/
KiwiLoadingScreen.prototype.completed = function() {
	this.currentSplashState = 4;

	// Switch States
	this.game.states.switchState( this.afterState );
};


/**
* Shut down the loading state.
* @method shutDown
* @public
*/
KiwiLoadingScreen.prototype.shutDown = function() {
	this.game.tweens.removeAll();
	delete this.loadingTween;
	delete this.swing;
};
