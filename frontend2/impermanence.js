var currentSystemName;
var currentSystemHash;
var currentSystem;

var mapLegend = [
    " ",    //Empty,
    "a",    //AtkAsteriod,
    "d",    //DefAsteriod,
    "e",    //EngAsteriod,
    "A",    //AtkMonolith,
    "D",    //DefMonolith,
    "E",    //EngMonolith,
    "U",    //UnobRift,
    "#",    //AtkGreatMachine,
    ")",    //DefGreatMachine,
    "0",    //EngGreatMachine,
    "o",    //Planet,
    "O",    //Sun,
    "*",    //Wormhole,
    "^"     //AscensionGate
]

function setSystem(name) {
    currentSystemName = name;
    $("#title").text(currentSystemName);
    // For whatever reason, web3.sha3 does not start with a 0x. This leads to
    // attempts to reuse that hash to break.
    currentSystemHash = "0x" + web3.sha3(name);
    currentSystem = galaxy.galacticMap(currentSystemHash);
    if(!currentSystem[1]) {
        console.log("no system found.");
        $("#screen").text("No system by that name, want to create one?");
        var button = document.createElement("input");
        button.type = "button";
        button.onclick = function () {
            galaxy.addSystem(name, function() {
                // TODO: Refresh.
                //setTimeout("setSystem(name)", 1000);
            });
            //createSystem(name, setSystem);
            //$("#screen").append("System under construction. This make take some time.")
        };
        button.value = "YES!!!";
        $("#screen").append(button)
    } else {
        var systemMap = document.createElement("table");
        systemMap.id = "map";
        for(var i = 0; i < 15; i++) {
            var row = document.createElement("tr");
            for(var j = 0; j < 15; j++) {
                var cell = document.createElement("td");
                $(cell).text(galaxy.getSector(currentSystemHash, i, j));
                $(row).append(cell);
            }
            $("#map").append(row);
        }
        $("#screen").append(systemMap);
    }
}
/*
function createSystem(name, callback) {
    galaxy.addSystem(name);
    var systemCreated = galaxy.systemAdded({'_name': name});
    systemCreated.watch(function(err, result) {
        if(err) console.log(err);
        else {
            systemCreated.stopWatching();
            callback(name);
        }
    });
}*/