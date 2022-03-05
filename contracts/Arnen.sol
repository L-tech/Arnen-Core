//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "./Contents.sol";

contract Arnen is ERC721URIStorage, Ownable, VRFConsumerBase {
    address private contentAddress;
    bool public saleIsActive = true;
    mapping(address => uint256[]) public holderTokendIds;
    struct TokenHolder {
        address holderAddress;
        uint256 tokenId;
        uint256 txTime;
        bool isTokenHolder;
        bool active;
        uint256 mode;
        uint256 validity;
    }
    mapping(address => TokenHolder) public tokenHolders;
    address[] public holderAddresses;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    enum Mode {
        Time,
        Activity
    }
    Mode public nftMode;
    uint256 public mintPricePerDay = 280000000000000;
    uint256 public totalAmountTipped = 0;
    bytes32 internal keyHash;
    uint256 internal fee;
    uint256 public randomResult;
    event Tipped(address indexed _address, uint256 _amount);
    event SentTipped(
        address indexed _beneficiary,
        uint256 _amount,
        bytes _data
    );
    event CreatorPaid(
        address indexed _beneficiary,
        uint256 _amount,
        uint256 _time
    );

    constructor(address _addr)
        payable
        ERC721("ARNEN", "ARN")
        VRFConsumerBase(
            0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B, // VRF Coordinator
            0x01BE23585060835E02B77ef475b0Cc51aA1e0709 // LINK Token
        )
    {
        _tokenIds.increment();
        keyHash = 0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311;
        fee = 0.2 * 10**18; // 0.1 LINK (Varies by network)
        contentAddress = _addr;
    }

    function checkTokenHolder() public view returns (bool) {
        return tokenHolders[msg.sender].isTokenHolder;
    }

    function checkTokenValidity() public view returns (bool status) {
        status = tokenHolders[msg.sender].active;
    }

    function openNFTSale() public onlyOwner {
        saleIsActive = true;
    }

    function closeSale() public onlyOwner {
        saleIsActive = false;
    }

    function getTokenHoldersCount() public view returns (uint256) {
        return holderAddresses.length;
    }

    function mint(
        uint256 _validity,
        Mode _mode,
        string memory tokenURI
    ) public payable {
        require(saleIsActive, "Sale Closed");
        nftMode = _mode;
        if (uint256(nftMode) == 0) {
            require(
                msg.value >= mintPricePerDay * _validity,
                "Insufficient Funds"
            );
            _safeMint(msg.sender, _tokenIds.current());
            _setTokenURI(_tokenIds.current(), tokenURI);
            tokenHolders[msg.sender].holderAddress = msg.sender;
            tokenHolders[msg.sender].tokenId = _tokenIds.current();
            tokenHolders[msg.sender].txTime = block.timestamp;
            tokenHolders[msg.sender].isTokenHolder = true;
            holderAddresses.push(msg.sender);
            _tokenIds.increment();
        } else if (uint256(nftMode) == 1) {
            require(
                msg.value >= 1700000000000000 * _validity,
                "Insufficient Funds"
            );
            _safeMint(msg.sender, _tokenIds.current());
            _setTokenURI(_tokenIds.current(), tokenURI);
            tokenHolders[msg.sender].holderAddress = msg.sender;
            tokenHolders[msg.sender].tokenId = _tokenIds.current();
            tokenHolders[msg.sender].txTime = block.timestamp;
            tokenHolders[msg.sender].isTokenHolder = true;
            holderAddresses.push(msg.sender);
            _tokenIds.increment();
        }

        distributeValue(msg.value);
    }

    function renewNft(
        uint256 _validity,
        Mode _mode,
        string memory tokenURI
    ) public payable {
        require(saleIsActive, "Closed");
        nftMode = _mode;
        if (!checkTokenHolder()) revert("No NFT");
        uint256 userTokenId = tokenHolders[msg.sender].tokenId;
        if (uint256(nftMode) == 0) {
            require(
                msg.value >= mintPricePerDay * _validity,
                "Insufficient Funds"
            );
            _safeMint(msg.sender, userTokenId);
            _setTokenURI(userTokenId, tokenURI);
            _tokenIds.increment();
        } else if (uint256(nftMode) == 1) {
            require(
                msg.value >= 1700000000000000 * _validity,
                "Insufficient Funds"
            );
            _safeMint(msg.sender, userTokenId);
            _setTokenURI(userTokenId, tokenURI);
        }
        distributeValue(msg.value);
    }

    // update - change NFT validity after 24 hours for Time based and after a click for activity baseed NFT

    function tipPlatform() public payable returns (bool) {
        require(msg.value >= 350000000000000, "below minimum tip");
        totalAmountTipped += msg.value;
        emit Tipped(msg.sender, msg.value);
        return true;
    }

    function tipCreator(address _address) public payable returns (bool) {
        address payable creatorAddress = payable(_address);
        require(msg.value > 0, "Add Tip");
        (bool success, ) = creatorAddress.call{value: msg.value}("");
        emit Tipped(msg.sender, msg.value);
        return success;
    }

    function getRandomNumber() public returns (bytes32 requestId) {
        require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK");
        return requestRandomness(keyHash, fee);
    }

    /**
     * Callback function used by VRF Coordinator
     */
    function fulfillRandomness(bytes32 requestId, uint256 randomness)
        internal
        override
    {
        randomResult = ((randomness % getTokenHoldersCount()) - 1) + 1;
    }

    function distributeTip() public payable onlyOwner {
        // This returns a boolean value indicating success or failure.
        require(msg.value <= totalAmountTipped, "Insuffiecient Amount");
        address payable beneficiary = payable(holderAddresses[randomResult]);
        uint256 beneficiaryAmount = (30 * msg.value) / 100;
        (bool sent, bytes memory data) = beneficiary.call{
            value: beneficiaryAmount
        }("");
        totalAmountTipped -= msg.value;
        payable(owner()).transfer(msg.value - beneficiaryAmount);
        emit SentTipped(beneficiary, beneficiaryAmount, data);
        require(sent, "Failed");
    }

    function distributeValue(uint256 _amount) private {
        Contents instanceContnet = Contents(contentAddress);
        (
            uint256 amountPerCreator,
            address[] memory eligibleCreators
        ) = instanceContnet.getEligibleCreators(_amount);
        for (uint256 i = 0; i < eligibleCreators.length; i++) {
            address payable creatorAddress = payable(eligibleCreators[i]);
            (bool sent, ) = eligibleCreators[i].call{value: amountPerCreator}(
                ""
            );
            require(sent, "Failed to send Ether");
            emit CreatorPaid(creatorAddress, amountPerCreator, block.timestamp);
        }
    }

    function updateNftValidity() public onlyOwner {
        uint256 validity = tokenHolders[msg.sender].validity;
        if (tokenHolders[msg.sender].mode == 0) {
            uint256 diff = block.timestamp - tokenHolders[msg.sender].txTime;
            diff = diff / 86400;
            if (diff >= validity) {
                tokenHolders[msg.sender].validity = 0;
                tokenHolders[msg.sender].active = false;
            } else {
                tokenHolders[msg.sender].validity = validity - diff;
            }
        } else if (tokenHolders[msg.sender].mode == 1) {
            tokenHolders[msg.sender].validity -= 1;
            if (tokenHolders[msg.sender].validity == 0) {
                tokenHolders[msg.sender].active = false;
            }
        }
        tokenHolders[msg.sender].txTime = block.timestamp;
    }

    function getTokenHolder() external view returns (TokenHolder memory) {
        TokenHolder storage lTokenHolder = tokenHolders[msg.sender];
        return lTokenHolder;
    }

    receive() external payable {}

    fallback() external payable {}
}
