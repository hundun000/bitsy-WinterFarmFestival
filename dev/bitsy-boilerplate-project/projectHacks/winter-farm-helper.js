import bitsy from 'bitsy';
import { addDualDialogTag } from '@bitsy/hecks/src/helpers/kitsy-script-toolkit';

addDualDialogTag('randomVarArray', function (environment, parameters) {
	var params = parameters[0].split(',');
    var varArrayName = params[0].trim();
    var varArraySize = Number(params[1].trim());
    var max = Number(params[2].trim());

    for (var i = 0; i < varArraySize; i++) {
        var key = varArrayName + "_" + i;
        var value = Math.floor(Math.random() * max);
        environment.SetVariable(key, value)
    }
});


/**
 * Usage 0:
 * (setVariableByArrayItemNow "myArray, 0, 42")
 * {print myArray_0}
 * 
 * Usage 1:
 * {value = 42}
 * {index = 0}
 * (setVariableByArrayItemNow "myArray, *index, *value")
 * {print myArray_0}
*/
addDualDialogTag('setVariableByArrayItem', function (environment, parameters) {
	var params = parameters[0].split(',');
    var varArrayName = params[0].trim();
    var index = params[1].trim();
    var value = params[2].trim();
    if (index.startsWith("*")) {
        index = index.substring(1, index.length);
        index = environment.GetVariable(index);
    }
    if (value.startsWith("*")) {
        value = value.substring(1, value.length);
        value = environment.GetVariable(value);
    }
    var key = varArrayName + "_" + index;
    environment.SetVariable(key, value)
});

/**
 * Usage 0:
 * {myArray_0 = 42}
 * {print (getVariableByArrayItemNow "myArray, 0")}
 * 
 * Usage 1:
 * {myArray_0 = 42}
 * {index = 0}
 * {print (getVariableByArrayItemNow "myArray, *index")}
*/
addDualDialogTag('getVariableByArrayItem', function (environment, parameters) {
	var params = parameters[0].split(',');
    var varArrayName = params[0].trim();
    var index = params[1].trim();
    if (index.startsWith("*")) {
        index = index.substring(1, index.length);
        index = environment.GetVariable(index);
    }
    var key = varArrayName + "_" + index;
    return environment.GetVariable(key)
});

addDualDialogTag('random2DVarArray', function (environment, parameters) {
	var params = parameters[0].split(',');
    var varArrayName = params[0].trim();
    var varArrayWidth = Number(params[1].trim());
    var varArrayHeight = Number(params[2].trim());
    var max = Number(params[3].trim());
    
    for (var x = 0; x < varArrayWidth; x++) {
        for (var y = 0; y < varArrayHeight; y++) {
            var key = varArrayName + "_" + x + "_" + y;
            var value = Math.floor(Math.random() * max);
            environment.SetVariable(key, value)
        }
    }
});

/**
 * Usage:
 * {key = var_a}
 * (setVariableByPointer "key, true, AS_BOOL")
 * assert var_a == true
*/
addDualDialogTag('setVariableByPointer', function (environment, parameters) {
	let params = parameters[0].split(',');
    let pointer = params[0].trim();
    let key = environment.GetVariable(pointer);
    let value = params[1].trim();
    let type = params[2].trim();
    let valueWithType;
    if (type == "AS_NUM") {
        valueWithType = Number(value);
    } else if (type == "AS_BOOL") {
        valueWithType = (value === 'true');
    } else {
        valueWithType = String(value);
    }
    environment.SetVariable(key, valueWithType);
});

/**
 * Usage:
 * {var_a = 42}
 * {value = (calculateBoolExpNow "*var_a, =, 42")}
 * assert value == true
*/
addDualDialogTag('calculateBoolExp', function (environment, parameters) {
	let params = parameters[0].split(',');
    let operator1 = params[0].trim();
    if (operator1.startsWith("*")) {
        operator1 = operator1.substring(1, operator1.length);
        operator1 = environment.GetVariable(operator1);
    }
    let operation = params[1].trim();
    let operator2 = params[2].trim();
    if (operator2.startsWith("*")) {
        operator2 = operator2.substring(1, operator2.length);
        operator2 = environment.GetVariable(operator2);
    }
    let result;
    if (operation == "=") {
        result = String(operator1) == String(operator2);
    }
    return result;
});