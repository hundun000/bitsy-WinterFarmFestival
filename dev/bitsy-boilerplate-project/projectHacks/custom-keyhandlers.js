/**
⌨
@file custom-keyhandlers
@summary run custom code on key inputs
@license MIT
@author Sean S. LeBlanc

@description
Adds an extra layer of key handlers to bitsy's input handling
that allow custom functions to be run when a key is pressed, held, or released.


bitsy key = {
	left : 37,
	right : 39,
	up : 38,
	down : 40,
	space : 32,
	enter : 13,
	w : 87,
	a : 65,
	s : 83,
	d : 68,
	r : 82,
	shift : 16,
	ctrl : 17,
	alt : 18,
	cmd : 224
};

Some simple example functions:
	bitsy.scriptInterpreter.SetVariable('myvar', 10); // sets a variable that can be accessed in bitsy scripts
	bitsy.startDialog('a dialog string'); // starts a bitsy dialog script
	bitsy.startDialog(bitsy.dialog['script-id'], 'script-id'); // starts a bitsy dialog script by id
	bitsy.room[bitsy.curRoom].items.push({ id: 0, x: bitsy.player().x, y: bitsy.player().y }); // adds an item at the player's current position

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Edit the hackOptions object as needed
*/

import bitsy from 'bitsy';
import { after, before } from '@bitsy/hecks/src/helpers/kitsy-script-toolkit';

var function_onMovePlayer = function () {
	let id = 'listener_onMovePlayer';
	let content = bitsy.dialog[id].src;
	bitsy.startDialog(content, id);
	//console.log('function_onMovePlayer');
}

export var hackOptions = {
	// each object below is a map of key -> handler
	// ondown is called when key is first pressed
	ondown: {
		z: function () {
			let id = 'listener_ondown_z';
			let content = bitsy.dialog[id].src;
			bitsy.startDialog(content, id);
		},
	},
	// onheld is called every frame key is held
	// it includes a single parameter,
	// which is the number of frames the key has been held
	onheld: {
	},
	// onup is called when key is released
	onup: {
	},
	onMovePlayer: function_onMovePlayer
};

var allHandlers = [];
var held = {};

before('movePlayer', function (direction) {
	if (hackOptions.onMovePlayer) {
		function_onMovePlayer.apply();
	}
});

after('onready', function () {
	held = {};
	allHandlers = Object.keys(hackOptions.ondown).concat(Object.keys(hackOptions.onheld), Object.keys(hackOptions.onup));
});

after('updateInput', function () {
	allHandlers.forEach(function (key) {
		var ondown = hackOptions.ondown[key];
		var onheld = hackOptions.onheld[key];
		var onup = hackOptions.onup[key];
		if (bitsy.input.isKeyDown(key.toUpperCase().codePointAt(0))) {
			var f = (held[key] = (held[key] || 0) + 1);
			if (f === 1 && ondown) {
				ondown();
			}
			if (onheld) {
				onheld(f);
			}
		} else {
			if (held[key] > 0 && onup) {
				onup();
			}
			held[key] = 0;
		}
	});
});
