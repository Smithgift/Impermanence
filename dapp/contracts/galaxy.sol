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
        systemAdded(_name, systemHash);
        //galacticMap.push(newSystem);
    }
}