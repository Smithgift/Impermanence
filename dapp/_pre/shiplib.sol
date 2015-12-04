///@title The Impermanence of Space: Ship Library contract.
library ShipLib {
    enum CargoType {
        AtkRock,
        DefRock,
        EngRock,
        UnobOrb,
        AtkTech,
        DefTech,
        EngTech
    }
    
    struct Cargo {
        CargoType ct;
        uint amount;
        byte originZone; //Why not?
    }
    
    struct Ship {
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
        uint damage;
        uint massRatio;
        Cargo[] cargo;
        string name;
    }
    
    function getEnergy(Ship storage self) constant returns (uint8) {
        uint baseEnergy = uint(self.energy) + (now - self.lastRefreshed);
        if(baseEnergy > 255) {
            return 255;
        } else {
            return uint8(baseEnergy);
        }
    }
    
    function refreshEnergy(Ship storage self) {
        self.energy = getEnergy(self);
        self.lastRefreshed = now;
    }
    
    function refreshMassRatio(Ship storage self) {
        uint mass = self.atk + self.def + self.eng;
        for(uint i = 0; i < self.cargo.length; i++) {
            mass += self.cargo[i].amount;
        }
        self.massRatio = mass / self.eng;
        if(self.massRatio == 0)
            self.massRatio = 1; // No photon-based ships, please.
    }
    
    modifier act(Ship storage self, uint effort) {
        if(!self.exists)
            throw; // IT'S THE ORBITING DUTCHMAN!
        refreshEnergy(self);
        if((self.massRatio * effort) > uint(self.energy))
            throw;
        // The following conversion is safe, because if massRatio was 
        // greater than 255, we'd just have thrown.
        self.energy -= uint8(self.massRatio * effort);
        _
    }
    
    function transferOwnership(Ship storage self, address _newOwner) {
        self.owner = _newOwner;
    }
    
    function move(
        Ship storage self, 
        bytes32 _newSystem, 
        uint8 _newX, 
        uint8 _newY, 
        uint8 distance
    ) act(self, distance) {
        self.currentSystem = _newSystem;
        self.x = _newX;
        self.y = _newY;
    }
    
    function attack(Ship storage self, Ship storage target) act(self, 1) {
        if(self.owner == target.owner)
            throw; // I'm sure this would be amusing. Once.
        self.damage += target.atk;
        if(self.damage >= self.def)
            throw; // The attack will bring nothing good.
        target.damage += self.atk;
        if(target.damage >= target.def) {
            target.exists = false;
        }
    }
    
    function restoreHP(Ship storage self) {
        self.damage = 0;
    }
}