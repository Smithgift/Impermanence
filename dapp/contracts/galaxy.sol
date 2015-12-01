///@title The Impermance of Space; Galaxy Contract.
contract Galaxy {
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
    }
    
    System[] public galacticMap;
    
    // And now for a zillion helper functions. Recursive structs and 
    // getters do not mix. The good news is that calls are free.
    
    function Galaxy() {
        // This is a kludge to get the address of the Galaxy.
        log0("A new galaxy is born!");
    }
    
    function getSector(uint s, uint8 x, uint8 y) 
        constant 
        public 
        returns(SectorType) 
    {
        return galacticMap[s].map[x][y].st;
    }
    
    function addSystem(string _name) {
        // Hack alert!
        System newSystem = galacticMap[galacticMap.length++];
        newSystem.name = _name;
        //galacticMap.push(newSystem);
    }
}