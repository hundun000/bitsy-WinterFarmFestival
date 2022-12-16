/**
🖌
@file edit image from dialog
@summary edit sprites, items, and tiles from dialog
@license MIT
@author Sean S. LeBlanc

@description
You can use this to edit the image data of sprites (including the player avatar), items, and tiles through dialog.
Image data can be replaced with data from another image, and the palette index can be set.

(image "map, target, source")
Parameters:
  map:    Type of image (SPR, TIL, or ITM)
  target: id/name of image to edit
  source: id/name of image to copy

(imageNow "map, target, source")
Same as (image), but applied immediately instead of after dialog is closed.

(imagePal "map, target, palette")
Parameters:
  map:    Type of image (SPR, TIL, or ITM)
  target: id/name of image to edit
  source: palette index (0 is bg, 1 is tiles, 2 is sprites/items, anything higher requires editing your game data to include more)

(imagePalNow "map, target, palette")
Same as (imagePal), but applied immediately instead of after dialog is closed.

Examples:
  (image "SPR, A, a")
  (imageNow "TIL, a, floor")
  (image "ITM, a, b")
  (imagePal "SPR, A, 1")
  (imagePalNow "TIL, floor, 2")

HOW TO USE:
  1. Copy-paste this script into a new script tag after the Bitsy source code.
     It should appear *before* any other mods that handle loading your game
     data so it executes *after* them (last-in first-out).

TIPS:
  - The player avatar is always a sprite with id "A"; you can edit your gamedata to give them a name for clarity
  - You can use the full names or shorthand of image types (e.g. "SPR" and "sprite" will both work)
  - The "source" images don't have to be placed anywhere; so long as they exist in the gamedata they'll work
  - This is a destructive operation! Unless you have a copy of an overwritten image, you won't be able to get it back during that run

NOTE: This uses parentheses "()" instead of curly braces "{}" around function
      calls because the Bitsy editor's fancy dialog window strips unrecognized
      curly-brace functions from dialog text. To keep from losing data, write
      these function calls with parentheses like the examples above.

      For full editor integration, you'd *probably* also need to paste this
      code at the end of the editor's `bitsy.js` file. Untested.
*/
import bitsy from 'bitsy';
import { getImageData, setImageData } from '@bitsy/hecks/src/helpers/edit image at runtime';
import { addDualDialogTag, after, addDialogTag } from '@bitsy/hecks/src/helpers/kitsy-script-toolkit';
import { getImage } from '@bitsy/hecks/src/helpers/utils';

// map of maps
var maps;
after('load_game', function () {
	maps = {
		spr: bitsy.sprite,
		sprite: bitsy.sprite,
		til: bitsy.tile,
		tile: bitsy.tile,
		itm: bitsy.item,
		item: bitsy.item,
	};
});

function editImage(environment, parameters) {
	var i;

	// parse parameters
	var params = parameters[0].split(/,\s?/);
	params[0] = (params[0] || '').toLowerCase();
	var mapId = params[0];
	var tgtId = params[1];
	var srcId = params[2];

	if (!mapId || !tgtId || !srcId) {
		throw new Error('Image expects three parameters: "map, target, source", but received: "' + params.join(', ') + '"');
	}

	// get objects
	var mapObj = maps[mapId];
	if (!mapObj) {
		throw new Error('Invalid map "' + mapId + '". Try "SPR", "TIL", or "ITM" instead.');
	}
	var tgtObj = getImage(tgtId, mapObj);
	if (!tgtObj) {
		throw new Error('Target "' + tgtId + '" was not the id/name of a ' + mapId + '.');
	}
	var srcObj = getImage(srcId, mapObj);
	if (!srcObj) {
		throw new Error('Source "' + srcId + '" was not the id/name of a ' + mapId + '.');
	}

	// copy animation from target to source
	tgtObj.animation = {
		frameCount: srcObj.animation.frameCount,
		isAnimated: srcObj.animation.isAnimated,
		frameIndex: srcObj.animation.frameIndex,
	};
	for (i = 0; i < srcObj.animation.frameCount; ++i) {
		setImageData(tgtId, i, mapObj, getImageData(srcId, i, mapObj));
	}
}

function editPalette(environment, parameters) {
	// parse parameters
	var params = parameters[0].split(/,\s?/);
	params[0] = (params[0] || '').toLowerCase();
	var mapId = params[0];
	var tgtId = params[1];
	var palId = params[2];

	if (!mapId || !tgtId || !palId) {
		throw new Error('Image expects three parameters: "map, target, palette", but received: "' + params.join(', ') + '"');
	}

	// get objects
	var mapObj = maps[mapId];
	if (!mapObj) {
		throw new Error('Invalid map "' + mapId + '". Try "SPR", "TIL", or "ITM" instead.');
	}
	var tgtObj = getImage(tgtId, mapObj);
	if (!tgtObj) {
		throw new Error('Target "' + tgtId + '" was not the id/name of a ' + mapId + '.');
	}
	var palObj = parseInt(palId, 10);
	if (Number.isNaN(Number(palObj))) {
		throw new Error('Palette "' + palId + '" was not a number.');
	}

	// set palette
	tgtObj.col = palObj;
}

