//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Staketime is Ownable { //is ERC20?
    using SafeMath for uint256;
    uint256 public startingpoint;
    uint256 public period;  
    IERC20 public xyztoken;
    mapping(address => uint256) stakemap;
    address[] internal stakeholders;
    uint256 private _reserveone; 
    uint256 private _reservetwo; 
    uint256 private _reservethree;

    constructor(uint256 _period, address _staketoken, uint256 resone, uint256 restwo, uint256 resthree) {
        uint256 _payload =  resone.add(restwo).add(resthree);
        if (_payload != 1000 * (10 ** 18)) revert("only 1000xyz");
        startingpoint = block.timestamp;
        period = _period;
        _reserveone = resone;
        _reservetwo = restwo;
        _reservethree = resthree;
        xyztoken = IERC20(_staketoken);
        xyztoken.transferFrom(msg.sender, address(this), _payload);
    }

    function totalStakes() public view returns(uint256) {
       uint256 _totalStakes = 0;
       for (uint256 s = 0; s < stakeholders.length; s += 1){
           _totalStakes = _totalStakes.add(stakemap[stakeholders[s]]);
       }
       return _totalStakes;
    }

    function isStakeholder(address _address) private view returns(bool, uint256) {
       for (uint256 s = 0; s < stakeholders.length; s += 1){
           if (_address == stakeholders[s]) return (true, s);
       }
       return (false, 0);
    }

    function addStakeholder(address _stakeholder) private {
       (bool _isStakeholder, ) = isStakeholder(_stakeholder);
       if(!_isStakeholder) stakeholders.push(_stakeholder);
    }

    function mystake () public view returns (uint256) {
        return stakemap[msg.sender];
    }

    function deposit (uint256 ammount) public returns (bool) {
        require(block.timestamp < startingpoint.add(period.mul(1 days)) && ammount > 0);
        if(stakemap[msg.sender] == 0) {
            addStakeholder(msg.sender);
            stakemap[msg.sender] = stakemap[msg.sender].add(ammount);
            xyztoken.transferFrom(msg.sender, address(this), ammount);
            return true;
        } else {
            stakemap[msg.sender] = stakemap[msg.sender].add(ammount);
            xyztoken.transferFrom(msg.sender, address(this), ammount);
            return true;
        }
    }

    function withdrawal () public returns (bool) {
       require(block.timestamp > startingpoint.add(period.mul(2 days)) && stakemap[msg.sender] > 0);
        (bool _isStakeholder, uint256 s) = isStakeholder(msg.sender);
        if(_isStakeholder){

            if (block.timestamp < startingpoint.add(period.mul(3 days))) {
                uint256 stake = mystake();
                uint256 rewardone = stake.mul(_reserveone).div(totalStakes());
                assert(rewardone <= _reserveone);
                delete stakeholders[s];
                delete stakemap[msg.sender];
                _reserveone = _reserveone.sub(rewardone);
                xyztoken.transfer(msg.sender, stake.add(rewardone));
            }
            if (block.timestamp < startingpoint.add(period.mul(4 days))) {
                uint256 stake = mystake();
                uint256 totalstake =  totalStakes(); 
                uint256 rewardone = stake.mul(_reserveone).div(totalstake);
                uint256 rewardtwo = stake.mul(_reservetwo).div(totalstake);
                assert(rewardone <= _reserveone && rewardtwo <= _reservetwo);
                delete stakeholders[s];
                delete stakemap[msg.sender];
                _reserveone = _reserveone.sub(rewardone);
                _reservetwo = _reservetwo.sub(rewardtwo);
                xyztoken.transfer(msg.sender, stake.add(rewardone).add(rewardtwo) );
            }
            if (block.timestamp > startingpoint.add(period.mul(4 days))) {
                uint256 stake = mystake();
                uint256 totalstake =  totalStakes(); 
                uint256 rewardone = stake.mul(_reserveone).div(totalstake);
                uint256 rewardtwo = stake.mul(_reservetwo).div(totalstake);
                uint256 rewardthree = stake.mul(_reservethree).div(totalstake);
                assert(rewardone <= _reserveone && rewardtwo <= _reservetwo && rewardthree <= _reservethree);
                delete stakeholders[s];
                delete stakemap[msg.sender];
                _reserveone = _reserveone.sub(rewardone);
                _reservetwo = _reservetwo.sub(rewardtwo);
                _reservethree = _reservethree.sub(rewardthree);
                xyztoken.transfer(msg.sender, stake.add(rewardone).add(rewardtwo).add(rewardthree));
            }
        } else {
            return false;
        }
        return true;
    }

    function contractbalancexyz () public view returns (uint256) {
        return xyztoken.balanceOf(address(this));
    }

    function close () public onlyOwner returns(bool) {
        require(block.timestamp > startingpoint.add(period.mul(4 days)));
        if (totalStakes() > 0) {
            xyztoken.transferFrom(msg.sender, address(this), 0);
            return true;
        } else {
            // do dopisania
            xyztoken.transfer(msg.sender, xyztoken.balanceOf(address(this)));
            return true;
        }
    }
}
