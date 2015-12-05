var currentSystemName;
var currentSystemHash;
var currentSystem;
var focusedSector = {};
var selectedShip = [];
var refreshFilter;

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
            //galaxy.addSystem(name, function() {
                // TODO: Refresh.
                //setTimeout("setSystem(name)", 1000);
            //});
            createSystem(name, setSystem);
            $("#screen").append("<br /> System under construction!")
        };
        button.value = "YES!!!";
        $("#screen").append(button)
    } else {
        var systemMap = document.createElement("table");
        systemMap.id = "map";
        $("#screen").append(systemMap);
        for(var y = 0; y < 15; y ++) {
            var row = document.createElement("tr");
            $(systemMap).append(row);
            for(var x = 0; x < 15; x++) {
                var cell = document.createElement("td");
                cell.id = x.toString(16) + y.toString(16);
                $(cell).text("?");
                $(cell).click(focusSector)
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
    console.log(this);
    focusedSector.td = this;
    var coords = parseID(this.id);
    focusedSector.x = coords[0];
    focusedSector.y = coords[1];
    focusedSector.st = galaxy.getSectorType(
        currentSystemHash, 
        focusedSector.x, 
        focusedSector.y
    );
    var watchSector = (function() {
        refreshFilter = galaxy.shipActivity({
            system: currentSystemHash,
            x: focusedSector.x,
            y: focusedSector.y
        });
        refreshFilter.watch(function() {
            console.log("I'm being called, at least :(.");
            focusSector.bind(this)(event);
        }.bind(this));
    }).bind(this);
    if(!refreshFilter) {
        watchSector();
    } else {
        refreshFilter.stopWatching();
        watchSector();
    }
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
    } else if(mapLegend[focusedSector.st][0] == "*") { // Wormhole.
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
    if(galaxy.getSectorShipsLength(
            currentSystemHash, 
            focusedSector.x, 
            focusedSector.y).toNumber() > 0) {
        $("#focus").append("<br />");
        $("#focus").append("Ships Present: <br />");
        var shipTable = document.createElement("table");
        shipTable.id = "ship_table";
        $("#focus").append(shipTable);
        $(shipTable).append("<tr><td>Name:</td><td>Owner:</td><td>A</td><td>D</td><td>E</td><td>HP</td><td>MR</td><td>ENERGY</td>")
        var shipSelect = document.createElement("select");
        shipSelect.id = "ship_select";
        $("#focus").append(shipSelect);
        focusedSector.ships = {};
        getSectorShips(
            currentSystemHash,
            focusedSector.x,
            focusedSector.y,
            focusedSector.ships,
            shipTable,
            shipSelect
        )
        $(shipSelect).change(function(event) {
            selectShip(focusedSector.ships[$(this).val()]);
        })
        var shipDiv = document.createElement("div");
        shipDiv.id = "ship_div";
        $("#focus").append(shipDiv);
    } else {
        $("#focus").append("No ships detected.");
    }
}

function getSectorShips(systemHash, x, y, shipList, shipTable, shipSelect)
{
    for(var i = 0; i < galaxy.getSectorShipsLength(systemHash, x, y); i++) {
        galaxy.getSectorShip(systemHash, x, y, i, function(err, result) {
            if(err) {
                console.log("Oh dear, we couldn't get a ship. Probably should fix this.");
                throw err;
            }
            var ship = [result];
            galaxy.shipRegistry(ship[0], function(err, result) {
                ship.push(result); 
                if(ship[1][0]) {
                    shipList[ship[0]] = ship;
                    if(!(typeof shipTable === "undefined")) {
                        var row = document.createElement("tr");
                        [12, 5, 7, 8, 9, 10, 11, 4].forEach(function (col) {
                            var colTD = document.createElement("td");
                            $(colTD).text(ship[1][col].toString());
                            $(row).append(colTD);
                        });
                        $(shipTable).append(row);
                    }
                    if(!(typeof shipSelect === "undefined")) {
                        var option = document.createElement("option");
                        option.value = ship[0];
                        $(option).text(ship[1][12]);
                        $(shipSelect).append(option);
                        $(shipSelect).change();
                    }
                }
            });
        });
    }
}

function selectShip(ship) {
    if(web3.eth.accounts.indexOf(ship[1][5]) == -1) {
        $("#ship_div").text("You don't seem to own this ship.");
    } else {
        $("#ship_div").empty();
        var move_btn = document.createElement("input");
        move_btn.type = "button";
        move_btn.value = "Launch!"
        $(move_btn).click(function(event) {
            $("#ship_div").text("Click on your destination sector!");
            function moveTo(event) {
                var coords = parseID(this.id);
                console.log(ship[1][5]);
                var action = new Action(
                    impulse, 
                    [ship[0], coords[0], coords[1], ship[1][5]], 
                    getDistance([ship[1][2].toNumber(), ship[1][3].toNumber()], coords)
                );
                action.act();
                $("body").off("click", "#map tr td", moveTo);
            }
            $("#map tr td").click(moveTo);
        })
        $("#ship_div").append(move_btn);
        if(mapLegend[focusedSector.st][0] == "*") {
            var jmp_btn = document.createElement("input");
            jmp_btn.type = "button";
            jmp_btn.value = "Enter wormhole!"
            $(jmp_btn).click(function(event) {
                $("#ship_div").text("INITIATING JUMP SEQUENCE!");
                var action = new Action(
                    jump,
                    [ship[0], focusedSector.destination, ship[1][5]],
                    1
                );
                action.act();
            });
            $("#ship_div").append(jmp_btn);
        }
    }
}

function getDistance(coordsa, coordsb) {
    var distance = 0;
    distance += Math.abs(coordsa[0] - coordsb[0]);
    distance += Math.abs(coordsa[1] - coordsb[1]);
    return distance;
}

// Lo! in the middle of the hackathon I feel the urge to implement a
// decorator.
// By which I mean class.
function Action(f, args, effort) {
    this.f = f;
    this.args = args;
    this.shipID = this.args[0];
    this.effort = effort;
    this.massRatio = galaxy.shipRegistry(this.shipID)[11];
}

Action.prototype.condition = function() {
    var energy = galaxy.getShipEnergy(this.shipID).toNumber() 
    if(energy >= (this.massRatio * this.effort)) {
        console.log("Condition met:", energy, (this.massRatio * this.effort));
        return true;
    } else {
        console.log("Condition not met:", energy, (this.massRatio * this.effort));
        return false;
    }
}

Action.prototype.act = function() {
        var origThis = this;
        var origArg = this.args;
        var attempt = function() {
            try {
                this.f.apply(origThis, origArg);
            } catch(err) {
                console.log("Attempt failed:", err.toString());
                // Hack! Let's just keep trying until it works.
                setTimeout(attempt, 1000);
            }
        }.bind(this);
        if(this.condition()) {
            //console.log("Sufficient Energy", galaxy.getShipEnergy(shipID));
            attempt();
        } else {
            //console.log("Insufficient Energy", galaxy.getShipEnergy(shipID).toNumber());
            this.waitFilter = web3.eth.filter("latest");
            this.waitFilter.watch(function() {
                if(this.condition()) {
                    this.waitFilter.stopWatching();
                    attempt();
                }
                //console.log("Energy still insufficient", galaxy.getShipEnergy(shipID).toNumber());
            }.bind(this));
        }
}

function impulse(shipID, x, y, owner) {
    console.log("Impulse move", shipID, x, y, owner);
    galaxy.impulse(shipID, x, y, {from: owner});
}

function jump(shipID, destination, owner) {
    // We must get the hint first.
    // By brute force, apparently.
    for(var x = 0; x < 15; x++) {
        for(var y = 0; y < 15; y++) {
            if(galaxy.getWormhole(
                currentSystemHash, 
                focusedSector.x,
                focusedSector.y
            ) == destination) {
                var hint = galaxy.compressCoords([x, y]);
                console.log("ATTEMPTING JUMP!", destination, hint, x, y);
                galaxy.jump(shipID, hint);
                return;
            }
        }
    }
    console.log("No matching wormhole found. :(");
}

function createSystem(name, callback) {
    galaxy.addSystem(name);
    var systemCreated = galaxy.systemAdded({'_systemHash': currentSystemHash});
    systemCreated.watch(function(err, result) {
        if(err) console.log(err);
        else {
            systemCreated.stopWatching();
            callback(name);
        }
    });
}