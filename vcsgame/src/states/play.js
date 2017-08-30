var TemplateGame = TemplateGame || {};

TemplateGame.Play = new Kiwi.State( "Play" );

/**
* The PlayState in the core state that is used in the game. 
*
* It is the state where majority of the functionality occurs 'in-game' occurs.
*/


/**
* This create method is executed when a Kiwi state has finished loading
* any resources that were required to load.
*/
var rotName = ["down", "left", "up", "right"];
var rotX = [0, -1, 0, 1];
var rotY = [1, 0, -1, 0];

TemplateGame.Play.reset = function () {
    
    
    this.player.reset();
};
TemplateGame.Play.create = function () {

    Kiwi.State.prototype.create.call( this );

	this.scale = 4;
	
    this.player = new Kiwi.GameObjects.Sprite(this, this.textures.diver2, 7 * 32, 0 );
    
    var tilemap = new Kiwi.GameObjects.Tilemap.TileMap(this, 'tilemap', this.textures.tiles);
    var layer = tilemap.layers[0];
    
    this.player.dirX = 0;
    this.player.dirY = 1;
    this.player.rrotation = 0;
	
	this.player.animation.add("walk-down", [0, 1], 0.2, true);
	this.player.animation.add("walk-up", [6, 7], 0.2, true);
	this.player.animation.add("walk-left", [2, 3], 0.2, true);
	this.player.animation.add("walk-right", [4, 5], 0.2, true);
	
    this.player.actionQueue = [];
    
    this.player.move = function() {
        
        this.actionQueue.push( function() {
            console.log(this.rrotation);
            var to = {x: this.x + this.dirX * 32 , y: this.y + this.dirY * 32};
            this.animation.play("walk-" + rotName[this.rrotation]);
            var s = layer.getTileFromCoords(to.x, to.y);
            if (!s || s.properties.allowCollisions === 1) {
				
				this.tween = this.game.tweens.create(this);
				this.tween.to(to, 500, Kiwi.Animations.Tweens.Easing.Sinusoidal.Linear);

				var tween = this.game.tweens.create(this);
				tween.to({ scaleX: 0.01, scaleY: 0.01 }, 1200, Kiwi.Animations.Tweens.Easing.Sinusoidal.InOut);
				tween.onComplete(this.gameEnded, this);
				
				this.tween.chain(tween);
				
				this.tween.start();
            } else {
            
				this.tween = this.game.tweens.create(this);
				this.tween.to(to, 500, Kiwi.Animations.Tweens.Easing.Sinusoidal.Linear);
				this.tween.onComplete(this.moveEnded, this);
				this.tween.start();
			}
        });
    }
    
    this.player.turn = function(direction) {
        
        var turnDir = direction? direction : 1;
        
        this.actionQueue.push( function() {

            this.rrotation = this.rrotation + turnDir;
			if (this.rrotation < 0) {
				this.rrotation = 3;
			}
			
			if (this.rrotation > 3) {
				this.rrotation = 0;
			}
			this.animation.play("walk-" + rotName[this.rrotation]);
			this.tween = this.game.tweens.create(this);
			this.tween.to({}, 120, Kiwi.Animations.Tweens.Easing.Sinusoidal.Linear);
			this.tween.onComplete(this.turnEnded, this);
			this.tween.start();
        });
    }
    
    this.player.update = function() {
		Kiwi.GameObjects.Sprite.prototype.update.call( this );
        if (!this.inAction) {
            var action = this.actionQueue.shift();
            if (action) {
                this.inAction = action;
                this.inAction();
            }
        }
    }

    this.player.moveEnded = function() {
		
		this.actionEnded();
    }

    this.player.turnEnded = function() {
        this.dirX = rotX[this.rrotation];
        this.dirY = rotY[this.rrotation];
        this.actionEnded();
    }
    
    this.player.actionEnded = function() {
		this.animation.stop();
        this.inAction = null;
    }
	
	this.player.gameEnded = function() {
        game.states.switchState( "GameOver" );
    }
    
    window.diver = this.player;
    window.left = 1;
    window.right = -1;
    // Add the GameObjects to the stage
    
	this.gameover = new Kiwi.GameObjects.Sprite(this, this.textures.gameover, 0, 0 );

    this.addChild( layer );

    this.addChild( this.player );
	
};

TemplateGame.Play.gameover = function() {

	
};


TemplateGame.Play.update = function() {
    //this.player.update();
    Kiwi.State.prototype.update.call( this );
};


