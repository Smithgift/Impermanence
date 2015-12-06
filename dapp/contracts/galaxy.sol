import "std.sol";
import "../_pre/shiplib.sol";

///@title The Impermanence of Space: Galaxy Contract.
contract Galaxy is named("Galaxy") {

    /*enum TechTypes {
        Atk,
        Def,
        Eng
    }*/
    
    enum SectorType {
        Empty,
        AtkAsteriod,
        DefAsteriod,
        EngAsteriod,
        AtkMonolith,
        DefMonolith,
        EngMonolith,
        UnobRift,
        AtkGreatMachine,
        DefGreatMachine,
        EngGreatMachine,
        Planet,
        Sun,
        Wormhole,
        AscensionGate
    }
    
    struct Sector {
        SectorType st;
        uint8 mine;
        uint[] sectorShips;
    }
    
    struct System {
        Sector[15][15] map;
        string name;
        uint[3] techLevels;
        bool exists;
        mapping (uint8 => bytes32) Wormholes;
    }
    
    ///@dev convert an array of uints into a single uint. 
    function compressCoords(uint8[2] coords) constant returns (uint8)
    {
        return coords[0] + (coords[1] * 16);
    }
    
    function decompressCoords(uint8 compressedCoords) 
        constant 
        returns (uint8 x, uint8 y)
    {
        y = compressedCoords / 16;
        x = compressedCoords % 16;
    }
    
    mapping (bytes32 => System) public galacticMap;
    
    // And now for a zillion helper functions. Recursive structs and 
    // getters do not mix. The good news is that calls are free.
    
    function getSectorType(bytes32 s, uint8 x, uint8 y) 
        constant 
        returns (SectorType) 
    {
        return galacticMap[s].map[x][y].st;
    }
    
    function getWormhole(bytes32 s, uint8[2] coords) 
        constant
        returns (bytes32)
    {
        return galacticMap[s].Wormholes[compressCoords(coords)];
    }

    function getSectorShipsLength(bytes32 s, uint8 x, uint8 y)
        constant 
        returns (uint) 
    {
        return galacticMap[s].map[x][y].sectorShips.length;   
    }

    function getSectorShip(bytes32 s, uint8 x, uint8 y, uint i)
        constant 
        returns (uint) 
    {
        return galacticMap[s].map[x][y].sectorShips[i];
    }

    function Galaxy() {
        // This is a kludge to get the address of the Galaxy.
        log0("A new galaxy is born!");
        // 0 is no ship.
        nextShip = 1;
    }

    event systemAdded(bytes32 indexed _systemHash);

    function addSystem(string _name) {
        // Hack alert!
        bytes32 systemHash = sha3(_name);
        System newSystem = galacticMap[systemHash];
        newSystem.name = _name;
        newSystem.exists = true;
        generateMap(systemHash);
        systemAdded(systemHash);
        //galacticMap.push(newSystem);
    }
    
    // We want the hash, not a pointer, because we need the hash as a seed.
    function generateMap(bytes32 systemHash) internal {
        System newSystem = galacticMap[systemHash];
        newSystem.map[7][7].st = SectorType.Sun;
        uint256 seed = uint256(systemHash);
        uint8 x;
        uint8 y;
        uint8 newST;
        for(uint8 i = 0; i < 16; i++) {
            x = uint8(seed % 16);
            seed /= 16;
            y = uint8(seed % 16);
            seed /= 16;
            newST = uint8(seed % 16);
            seed /= 256;
            if((x == 15) || (y == 15)) {
                continue; // We're off the map.
            } else {
                Sector chosenSector = newSystem.map[x][y];
                if(chosenSector.st != SectorType.Empty) continue;
                if(newST <= 2) {
                    chosenSector.st = SectorType.AtkAsteriod;
                } else if (newST <= 5) {
                    chosenSector.st = SectorType.DefAsteriod;
                } else if (newST <= 8) {
                    chosenSector.st = SectorType.EngAsteriod;
                } else if (newST == 9) {
                    chosenSector.st = SectorType.AtkMonolith;
                } else if (newST == 10) {
                    chosenSector.st = SectorType.DefMonolith;
                } else if (newST == 11) {
                    chosenSector.st = SectorType.EngMonolith;
                } else if (newST <= 13) {
                    chosenSector.st = SectorType.UnobRift;
                } else {
                    chosenSector.st = SectorType.Planet;
                }
            }
        }
    }
    
    // TODO: Make internal.
    function createLink(
        bytes32 _from, 
        uint8[2] _fromCoords, 
        bytes32 _to, 
        uint8[2] _toCoords
    ) {
        System fromSystem = galacticMap[_from];
        Sector fromSector = fromSystem.map[_fromCoords[0]][_fromCoords[1]];
        if(fromSector.st != SectorType.Empty) 
            throw;
        System toSystem = galacticMap[_to];
        Sector toSector = toSystem.map[_toCoords[0]][_toCoords[1]];
        if(toSector.st != SectorType.Empty) 
            throw;
        fromSector.st = SectorType.Wormhole;
        fromSystem.Wormholes[compressCoords(_fromCoords)] = _to;
        toSector.st = SectorType.Wormhole;
        toSystem.Wormholes[compressCoords(_toCoords)] = _from;
    }

    //
    // SHIPS!
    //
    
    using ShipLib for ShipLib.Ship;
     
    mapping (uint => ShipLib.Ship) public shipRegistry;
    
    uint nextShip;
    
    modifier onlyshipowner(uint _shipID) {
        if(shipRegistry[_shipID].owner != msg.sender) {
            throw;
        } else { 
            _
        }
    }
    
    event shipActivity(
        bytes32 indexed system, 
        uint8 indexed x, 
        uint8 indexed y,
        uint shipID
    );
    
    function getShipEnergy(uint _shipID) constant returns (uint) {
        return shipRegistry[_shipID].getEnergy();
    }

    function getShipCargo(uint _shipID, uint8 _cargoType) constant returns (uint) {
        return shipRegistry[_shipID].cargo[_cargoType];
    }

    function insertShip(
        bytes32 _system, 
        uint8 _x, 
        uint8 _y, 
        uint _shipID
    ) 
        internal 
    {
        // Optimiziation smoptimization.
        Sector _sector = galacticMap[_system].map[_x][_y];
        _sector.sectorShips.push(_shipID);
        shipActivity(_system, _x, _y, _shipID);
    }
    
    function removeShip(
        bytes32 _system, 
        uint8 _x, 
        uint8 _y, 
        uint _shipID
    ) 
        internal 
    {
        Sector _sector = galacticMap[_system].map[_x][_y];
        uint i = 0;
        while(true) {
            if(_sector.sectorShips[i] == _shipID) {
                _sector.sectorShips[i] = 0;
                shipActivity(_system, _x, _y, _shipID);
                return;
            }
            i++; // Yes, if we go off, we'll throw. That's the point.
        }
    }
    
    function spawnCrane(bytes32 _system, uint8 _x, uint8 _y, string _name) {
        Sector spawnSector = galacticMap[_system].map[_x][_y];
        if(spawnSector.st != SectorType.Planet) 
            throw; // Generally, empty space does not have an industrial base.
        uint craneID = nextShip++;
        ShipLib.Ship crane = shipRegistry[craneID];
        crane.exists = true;
        crane.currentSystem = _system;
        crane.x = _x;
        crane.y = _y;
        crane.energy = 0;
        crane.owner = msg.sender;
        crane.lastRefreshed = now;
        crane.def = 1;
        crane.eng = 1;
        crane.name = _name;
        crane.refreshMassRatio();
        crane.restoreHP();
        insertShip(_system,_x, _y, craneID);
    }
    
    function moveShip(
        uint _shipID, 
        bytes32 _newSystem, 
        uint8 _newX, 
        uint8 _newY, 
        uint distance
    ) internal
    {
        ShipLib.Ship mover = shipRegistry[_shipID];
        //Sector oldSector=galacticMap[mover.currentSystem].map[mover.x][mover.y];
        removeShip(mover.currentSystem, mover.x, mover.y, _shipID);
        mover.move(_newSystem, _newX, _newY, distance);
        //Sector newSector=galacticMap[_newSystem].map[_newX][_newX];
        insertShip(_newSystem, _newX, _newY, _shipID);
    }
    
    function impulse(
        uint _shipID, 
        uint8 _newX, 
        uint8 _newY
    ) 
        onlyshipowner(_shipID) 
    {
        uint distance = 1;
        ShipLib.Ship mover = shipRegistry[_shipID];
        // Guess what, kids? absolute values are broken!
        //distance += uint(+(int(mover.x) - int(_newX)));
        //log2(bytes32(mover.x), bytes32(_newX), bytes32(distance));
        //distance += uint(+(int(mover.y) - int(_newY)));
        //log2(bytes32(mover.y), bytes32(_newY), bytes32(distance));
        moveShip(_shipID, mover.currentSystem, _newX, _newY, distance);
    }
    
    function jump(uint _shipID, uint8 destHint) onlyshipowner(_shipID) {
        ShipLib.Ship ship = shipRegistry[_shipID];
        uint8[2] memory homecoords;
        homecoords[0] = ship.x;
        homecoords[1] = ship.y;
        bytes32 dest = galacticMap[ship.currentSystem]
                                        .Wormholes[compressCoords(homecoords)];
        if(dest == 0x0) 
            throw; // There wasn't a wormhole here.
        System destSystem = galacticMap[dest];
        if(destSystem.Wormholes[destHint] != ship.currentSystem)
            throw; // YOU SHOULD HAVE TAKEN THAT META-LEFT TURN!
        uint8 destx;
        uint8 desty;
        (destx, desty) = decompressCoords(destHint);
        moveShip(_shipID, dest, destx, desty, 1);
    }
    
    function canMine(uint _shipID, uint16 diff) constant returns (bool) {
        return true;
        var ship = shipRegistry[_shipID];
        var sector = galacticMap[ship.currentSystem].map[ship.x][ship.y];
        return ((uint(sha3(_shipID, (block.blockhash(block.number -1)))) % diff) 
                == ((sector.mine) % diff));
    }
    
    function mine(uint _shipID) {
        return;
        var ship = shipRegistry[_shipID];
        ship.genericAction(8);
        var sector = galacticMap[ship.currentSystem].map[ship.x][ship.y];
        uint st = uint(sector.st);
        uint16 diff;
        if(st == 0) {
            throw; // You said there was something to mine HERE?
        } else if (st < 4) {
            diff = 16;
        } else if (st < 7) {
            diff = 256;
        } else if (st == 7) {
            diff = 32;
        } else {
            throw; // I don't know if you get what mining means.
        }
        if(canMine(_shipID, diff)) {
            ship.cargo[st - 1]++;
            log1("New cargo:",bytes32(ship.cargo[st - 1]));
            ship.refreshMassRatio();
            sector.mine++;
            shipActivity(ship.currentSystem, ship.x, ship.y, _shipID);
            if(st > 3) {
                if(st < 7) {
                    sector.st = SectorType(st - 3);
                } else {
                    sector.st = SectorType.Empty;
                }
            }
        } else {
            throw; // It was here a moment ago, I swear!
        }
    }
    
    function upgrade(uint _shipID, uint8 cargoType) {
        var ship = shipRegistry[_shipID];
        var sector = galacticMap[ship.currentSystem].map[ship.x][ship.y];
        var system = galacticMap[ship.currentSystem];
        if(sector.st != SectorType.Planet)
            throw; // What are you upgrading (with?)
        if(cargoType > 5) {
            throw; // I don't think that will help.
        } else if(cargoType > 2) {
            system.techLevels[cargoType - 3]++;
        } else if(cargoType == 2) {
            ship.eng++;
        } else if(cargoType == 1) {
            ship.def++;
        } else if(cargoType == 0) {
            ship.eng++;
        }
    }
}