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
        int currentHP;
        uint massRatio;
        Cargo[] cargo;
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
    }
    
    modifier act(Ship storage self) {
        if(!self.exists)
            throw; // IT'S THE ORBITING DUTCHMAN!
        refreshEnergy(self);
        if(self.massRatio > uint(self.energy))
            throw;
        // The following conversion is safe, because if massRatio was 
        // greater than 255, we'd just have thrown.
        self.energy -= uint8(self.massRatio);
        _
    }
    
    function transfer(Ship storage self, address _newOwner) {
        self.owner = _newOwner;
    }
    
    function attack(Ship storage self, Ship storage target) act(self) {
        if(self.owner == target.owner)
            throw; // I'm sure this would be amusing. Once.
        // Hello future coder. If someone somehow got this to wrap around, 
        // I think you have balance problems somewhere.
        self.currentHP -= int(target.atk);
        if(self.currentHP <= 0)
            throw; // The attack will bring nothing good.
        target.currentHP -= int(self.atk);
        if(target.currentHP <= 0) {
            target.exists = false;
        }
    }
}