// hook up the dialog tags
addDualDialogTag('image', editImage);
addDualDialogTag('imagePal', editPalette);

/* 
 * {a = 42}
 * (updateNumberImagesNow "TIL, 'til_UI_', 'til_digit_', 'til_digit_empty', 3, 'a'")
 *  til_UI_2's sprite will change to til_digit_empty's;
 *  til_UI_1's sprite will change to til_digit_4's;
 *  til_UI_0's sprite will change to til_digit_2's;
 * 
 *  (updateNumberImagesNow "TIL, 'til_UI_', 'til_digit_', 'til_digit_empty', 3, 'a', true")
 *  til_UI_2's sprite will change to til_digit_4's;
 *  til_UI_1's sprite will change to til_digit_2's;
 *  til_UI_0's sprite will change to til_digit_empty's;
 */
addDialogTag('updateNumberImagesNow', function (environment, parameters) {
	let params = parameters[0].split(',');
	let type = params[0];
	let targetIdStart = params[1].trim();
	let sourIdStart = params[2].trim();
	let emptyNumberId = params[3].trim();
	let size = parseInt(params[4].trim());
	let valuePointer = params[5].trim();
	let left = params[6].trim();

	let value = parseInt(environment.GetVariable(valuePointer));
	if (value == undefined) {
		throw new Error("pointer params point to undefined: " + parameters[0]);
	}

	let notEmptyDigitLength = 1;
	let digits = new Array();
	for (let index = 0; index < size; index++) {
		let digit = Math.floor((value - Math.pow(10, index + 1) * Math.floor(value / Math.pow(10, index + 1))) / Math.pow(10, index));
		digits[index] = digit;
		if (digit > 0) {
			notEmptyDigitLength = index + 1;
		}
	}

	for (let index = 0; index < size; index++) {
		let targetId = (targetIdStart + index);
		
		let sourId;
		if (left) {
			if (index >= size - notEmptyDigitLength) {
				sourId = (sourIdStart + digits[index - (size -notEmptyDigitLength)]);
			} else {
				sourId = emptyNumberId;
			}
		} else {
			if (index < notEmptyDigitLength) {
				sourId = (sourIdStart + digits[index]);
			} else {
				sourId = emptyNumberId;
			}
		}
		

		let editImageParameters = [type + "," + targetId + "," + sourId];
		editImage(environment, editImageParameters);
	}

});

/**
 * Usage:
 * # equals (image "SPR, spr_targetArray_0, spr_source")
 * (imageByVarArrayItem "SPR, spr_targetArray, 0, spr_source")
*/
addDualDialogTag('imageByVarArrayItem', function (environment, parameters) {
	var params = parameters[0].split(',');
	var type = params[0].trim();
    var varArrayName = params[1].trim();
    var index = params[2].trim();
    if (index.startsWith("*")) {
        index = index.substring(1, index.length);
        index = environment.GetVariable(index);
    }
	var source = params[3].trim();

	var targetId = varArrayName + "_" + index;
	let editImageParameters = [type + "," + targetId + "," + source];
	editImage(environment, editImageParameters);
});


/**
 * Usage:
 * {length= 5}
 * (imageByVarArrayCondition "SPR, spr_targetArray, myConditionArray, *length, spr_source0, spr_source1")
 * 
 * # equals :
 * for (i = 0 to 5)
 * {
      - myConditionArray_i == 0 ?
        (image "SPR, spr_targetArray_i, spr_source0")
      - else ?
        (image "SPR, spr_targetArray_i, spr_source1")
    }
*/
addDualDialogTag('imageByVarArrayCondition', function (environment, parameters) {
	var params = parameters[0].split(',');
	var type = params[0].trim();
	var targetArrayName = params[1].trim();
    var conditionArrayName = params[2].trim();
    var length = params[3].trim();
    if (length.startsWith("*")) {
        length = length.substring(1, length.length);
        length = environment.GetVariable(length);
    }
	var soure0 = params[4].trim();
	var soure1 = params[5].trim();

	for (var index = 0; index < length; index++) {
		var targetId = targetArrayName + "_" + index;
		var conditonKey = conditionArrayName + "_" + index;
		var conditonValue = environment.GetVariable(conditonKey);
		var source;
		if (conditonValue == 0) {
			source = soure0;
		} else {
			source = soure1;
		}
		let editImageParameters = [type + "," + targetId + "," + source];
		editImage(environment, editImageParameters);
	}

});