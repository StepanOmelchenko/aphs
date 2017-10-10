console.log("     *|---APHS---|*");



const path = require('path');
const projectPath = path.resolve(__dirname,'../../');
const JSONPath = path.resolve(__dirname,'../../aphs.json');
const defaultJSONPath = path.resolve(__dirname,'./default-aphs.json');
const srcPath = projectPath+"/src";

// example file copying source and destination in src folder
const exampleSrcPath  = path.resolve(__dirname,'./aphs-usage-example.js');
const exampleDestPath = srcPath+'/aphs-usage-example.js';
const fs = require('fs');
const fse = require('fs-extra');



function checkAphsInitiated() {
    if (!fs.existsSync(JSONPath)) {
        fse.copySync(defaultJSONPath, JSONPath);
        fse.copySync(exampleSrcPath, exampleDestPath); // optional, for help
    }
}

function getJSON() {
    checkAphsInitiated();
    return JSON.parse(fs.readFileSync(JSONPath, 'utf8'));
}



function addJSON(data) {
	let defaultIndex = {"name": data, "position": {"left": 0, "top": 0}, "blocks": [{"name": "sourceBlockExample", "top": 170, "left": 148, "width": 361, "height": 64}, {"name": "targetBlockExample", "top": 197, "left": 587, "width": 532, "height": 64}], "connections": [{"from": {"block": 0, "line": 2}, "to": {"block": 1}}], "contents": {} };
	let indexes = getJSON();
		
	indexes['contexts'].push(defaultIndex);
	saveJSON(indexes);
}



function saveJSON(json) {
    fs.writeFileSync(JSONPath, JSON.stringify(json), "utf8");
}



function updateProjectBlocks(){
    var json = getJSON();
    json.blocks = getBlocks();
    saveJSON(json);
}




function parseFile(filename) {
    var code = fs.readFileSync(srcPath+"/"+filename, "utf8");
    var regExp = new RegExp(/\/\*-(.+?)-\*\//, 'gim');
    var array = code.match(regExp);
    var toReturn = [];
    if (array !== null) {
        array.forEach(function(clip, index, array) {
            var closer ="/*-/" + clip.substring(3, clip.length);
            if (array.indexOf(closer, index + 1) !== -1) {
                toReturn.push({
                    name: clip.substring(3, clip.length-3),
                    filename: filename
                });
            }
        });
    }
    return toReturn;
}




function getBlocks() {
    var blocks = [];
    fs.readdirSync(srcPath).forEach(function(filename){
        blocks = blocks.concat(parseFile(filename));
    });
    return blocks;
}




function getBlockContent(blockName) {
    var code = getFileContent.byBlockName(blockName);
    if (!code) {
        // If cannot find file
        console.log("Can not find file with block "+blockName);
        return null;
    } else {
        if (
            code.indexOf("/*-"+blockName+"-*/") !== -1
            &&
            code.indexOf("/*-/"+blockName+"-*/") !== -1
        ){
            return code.split("/*-"+blockName+"-*/\n")[1].split("\n/*-/"+blockName+"-*/")[0];
        } else {
            // If there is no marks in file
            console.log ("Block is not closed: "+blockName);
            return null;
        }
    }
}




function saveBlockContent(blockName, newBlockContent) {
    var code = getFileContent.byBlockName(blockName);
    var array1 = code.split("/*-"+blockName+"-*/\n");
    var array2 = array1[1].split("\n/*-/"+blockName+"-*/");
    var updatedCode = array1[0] + "/*-"+blockName+"-*/\n" + newBlockContent + "\n/*-/"+blockName+"-*/" + array2[1];

    var filename = getBlockFilename(blockName);
    fs.writeFileSync(srcPath+"/"+filename, updatedCode, "utf8");
}



function getBlockFilename (blockName){
    var json = getJSON();
    for (block of json.blocks) {
        if(block.name === blockName) {
            return block.filename;
        }
    }
    return null;
}



var getFileContent = {
    byBlockName: function(blockName) {
        var filePath = srcPath+"/"+getBlockFilename(blockName);
        if (!fs.existsSync(filePath)) {
            return null;
        }
        return fs.readFileSync(filePath, "utf8");
    }
};




        ////////////////
        //            //
        //   Export   //
        //            //
        ////////////////



module.exports = {
    checkAphsInitiated:checkAphsInitiated,
    updateProjectBlocks:updateProjectBlocks,
    saveBlockContent:saveBlockContent,
    getBlocks:getBlocks,
    getBlockContent:getBlockContent,
    parseFile:parseFile,
    getJSON:getJSON,
    saveJSON:saveJSON,
	addJSON:addJSON
};