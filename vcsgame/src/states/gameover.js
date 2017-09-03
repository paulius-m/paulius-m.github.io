var TemplateGame = TemplateGame || {};

TemplateGame.GameOver = new Kiwi.State( "GameOver" );

/**
* The PlayState in the core state that is used in the game. 
*
* It is the state where majority of the functionality occurs 'in-game' occurs.
*/


/**
* This create method is executed when a Kiwi state has finished loading
* any resources that were required to load.
*/

TemplateGame.GameOver.reset = function () {
	game.states.switchState( "Play" );
};
TemplateGame.GameOver.create = function () {

    Kiwi.State.prototype.create.call( this );

    // Add the GameObjects to the stage
	this.gameover = new Kiwi.GameObjects.StaticImage(
		this,
		this.textures.gameover,
		this.game.stage.width / 2,
		this.game.stage.height / 2 );
	this.gameover.x -= this.gameover.box.bounds.width / 2;
	this.gameover.y -= this.gameover.box.bounds.height / 2;
    this.addChild( this.gameover );
};





