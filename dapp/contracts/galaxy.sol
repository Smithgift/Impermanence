import "std.sol";

///@title The Impermance of Space; Galaxy Contract.
contract Galaxy is named("Galaxy") {
    enum TechTypes
    {
        Atk,
        Def,
        Eng
    }
    
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
        uint[] localShips;
    }
    
    struct System {
        Sector[15][15] map;
        string name;
        uint[3] techLevels;
        bool exists;
    }
    
    mapping (bytes32 => System) public galacticMap;
    
    // And now for a zillion helper functions. Recursive structs and 
    // getters do not mix. The good news is that calls are free.
    
    function getSector(bytes32 s, uint8 x, uint8 y) 
        constant 
        public 
        returns(SectorType) 
    {
        return galacticMap[s].map[x][y].st;
    }

    function Galaxy() {
        // This is a kludge to get the address of the Galaxy.
        log0("A new galaxy is born!");
    }

    event systemAdded(string indexed _name, bytes32 indexed systemHash);

    function addSystem(string _name) {
        // Hack alert!
        bytes32 systemHash = sha3(_name);
        System newSystem = galacticMap[systemHash];
        newSystem.name = _name;
        newSystem.exists = true;
        generateMap(systemHash);
        systemAdded(_name, systemHash);
        //galacticMap.push(newSystem);
    }
    
    // We want the hash, not a pointer, because we need the hash as a seed.
    function generateMap(bytes32 systemHash) internal {
        System newSystem = galacticMap[systemHash];
        newSystem.map[7][7].st = SectorType.sun;
        bytes32 seed = systemHash;
        uint8 x;
        uint8 y;
        uint8 type;
        for(uint8 i = 0; i < 16; i++) {
            x = seed % 16;
            seed /= 16;
            y = seed % 16;
            seed /= 16;
            type = seed % 16;
            seed /= 256;
            if((x == 16) || (y = 16)) {
                continue; // We're off the map.
            } else {
                Sector chosenSector = newSystem.map[x][y];
                if(chosenSector.st != SectorType.Empty) continue;
                if(type <= 2) {
                    chosenSector.st = SectorType.AtkAsteriod;
                } else if (type <= 5) {
                    chosenSector.st = SectorType.DefAsteriod;
                } else if (type <= 8) {
                    chosenSector.st = SectorType.EngAsteriod;
                } else if (type == 9) {
                    chosenSector.st = SectorType.AtkMonolith;
                } else if (type == 10) {
                    chosenSector.st = SectorType.DefMonolith;
                } else if (type == 11) {
                    chosenSector.st = SectorType.EngMonolith;
                } else if (type <= 13) {
                    chosenSector.st = SectorType.UnobRift;
                } else {
                    chosentSector.st = SectorType.Planet;
                }
            }
        }
    }
}