// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract LegacyVault {
    address public owner;
    mapping(address => bool) public heirs;
    uint256 public unlockTimestamp;
    bool public deceased;
    mapping(bytes32 => string) public fileCidById; // fileId -> off-chain pointer
    mapping(address => bool) public isValidator;

    event ValidatorRegistered(address validator);

    modifier onlyOwner() {
        require(msg.sender == owner, 'Not owner');
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerHeirs(address[] calldata _heirs) external onlyOwner {
        for (uint256 i = 0; i < _heirs.length; i++) {
            heirs[_heirs[i]] = true;
        }
    }

    function setUnlockTimestamp(uint256 ts) external onlyOwner {
        unlockTimestamp = ts;
    }

    function markDeceased() external onlyOwner {
        deceased = true;
    }

    function setFileCid(bytes32 fileId, string calldata cid) external onlyOwner {
        fileCidById[fileId] = cid;
    }

    function registerValidator(address validator) external onlyOwner {
        isValidator[validator] = true;
        emit ValidatorRegistered(validator);
    }

    function canAccess(address user) external view returns (bool) {
        if (!heirs[user]) return false;
        if (deceased) {
            return true;
        }
        if (unlockTimestamp != 0 && block.timestamp >= unlockTimestamp) {
            return true;
        }
        return false;
    }
}
