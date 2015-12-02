var currentSystemName;
var currentSystemHash;
var currentSystem;

function setSystem(name) {
    currentSystemName = name;
    $("#title").text(currentSystemName);
    // For whatever reason, web3.sha3 does not start with a 0x. This leads to
    // attempts to reuse that hash to break.
    currentSystemHash = "0x" + web3.sha3(name);
    currentSystem = galaxy.galacticMap(currentSystemHash);
    if(!currentSystem[1]) {
        console.log("no system found.");
        console.log($)
        $("#screen").text("No system by that name, want to create one?");
        var button = document.createElement("input");
        button.type = "button";
        button.onclick = function () {
            createSystem(name, setSystem);
            $("#screen").append("System under construction. This make take some time.")
        };
        button.value = "YES!!!";
        $("#screen").append(button)
    }
}

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
}