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
	this.player.animation.add("win", [9, 8, 8], 0.2, true);
	this.player.animation.add("fall", [10], 0.2, true);
	
	
    this.player.move = function() {
		var to = {x: this.x + this.dirX * 32 , y: this.y + this.dirY * 32};
		this.animation.play("walk-" + rotName[this.rrotation]);
		
		this.tween = this.game.tweens.create(this);
		this.tween.to(to, 500, Kiwi.Animations.Tweens.Easing.Sinusoidal.Linear);
		this.tween.onComplete(this.moveEnded, this);
		this.tween.start();
	}
    
	this.player.pick = function() {
		var to = {x: this.x  , y: this.y};
		this.animation.play("walk-" + rotName[this.rrotation]);
		
		this.tween = this.game.tweens.create(this);
		this.tween.to(to, 500, Kiwi.Animations.Tweens.Easing.Sinusoidal.Linear);
		this.tween.onComplete(this.moveEnded, this);
		this.tween.start();
	}
	
	
    this.player.turn = function(direction) {
        
        var turnDir = direction? direction : 1;
		return function() {
			this.rrotation = this.rrotation + turnDir;
			if (this.rrotation < 0) {
				this.rrotation = 3;
			}
			
			if (this.rrotation > 3) {
				this.rrotation = 0;
			}
			
			this.dirX = rotX[this.rrotation];
			this.dirY = rotY[this.rrotation];
			
			this.animation.play("walk-" + rotName[this.rrotation]);
			this.tween = this.game.tweens.create(this);
			this.tween.to({}, 220, Kiwi.Animations.Tweens.Easing.Sinusoidal.Linear);
			this.tween.onComplete(this.turnEnded, this);
			this.tween.start();
		}
    }
    
    this.player.update = function() {
		Kiwi.GameObjects.Sprite.prototype.update.call( this );
    }

	this.player.getAction = function (action){
	
		switch(action.name) {
			case "move": {
				return this.move;
			}
			case "turn": {
				return this.turn(action.direction);
			}
			case "pick": {
				return this.pick;
			}
			case "win": {
				return function () {
					this.animation.play("win").onComplete.addOnce(this.turnEnded, this);
				}
			}
			
		}
	}
	

	var gameEnded = function() {
        game.states.switchState( "GameOver" );
    }
	
    this.player.moveEnded = function() {
		
		var s = layer.getTileFromCoords(this.x, this.y);
		if (!s || s.properties.allowCollisions === 1) {
				
			this.animation.play("fall");
			this.tween = this.game.tweens.create(this);
			this.tween.to({ scaleX: 0.01, scaleY: 0.01, rotation: 3.14 }, 1200, Kiwi.Animations.Tweens.Easing.Sinusoidal.InOut);
			
			this.tween.onComplete(gameEnded, this);
			this.tween.start();
			return;
		}else {
			this.actionEnded();
		}
    }

    this.player.turnEnded = function() {
        this.actionEnded();
    }
    
    this.player.actionEnded = function() {
		this.animation.stop();
        this.inAction = null;
    }
	
    this.prize = new Kiwi.GameObjects.Sprite(this, this.textures.prize, 0, 0 );
    this.prize.dirX = 0;
    this.prize.dirY = 1;
    this.prize.rrotation = 0;
	this.prize.player = this.player;
	
	this.prize.animation.add("walk-down", [0], 0.2, true);
	this.prize.animation.add("walk-up", [2], 0.2, true);
	this.prize.animation.add("walk-left", [3], 0.2, true);
	this.prize.animation.add("walk-right", [1], 0.2, true);
	this.prize.animation.add("drop", [0, 1, 2, 3,0, 1, 2, 3], 0.1, false);
	
	this.prize.move = function() {
		var to = {x: this.x + this.player.dirX * 32 , y: this.y + this.player.dirY * 32};
		this.animation.play("walk-" + rotName[this.rrotation]);
		
		this.tween = this.game.tweens.create(this);
		this.tween.to(to, 500, Kiwi.Animations.Tweens.Easing.Sinusoidal.Linear);
		this.tween.onComplete(this.moveEnded, this);
		this.tween.start();
	}
	
	this.prize.turn = function() {
        
		var to = {x: this.player.x + this.player.dirX * 32, y: this.player.y + this.player.dirY * 32 };
		
		this.rrotation = this.player.rrotation;
		this.animation.play("walk-" + rotName[this.rrotation]);
		this.tween = this.game.tweens.create(this);
		this.tween.to(to, 120, Kiwi.Animations.Tweens.Easing.Sinusoidal.Linear);
		this.tween.onComplete(this.moveEnded, this);
		this.tween.start();
	
    }
	
	this.prize.pick = function() {		
		this.ispicked = true;
		this.turn();
	}
	
	this.prize.drop = function() {
		this.ispicked = false;
		this.animation.play("drop").onComplete.addOnce(this.moveEnded, this);
	}
	
	this.prize.getAction = function (action) {
	
		switch(action.name) {
			
			case "pick": {
				return this.pick;
			}
			
			case "move": {
				if (this.ispicked) {
					return this.move;
				} 
				break;
			}
			case "turn": {
				if (this.ispicked) {
					return this.turn;
				}
				break;
			}
			case "drop": {
				if (this.ispicked) {
					return this.drop;
				}
			}
			
			return null;
		}
	}
	
	this.prize.moveEnded = function() {
		
		var s = layer.getTileFromCoords(this.x, this.y);
		if (!s || s.properties.allowCollisions === 1) {
				
			this.tween = this.game.tweens.create(this);
			this.tween.to({ scaleX: 0.01, scaleY: 0.01, rotation : 10 }, 1200, Kiwi.Animations.Tweens.Easing.Sinusoidal.InOut);
			this.tween.onComplete(gameEnded, this);
			this.tween.start();
			return;
		}else if (s.properties.finish === 1) {
			actionQueue.push({name: "win"});
			this.inAction = null;
		} else {
			this.inAction = null;
		}
    }
	
    this.addChild( layer );
    this.addChild( this.player );
	this.addChild(this.prize);
};

TemplateGame.Play.update = function() {
    //this.player.update();
    Kiwi.State.prototype.update.call( this );
	var player = this.player;
	if (!player.inAction && !this.prize.inAction ) {
		var action = actionQueue.shift();
		
		if (action) {
			
			if (action.name === "pick") {
				if (this.player.x + this.player.dirX * 32 !== this.prize.x
				||  this.player.y + this.player.dirY * 32 !== this.prize.y ) {
					return;
				}
			}
			
			var playerAction = player.getAction(action);
			if (playerAction) {
				player.inAction = playerAction;
				player.inAction();
			}
			
			var prizeAction = this.prize.getAction(action);
			if (prizeAction) {
				this.prize.inAction = prizeAction;
				this.prize.inAction();
			}
		}
	}
};


