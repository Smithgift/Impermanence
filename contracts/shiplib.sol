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
    /* Currently nonfunctional
    struct Cargo {
        CargoType ct;
        uint amount;
        byte originZone; //Why not?
    }
    */
    struct Ship {
        bool exists;
        address owner;
        bytes32 system;
        uint8 coords;
        uint energy;
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
        if(baseEnergy > (256 * self.massRatio)) {
            return (256 * self.massRatio);
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
        //log1(bytes32(effort), bytes32(self.energy));
        //_
        //return;
        if((self.massRatio * effort) > self.energy)
            throw;
        self.energy -= (self.massRatio * effort);
        _;
    }

    // TODO: Does this function actually need to exist?
    function transferOwnership(Ship storage self, address _newOwner) {
        self.owner = _newOwner;
    }
    
    function move(
        Ship storage self, 
        bytes32 _newSystem, 
        uint8 _newCoords,
        uint distance
    ) act(self, distance) {
        self.system = _newSystem;
        self.coords = _newCoords;
    }
    
    function attack(Ship storage self, Ship storage target) act(self, 1) {
        if(self.owner == target.owner) {
            throw; // I'm sure this would be amusing. Once.
        }
        self.damage += target.atk;
        if(self.damage >= self.def) {
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
    
    function genericAction(Ship storage self, uint effort) 
      act(self, effort) 
    {
        // Just for some random action you want to spend energy on.
    }
}
