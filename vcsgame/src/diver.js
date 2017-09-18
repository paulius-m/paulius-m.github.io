window.actionQueue = [];
window.left = -1;
window.right = 1;

window.diver = {
	move: function(steps) {
		
		steps = steps === undefined ? 1 : steps;
		for (var i = 0; i < steps; i++) {
			actionQueue.push({name: "move"});
		}
	},
	turn: function(direction) {
		actionQueue.push({name: "turn", direction: direction});
	},
	pick: function() {
		actionQueue.push({name: "pick"});
	},
	drop: function() {
		actionQueue.push({name: "drop"});
	},
	
	reset: function() {
		actionQueue = [];
        game.states.switchState( "Play" );
		
	}
};