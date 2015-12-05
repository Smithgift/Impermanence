var currentSystemName;
var currentSystemHash;
var currentSystem;
var focusedSector = {};
var selectedShip = [];

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
                cell.id = x.toString(16) + y.toString(16);
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
                        console.log(this.x, this.y, result);
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

function parseID(id) {
    return [parseInt(id[0], 16), parseInt(id[1], 16)]
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
    $("#focus").append(mapLegend[focusedSector.st][1] + " at " + focusedSector.x + ", " + focusedSector.y);
    $("#focus").append("<br />");
    //$("#focus").append( + "<br />");
    // Hack to find sector type.
    if(mapLegend[focusedSector.st][0] == "o") { // Planet.
        var craneName = document.createElement("input");
        $("#focus").append(craneName);
        var button = document.createElement("input");
        button.type = "button";
        button.onclick = function() {
            console.log($(craneName).val());
            galaxy.spawnCrane(
                currentSystemHash, 
                focusedSector.x, 
                focusedSector.y,
                $(craneName).val()
            );
        };
        button.value = "Construct CRaNE!";
        $("#focus").append(button);        
    } if(mapLegend[focusedSector.st][0] == "*") { // Wormhole.
        focusedSector.destination = galaxy.getWormhole(
            currentSystemHash, 
            focusedSector.x,
            focusedSector.y
        );
        focusedSector.destinationName = galaxy.galacticMap(
            focusedSector.destination
        )[0]
        $("#focus").append("A womhole to " + focusedSector.destinationName + "!");
        $("#focus").append("<br />");
        var button = document.createElement("input");
        button.type = "button";
        button.onclick = function() {
            setSystem(focusedSector.destinationName);
        };
        button.value = "Go to system!";
        $("#focus").append(button)
    }
    focusedSector.ships = getSectorShips(
        currentSystemHash,
        focusedSector.x,
        focusedSector.y
    );
    if(focusedSector.ships.length > 0) {
        $("#focus").append("<br />");
        $("#focus").append("Ships Present: <br />");
        var shipTable = document.createElement("table");
        shipTable.id = "ship_table";
        $(shipTable).append("<tr><td>Name:</td><td>Owner:</td><td>A</td><td>D</td><td>E</td><td>HP</td><td>MR</td><td>ENERGY</td>")
        $("#focus").append(shipTable);
        var shipSelect = document.createElement("select");
        //shipSelect.type = "select";
        shipSelect.id = "ship_select";
        $("#focus").append(shipSelect);
        focusedSector.ships.forEach(function(entry){
            // Table entry.
            var row = document.createElement("tr");
            [12, 5, 7, 8, 9, 10, 11, 4].forEach(function (col) {
                $(row).append("<td></td>");
                var colData = entry[1][col];
                $(row).children().last().append(colData.toString());
            })
            $(shipTable).append(row);
            /*
        bool exists;
        bytes32 currentSystem;
        uint8 x;
        uint8 y;
        uint8 energy;
        address owner;
        uint lastRefreshed;
        uint atk;
        uint def;
        uint eng;
        int currentHP;
        uint massRatio;
        Cargo[] cargo;
        string name;
*/
            // Select entry.
            var option = document.createElement("option");
            option.value = entry[0];
            $(option).text(entry[1][12]);
            $(shipSelect).append(option);
        })
        $(shipSelect).change(function(event) {
            selectShip(focusedSector.ships[$(this).val()]);
        })
        var shipDiv = document.createElement("div");
        shipDiv.id = "ship_div";
        $("#focus").append(shipDiv);
    }
}

function getSectorShips(systemHash, x, y)
{
    var ships = [];
    for(var i = 0; i < galaxy.getSectorShipsLength(systemHash, x, y); i++) {
        ship = [];
        ship.push(galaxy.getSectorShip(systemHash, x, y, i));
        ship.push(galaxy.shipRegistry(ship[0]));
        if(ship[1][0]) ships.push(ship);
    }
    return ships;
}

function selectShip(ship) {
    if(web3.eth.accounts.indexOf(ship[1][5]) == -1) {
        $("#ship_div").text("You don't seem to own this ship.");
    } else {
        $("#ship_div").empty();
        $("#ship_div").append("Move:");
        var move_btn = document.createElement("input");
        move_btn.type = "button";
        $(move_btn).click(function(event) {
            //var mapCells = ;
            function moveTo(event) {
                var coords = parseID(this.id);
                impulse(ship[0], coords[0], coords[1], {from: ship[0][5]});
                $("body").off("click", "#map tr td", moveTo);
            }
            $("#map tr td").click(moveTo);
        })
        $("#ship_div").append(move_btn);
    }
}

function impulse(shipID, x, y, owner) {
    console.log("Impulse move", shipID, x, y, owner);
    galaxy.impulse(shipID, x, y, {from: owner});
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