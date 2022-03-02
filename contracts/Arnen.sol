//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "./utils/Base64.sol";

contract Arnen is ERC721URIStorage, Ownable, VRFConsumerBase {
    bool public saleIsActive;
    mapping(address => uint256[]) public holderTokendIds;
    struct TokenHolder {
        address holderAddress;
        uint tokenId;
        uint txTime;
        bool isTokenHolder;
        bool active;
    }
    struct ContentCreator {
        uint id;
        address creatorAddress;
        string creatorName;
        string niche;
        string avatar;
        uint contentCount;
    }
    struct Content {
        string title;
        string image;
        string text;
        uint creatorId;
    }
    mapping(uint => Content) public contents;
    uint private contentIndex;
    uint private creatorIndex;
    mapping(address => ContentCreator) public creators;
    mapping(address => TokenHolder) public tokenHolders;
    address[] public holderAddresses;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    enum Mode {
        Time,
        Activity
    }
    Mode public nftMode;
    uint public minTip = 350000000000000;
    uint public mintPricePerDay = 280000000000000; 
    uint public mintPricePerActivity = 1700000000000000; // 1.7 Matic tokens
    uint public totalAmountTipped = 0; 
    bytes32 internal keyHash;
    uint256 internal fee;
    uint256 public randomResult;
    event Tipped(address indexed _address, uint256 _amount);
    event SentTipped(address indexed _beneficiary, uint _amount, bytes _data);


    constructor() ERC721("ARNEN", "ARN") VRFConsumerBase(
            0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B, // VRF Coordinator
            0x01BE23585060835E02B77ef475b0Cc51aA1e0709  // LINK Token
        ) payable {
        _tokenIds.increment();
        keyHash = 0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311;
        fee = 0.2 * 10 ** 18; // 0.1 LINK (Varies by network)
    }

    function addCreator(string memory _name, string memory _niche, string memory _avater) external returns (uint) {
        ContentCreator storage newCreator = creators[msg.sender];
        newCreator.creatorName = _name;
        newCreator.avatar = _avater;
        newCreator.niche = _niche;
        newCreator.creatorAddress = msg.sender;
        newCreator.id = creatorIndex;
        creatorIndex += 1;
        return creatorIndex;
    }

    function checkTokenHolder(address _address) public view returns(bool) {
        return tokenHolders[_address].isTokenHolder;
    }
    function checkTokenValidity(address _address) public view returns(string memory) {
        uint tokenId = tokenHolders[_address].tokenId;
        return tokenURI(tokenId);
    }
    function openNFTSale() public onlyOwner {
        saleIsActive = true;
    }
    function closeSale() public onlyOwner {
        saleIsActive = false;
    }
    function getTokenHoldersCount() public view returns(uint) {
        return holderAddresses.length;
    }
    function mint(uint256 _validity, Mode _mode, string memory tokenURI) public payable {
        require(saleIsActive, "Sale Closed");
        nftMode = _mode;
        if(uint256(nftMode) == 0) {
            require(msg.value >= mintPricePerDay * _validity, "Insufficient Funds");
            _safeMint(msg.sender, _tokenIds.current());
            _setTokenURI(_tokenIds.current(), tokenURI);
            tokenHolders[msg.sender].holderAddress= msg.sender;
            tokenHolders[msg.sender].tokenId= _tokenIds.current();
            tokenHolders[msg.sender].txTime= block.timestamp;
            tokenHolders[msg.sender].isTokenHolder= true;
            holderAddresses.push(msg.sender);
            _tokenIds.increment();
        }
        else if(uint256(nftMode) == 1) {
            require(msg.value >= mintPricePerActivity * _validity, "Insufficient Funds");
            _safeMint(msg.sender, _tokenIds.current());
            _setTokenURI(_tokenIds.current(), tokenURI);
            tokenHolders[msg.sender].holderAddress= msg.sender;
            tokenHolders[msg.sender].tokenId= _tokenIds.current();
            tokenHolders[msg.sender].txTime= block.timestamp;
            tokenHolders[msg.sender].isTokenHolder= true;
            holderAddresses.push(msg.sender);
            _tokenIds.increment();
        }
    }
    function renewNft(uint256 _validity, Mode _mode, string memory tokenURI) public payable {
        require(saleIsActive, "Can't Purchase NFT as at this time");
        nftMode = _mode;
        if(!checkTokenHolder(msg.sender)) revert("No NFT");
        uint userTokenId = tokenHolders[msg.sender].tokenId;
        if(uint256(nftMode) == 0) {
            require(msg.value >= mintPricePerDay * _validity, "Insufficient Funds");
            _safeMint(msg.sender, userTokenId);
            _setTokenURI(userTokenId, tokenURI);
            _tokenIds.increment();
        }
        else if(uint256(nftMode) == 1) {
            require(msg.value >= mintPricePerActivity * _validity, "Insufficient Funds");
            _safeMint(msg.sender, userTokenId);
            _setTokenURI(userTokenId, tokenURI);
        } 
    }
    // update - change NFT validity after 24 hours for Time based and after a click for activity baseed NFT

    function tipPlatform() public payable returns (bool) {
        require(msg.value >= minTip, "Minimum tip is 0.00035");
        totalAmountTipped += msg.value;
        emit Tipped(msg.sender, msg.value);
        return true;
    }

    function tipCreator(address _address) public payable {
        address payable creatorAddress = payable(_address);
        require(msg.value > 0, "Tip cannot be 0");
        (bool success, ) = creatorAddress.call{value: msg.value}("");
        emit Tipped(msg.sender, msg.value);
    }

    function getRandomNumber() public returns (bytes32 requestId) {
        require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK");
        return requestRandomness(keyHash, fee);
    }

    function viewContents() external returns(Content[] memory ) {
        Content[] memory lContents = new Content[](contentIndex);
        for (uint i = 0; i < contentIndex; i++) {
            Content storage lContent = contents[i];
            lContents[i] = lContent;
        }
        return lContents;
    }

    /**
     * Callback function used by VRF Coordinator
     */
    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        randomResult = (randomness % getTokenHoldersCount() - 1) + 1;
    }
    function distributeTip() public onlyOwner payable {
        // This returns a boolean value indicating success or failure.
        require(msg.value <= totalAmountTipped, "Insuffiecient Amount");
        address payable beneficiary = payable(holderAddresses[randomResult]);
        uint beneficiaryAmount = (30 * msg.value) / 100;
        (bool sent, bytes memory data) = beneficiary.call{value: beneficiaryAmount}("");
        totalAmountTipped -= msg.value;
        payable(owner()).transfer(msg.value - beneficiaryAmount);
        emit SentTipped(beneficiary, beneficiaryAmount, data);
        require(sent, "Failed to send Ether");
    }
    receive() external payable {}
    fallback() external payable {}
}