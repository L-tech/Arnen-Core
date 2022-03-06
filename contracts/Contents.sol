//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract Contents {
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
    struct Stream {
        string title;
        uint creatorId;
        string playbackUrl;

    }
    event NewContent(uint indexed _creatorId, string _title, uint _timestamp);
    event NewCreator(uint indexed _creatorId);
    event NewStream(uint indexed _creatorId, string _title, uint _timestamp);
    mapping(uint => Content) public contents;
    uint private contentIndex = 0;
    mapping(uint => ContentCreator) public creators;
    uint private creatorIndex = 0;
    mapping(uint => Stream) public streams;
    uint private streamIndex = 0;

    function viewContents() external view returns(Content[] memory ) {
        Content[] memory lContents = new Content[](contentIndex);
        for (uint i = 0; i < contentIndex; i++) {
            Content storage lContent = contents[i];
            lContents[i] = lContent;
        }
        return lContents;
    }

    function getContent(uint _id) external view returns(Content memory) {
        require(_id < contentIndex, "Invalid");
        Content storage lContent = contents[_id];
        return lContent;
    }

    function addCreator(string memory _name, string memory _niche, string memory _avater) external returns (uint) {
        ContentCreator storage newCreator = creators[creatorIndex];
        newCreator.creatorName = _name;
        newCreator.avatar = _avater;
        newCreator.niche = _niche;
        newCreator.creatorAddress = msg.sender;
        newCreator.id = creatorIndex;
        creatorIndex += 1;
        return creatorIndex;
    }
    function getEligibleCreators(uint _amount) external view returns(uint, address[] memory) {
        uint256 amount = _amount;
        address[] memory eligibleCreators;
        for (uint i = 0; i < creatorIndex; i++) {
            if(creators[i].contentCount > 0) {
                eligibleCreators[i] = (creators[i].creatorAddress);
            }
        }
        uint amountPerCreator = (amount * 95 / 100) / eligibleCreators.length;
        return (amountPerCreator, eligibleCreators);
    }
    function addContent(string memory _title, string memory _image, string memory _text) external {
        Content storage newContent = contents[contentIndex];
        newContent.creatorId = getCreator().id;
        newContent.title = _title;
        newContent.image = _image;
        newContent.text = _text;
        contentIndex += 1;
        emit NewContent(newContent.creatorId, newContent.title, block.timestamp);
    }
    function getCreator() public view returns(ContentCreator memory _creator) {
        for(uint i = 0; i < creatorIndex; i++) {
            if(creators[i].creatorAddress == msg.sender) {
                return creators[i];
            }
        }
    }
    function addStream(string memory _title, string memory _playbackUrl) external {
        Stream storage newStream = streams[streamIndex];
        newStream.creatorId = getCreator().id;
        newStream.title = _title;
        newStream.playbackUrl = _playbackUrl;
        streamIndex += 1;
        emit NewStream(newStream.creatorId, newStream.title, block.timestamp);
    }
    
    function getStreams() public view returns(Stream[] memory) {
        Stream[] memory lStreams = new Stream[](streamIndex);
        for (uint i = 0; i < streamIndex; i++) {
            Stream storage lStream = streams[i];
            lStreams[i] = lStream;
        }
        return lStreams;
    }
}