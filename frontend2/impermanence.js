var currentSystemName;
var currentSystemHash;
var currentSystem;
var focusedSector = {};

var mapLegend = [
    ["&nbsp;", "Empty Space"],    //Empty,
    ["a", "Kaboomium Asteriod"],    //AtkAsteriod,
    ["d", "Bouncium Asteriod"],    //DefAsteriod,
    ["e", "Zoomium Asteriod"],    //EngAsteriod,
    ["A", "Ancient Monolith of Victory"],    //AtkMonolith,
    ["D", "Ancient Monolith of Barriers"],    //DefMonolith,
    ["E", "Ancient Monolith of Travel"],    //EngMonolith,
    ["U", "Unobtainium Rift"],    //UnobRift,
    ["#", "Obliteration Ray Factory"],    //AtkGreatMachine,
    [")", "S.H.I.E.L.D."],    //DefGreatMachine,
    ["0", "Omnigate"],    //EngGreatMachine,
    ["o", "Inhabited Planet"],    //Planet,
    ["O", "Sun"],    //Sun,
    ["*", "Wormhole"],    //Wormhole,
    ["^", "Ascension Gate"]     //AscensionGate
]

function setSystem(name) {
    currentSystemName = name;
    $("#title").text(currentSystemName);
    $("#screen").empty();
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
        $("#screen").append(systemMap);
        for(var x = 0; x < 15; x ++) {
            var row = document.createElement("tr");
            $(systemMap).append(row);
            for(var y = 0; y < 15; y++) {
                var cell = document.createElement("td");
                $(cell).text("?");
                $(cell).click({x: x, y: y}, focusSector)
                var setCell;
                setCell = function(err, result) {
                    if(err) {
                        console.log(err);
                        setTimeout(function() {
                            galaxy.getSectorType(currentSystemHash, this.x, this.y, {}, setCell.bind(this));
                        }.bind(this), 1000);
                    } else {
                        this.cell.html(mapLegend[result][0]);
                        console.log(x, y, result);
                    }
                }
                galaxy.getSectorType(currentSystemHash, x, y, {}, setCell.bind({
                    cell: $(cell),
                    x: x,
                    y: y
                }));
                $(row).append(cell);
            } 
        }
        focusedSector = {};
        var focus = document.createElement("div");
        focus.id = "focus";
        $("#screen").append(focus);
        $(focus).text("Click on a sector for more details.");
    }
}

function focusSector(event) {
    if(focusedSector.td)
        $(focusedSector.td).removeClass("selected");
    focusedSector = {};
    focusedSector.td = this;
    focusedSector.x = event.data.x;
    focusedSector.y = event.data.y;
    focusedSector.st = galaxy.getSectorType(
        currentSystemHash, 
        focusedSector.x, 
        focusedSector.y
    );
    $(this).addClass("selected");
    $("#focus").empty();
    $("#focus").append("Sector at " + focusedSector.x + ", " + focusedSector.y);
    $("#focus").append("<br />");
    $("#focus").append(mapLegend[focusedSector.st][1] + "<br />");
    // Hack to find sector type.
    if(mapLegend[focusedSector.st][0] == "*" ) { // Wormhole.
        focusedSector.destination = galaxy.getWormhole(
            currentSystemHash, 
            focusedSector.x,
            focusedSector.y
        );
        focusedSector.destinationName = galaxy.galacticMap(
            focusedSector.destination
        )[0]
        $("#focus").append("A womhole to " + focusedSector.destinationName + "!");
    }
    //$("#focus").append()
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