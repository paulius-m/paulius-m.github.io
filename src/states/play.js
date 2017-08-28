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
TemplateGame.Play.create = function () {

    Kiwi.State.prototype.create.call( this );

    this.player = new Kiwi.GameObjects.Sprite(this, this.textures.diver, 0, 0 );
    
    var tilemap = new Kiwi.GameObjects.Tilemap.TileMap(this, 'tilemap', this.textures.tiles);
    var layer = tilemap.layers[0];
    
    this.player.dirX = 0;
    this.player.dirY = 1;
    
    this.player.actionQueue = [];
    
    this.player.move = function() {
        
        this.actionQueue.push( function() {
            
            var to = {x: this.x + this.dirX * 32 , y: this.y + this.dirY * 32};
            
            var s = layer.getTileFromCoords(to.x, to.y);
            if (!s || s.properties.allowCollisions === 1){
                console.log("TILE", s);
            }
            
            this.tween = this.game.tweens.create(this);
            this.tween.to(to, 120, Kiwi.Animations.Tweens.Easing.Sinusoidal.InOut);
            this.tween.onComplete(this.moveEnded, this);
            this.tween.start();
        });
    }
    
    this.player.turn = function(direction) {
        
        var turnDir = direction? direction : 1;
        
        this.actionQueue.push( function() {
            
            this.tween = this.game.tweens.create(this);
            
            var rotation = this.rotation + turnDir * Kiwi.Utils.GameMath.PI_2;
            
            this.tween.to({rotation : rotation }, 120, Kiwi.Animations.Tweens.Easing.Sinusoidal.InOut);
            this.tween.onComplete(this.turnEnded, this);
            this.tween.start();
        });
    }
    
    this.player.update = function() {
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
        this.dirX = - Math.round(Math.sin(this.rotation));
        this.dirY = Math.round(Math.cos(this.rotation));
        this.actionEnded();
    }
    
    this.player.actionEnded = function() {
        this.inAction = null;
        
    }
    
    window.game = this;
    window.diver = this.player;
    window.left = 1;
    window.right = -1;
    // Add the GameObjects to the stage
    
    this.addChild( layer );
    this.addChild( this.player );
};


TemplateGame.Play.update = function() {
    this.player.update();
    Kiwi.State.prototype.update.call( this );
};


