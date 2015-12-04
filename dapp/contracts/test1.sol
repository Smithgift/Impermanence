import "std.sol";
import "test2.sol";

contract bar is foo {
    
}

contract sha3test is named("Sha3")
{
    function sha3test() {
        log0(sha3("test"));
    }
}

contract createTest {
    function() {
        new sha3test();
    }
}
