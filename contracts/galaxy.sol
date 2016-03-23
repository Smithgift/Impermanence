import "shiplib.sol";

///@title The Impermanence of Space: Galaxy Contract.
contract Galaxy {

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
    
    struct System {
        SectorType[256] map;
        uint[] localShips;
        string name;
        bool exists;
        uint[3] techLevels;
        mapping (uint8 => bytes32) Wormholes;
    }

    mapping (bytes32 => System) public galacticMap;
    
    // And now for a zillion helper functions. Recursive structs and 
    // getters do not mix. The good news is that calls are free. *
    // * Y'know, except for local performance.
    
    function getSystemMap(bytes32 system) 
        constant 
        returns (SectorType[256]) 
    {
        return galacticMap[system].map;
    }
    
    function getWormhole(bytes32 system, uint8 coords) 
        constant
        returns (bytes32)
    {
        return galacticMap[system].Wormholes[coords];
    }

    function getSystemShips(bytes32 system)
        constant 
        returns (uint[]) 
    {
        return galacticMap[system].localShips;
    }

    function Galaxy() {
        // 0 is no ship.
        nextShip = 1;
    }

    event systemAdded(bytes32 indexed _systemHash);

    function addSystem(string _name) {
        bytes32 systemHash = sha3(_name);
        var newSystem = galacticMap[systemHash];
        newSystem.name = _name;
        newSystem.exists = true;
        newSystem.map = generateMap(systemHash);
        systemAdded(systemHash);
    }
    
    function generateMap(bytes32 systemHash) 
      constant 
      returns (SectorType[256] newMap) 
    {
        newMap[(7 * 16) + 7] = SectorType.Sun;
        newMap[(7 * 16) + 8] = SectorType.Sun;
        newMap[(8 * 16) + 7] = SectorType.Sun;
        newMap[(8 * 16) + 8] = SectorType.Sun;
        uint256 seed = uint256(systemHash);
        uint8 newCoords;
        uint8 newST;
        for(uint8 i = 0; i < 16; i++) {
            newCoords = uint8(seed % 256);
            seed /= 256;
            // TODO: Use better tables so no need to mod.
            newST = uint8(seed % 16);
            seed /= 256;
            if(newMap[newCoords] != SectorType.Empty) {
              continue;
            } else if(newST <= 2) {
              newMap[newCoords] = SectorType.AtkAsteriod;
            } else if (newST <= 5) {
              newMap[newCoords] = SectorType.DefAsteriod;
            } else if (newST <= 8) {
              newMap[newCoords] = SectorType.EngAsteriod;
            } else if (newST == 9) {
              newMap[newCoords] = SectorType.AtkMonolith;
            } else if (newST == 10) {
              newMap[newCoords] = SectorType.DefMonolith;
            } else if (newST == 11) {
              newMap[newCoords] = SectorType.EngMonolith;
            } else if (newST <= 13) {
              newMap[newCoords] = SectorType.UnobRift;
            } else {
              newMap[newCoords] = SectorType.Planet;
            }
        }
    }
    
    function createLink(
        bytes32 _from, 
        uint8 _fromCoords, 
        bytes32 _to, 
        uint8 _toCoords
    ) 
        internal
    {
        var fromSystem = galacticMap[_from];
        var fromSector = fromSystem.map[_fromCoords];
        if(fromSector != SectorType.Empty) 
            throw;
        var toSystem = galacticMap[_to];
        var toSector = toSystem.map[_toCoords];
        if(toSector != SectorType.Empty) 
            throw;
        fromSector = SectorType.Wormhole;
        fromSystem.Wormholes[_fromCoords] = _to;
        toSector = SectorType.Wormhole;
        toSystem.Wormholes[_toCoords] = _from;
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
        uint8 indexed coords,
        uint indexed shipID
    );
    
    function getShipEnergy(uint _shipID) constant returns (uint) {
        return shipRegistry[_shipID].getEnergy();
    }

    function getShipCargo(uint _shipID, uint8 _cargoType) 
        constant 
        returns (uint) 
    {
        return shipRegistry[_shipID].cargo[_cargoType];
    }

    function insertShip(
        bytes32 _system, 
        uint _shipID
    ) 
        internal 
    {
        galacticMap[_system].localShips.push(_shipID);
    }
    
    function removeShip(
        bytes32 _system, 
        uint _shipID
    ) 
        internal 
    {
        var system = galacticMap[_system];
        for(var i = 0; i < system.localShips.length; i++) {
            if(system.localShips[i] == _shipID) {
                system.localShips[i] = system.localShips[system.localShips.length];
                system.localShips.length--;
                return;
            }
        }
        // Is it not here? Throw!
        throw;
    }
    
    function spawnCrane(bytes32 _system, uint8 _coords, string _name) {
        var spawnSector = galacticMap[_system].map[_coords];
        if(spawnSector != SectorType.Planet) 
            throw; // Generally, empty space does not have an industrial base.
        uint craneID = nextShip++;
        var crane = shipRegistry[craneID];
        crane.exists = true;
        crane.system = _system;
        crane.coords = _coords;
        crane.energy = 0;
        crane.owner = msg.sender;
        crane.lastRefreshed = now;
        crane.def = 1;
        crane.eng = 1;
        crane.name = _name;
        crane.refreshMassRatio();
        crane.restoreHP();
        insertShip(_system, craneID);
    }
    
    function moveShip(
        uint _shipID, 
        bytes32 _newSystem, 
        uint8 _newCoords,
        uint distance
    ) 
        internal
    {
        var mover = shipRegistry[_shipID];
        shipActivity(mover.system, mover.coords, _shipID);
        if(mover.system != _newSystem) {
          removeShip(mover.system, _shipID);
          insertShip(_newSystem, _shipID);
        }
        mover.move(_newSystem, _newCoords, distance);
        shipActivity(mover.system, mover.coords, _shipID);
    }
    
    function impulse(
        uint _shipID, 
        uint8 _newCoords
    ) 
        onlyshipowner(_shipID) 
    {
        uint distance = 0;
        var mover = shipRegistry[_shipID];
        uint8 curX = mover.coords / 16;
        uint8 newX = _newCoords / 16; 
        int8 xdiff = (int8(curX) - int8(newX));
        if(xdiff < 0) 
            xdiff *= -1;
        uint8 curY = mover.coords / 16;
        uint8 newY = _newCoords / 16; 
        int8 ydiff = (int8(curY) - int8(newY));
        if(ydiff < 0) 
            ydiff *= -1;
        // It's not really worth it to do the pythagorean formula here.
        distance = uint(xdiff + ydiff);
        moveShip(_shipID, mover.system, _newCoords, distance);
    }
    
    function jump(uint _shipID, uint8 destCoords) onlyshipowner(_shipID) {
        var mover = shipRegistry[_shipID];
        uint8 homeCoords = mover.coords;
        bytes32 dest = galacticMap[mover.system].Wormholes[homeCoords];
        if(dest == 0x0) 
            throw; // Sir, there's no wormhole here.
        var destSystem = galacticMap[dest];
        if(destSystem.Wormholes[destCoords] != mover.system)
            throw; // YOU SHOULD HAVE TAKEN THAT META-LEFT TURN!
        moveShip(_shipID, dest, destCoords, 1);
    }
    
    function canMine(uint _shipID, uint16 diff) constant returns (bool) {
        // TODO: Fix multiple mining.
        //return true;
        var ship = shipRegistry[_shipID];
        var sector = galacticMap[ship.system].map[ship.coords];
        return ((uint(sha3(_shipID, (block.blockhash(block.number -1)))) % diff) == 0);
    }
    
    function mine(uint _shipID) onlyshipowner(_shipID) {
        var ship = shipRegistry[_shipID];
        ship.genericAction(8);
        var sector = galacticMap[ship.system].map[ship.coords];
        uint st = uint(sector);
        uint16 diff;
        if(st == 0) {
            throw; // Yes, sir, we'll start loading up that empty vacuum.
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
            ship.refreshMassRatio();
            shipActivity(ship.system, ship.coords, _shipID);
            if(st > 3) {
                if(st < 7) {
                    galacticMap[ship.system].map[ship.coords] = SectorType(st - 3);
                } else {
                    galacticMap[ship.system].map[ship.coords] = SectorType.Empty;
                }
            }
        } else {
            throw; // It was here a moment ago, I swear!
        }
    }
    
    function upgrade(uint _shipID, uint8 cargoType) onlyshipowner(_shipID) {
        var ship = shipRegistry[_shipID];
        var sector = galacticMap[ship.system].map[ship.coords];
        var system = galacticMap[ship.system];
        ship.genericAction(1);
        if(sector != SectorType.Planet)
            throw; // What are you upgrading (with?)
        if(ship.cargo[cargoType] == 0)
            throw; // Sir, I'm pretty sure that's an empty cargo pod.
        if(cargoType > 5) {
            throw; // I don't think that will help.
        } else if(cargoType > 2) {
            system.techLevels[cargoType - 3]++;
        } else if(cargoType == 2) {
            ship.eng += (1 + system.techLevels[2]);
        } else if(cargoType == 1) {
            ship.def += (1 + system.techLevels[1]);
        } else if(cargoType == 0) {
            ship.atk += (1 + system.techLevels[0]);
        }
        ship.cargo[cargoType]--;
        shipActivity(ship.system, ship.coords, _shipID);
        ship.refreshMassRatio();
    }
    
    // Because I seriously don't want to mine while testing.
    function cheatCargo(uint _shipID, uint8 cargoType) {
        var ship = shipRegistry[_shipID];
        ship.cargo[cargoType]++;
        ship.refreshMassRatio();
        shipActivity(ship.system, ship.coords, _shipID);        
    }

    function transferShip(uint _shipID, address _newOwner) 
        onlyshipowner(_shipID) // THAT'S NOT YOURS TO BEGIN WITH!
    {
        var ship = shipRegistry[_shipID];
        ship.transferOwnership(_newOwner);
        // It's potentially important to you if some third party changes
        // a ship's ownership.
        shipActivity(ship.system, ship.coords, _shipID);        
    }
    
    function attack(uint _shipID, uint _targetID) onlyshipowner(_shipID) {
        var ship = shipRegistry[_shipID];
        var target = shipRegistry[_targetID];
        if((ship.system == target.system) && 
           (ship.coords == target.coords)
        ) {
            ship.attack(target);
            shipActivity(ship.system, ship.coords, _shipID);
        } else {
            throw; // Sir, our weapons don't shoot THAT far. 
        }
    }
    
    function createWormhole(
        uint _shipID,         
        bytes32 _to, 
        uint8 _toCoords
    )
        onlyshipowner(_shipID)
    {
        var ship = shipRegistry[_shipID];
        if(ship.cargo[6] == 0)
            throw; // No unobtanium, no FTL.
        ship.genericAction(16);
        ship.cargo[6]--;
        createLink(ship.system, ship.coords, _to, _toCoords);
        shipActivity(ship.system, ship.coords, _shipID);
    }
}
