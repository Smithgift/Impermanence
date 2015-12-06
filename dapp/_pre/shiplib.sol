///@title The Impermanence of Space: Ship Library contract.
library ShipLib {
    enum CargoType {
        AtkRock,
        DefRock,
        EngRock,
        AtkTech,
        DefTech,
        EngTech,
        UnobOrb
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
        uint energy;
        address owner;
        uint lastRefreshed;
        uint atk;
        uint def;
        uint eng;
        uint damage;
        uint massRatio;
        uint[7] cargo;
        string name;
    }
    
    function getEnergy(Ship storage self) constant returns (uint) {
        uint baseEnergy = (self.energy + (now - self.lastRefreshed));
        if(baseEnergy > 255) {
            return 255;
        } else {
            return baseEnergy;
        }
    }
    
    function refreshEnergy(Ship storage self) {
        self.energy = getEnergy(self);
        self.lastRefreshed = now;
    }
    
    function refreshMassRatio(Ship storage self) {
        uint mass = self.atk + self.def + self.eng;
        for(uint i = 0; i < self.cargo.length; i++) {
            mass += self.cargo[i];
        }
        self.massRatio = mass / self.eng;
        if(self.massRatio == 0)
            self.massRatio = 1; // No photon-based ships, please.
    }
    
    modifier act(Ship storage self, uint effort) {
        if(!self.exists)
            throw; // IT'S THE ORBITING DUTCHMAN!
        refreshEnergy(self);
        log1(bytes32(effort), bytes32(self.energy));
        //_
        //return;
        if((self.massRatio * effort) > self.energy)
            throw;
        // The following conversion is safe, because if massRatio was 
        // greater than 255, we'd just have thrown.
        self.energy -= (self.massRatio * effort);
        _
    }
    
    function transferOwnership(Ship storage self, address _newOwner) {
        log0(bytes32(self.owner));
        self.owner = _newOwner;
        log0(bytes32(self.owner));
    }
    
    function move(
        Ship storage self, 
        bytes32 _newSystem, 
        uint8 _newX, 
        uint8 _newY, 
        uint distance
    ) act(self, distance) {
        self.currentSystem = _newSystem;
        self.x = _newX;
        self.y = _newY;
    }
    
    function attack(Ship storage self, Ship storage target) act(self, 1) {
        if(self.owner == target.owner) {
            //log2("Friendly fire.", bytes32(self.owner), bytes32(target.owner));
            //return;
            throw; // I'm sure this would be amusing. Once.
        }
        self.damage += target.atk;
        if(self.damage >= self.def) {
            //log0("Suicidal attack.");
            //return;
            throw; // The attack will bring nothing good.
        }
        target.damage += self.atk;
        if(target.damage >= target.def) {
            target.exists = false;
        }
    }
    
    function restoreHP(Ship storage self) {
        self.damage = 0;
    }
    
    function genericAction(Ship storage self, uint effort) act(self, effort) {
        // Just for some random action you want to spend energy on.
    }
}