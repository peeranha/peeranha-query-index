CREATE TABLE IF NOT EXISTS network (
  id INT PRIMARY KEY,
  name VARCHAR(20) NOT NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user (
  id VARCHAR(66) PRIMARY KEY,
  displayName VARCHAR(20),
  postCount INT DEFAULT 0,
  replyCount INT DEFAULT 0,
  company VARCHAR(20),
  position VARCHAR(20),
  location VARCHAR(20),
  about TEXT,
  avatar TEXT,
  creationTime INT NOT NULL,
  ipfsHash VARCHAR(66),
  ipfsHash2 VARCHAR(66),
  networkId INT NOT NULL,

  FOREIGN KEY (networkId) REFERENCES network (id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS community (
  id VARCHAR(66) PRIMARY KEY,
  name VARCHAR(20),
  description VARCHAR(250),
  website VARCHAR(250),
  communitySite VARCHAR(100),
  language VARCHAR(20),
  avatar TEXT,
  isFrozen BOOLEAN DEFAULT 0,
  creationTime INT NOT NULL,
  postCount INT DEFAULT 0,
  documentationCount INT DEFAULT 0,
  deletedPostCount INT DEFAULT 0,
  replyCount INT DEFAULT 0,
  tagsCount SMALLINT DEFAULT 0,
  followingUsers INT DEFAULT 0,
  ipfsHash VARCHAR(66),
  ipfsHash2 VARCHAR(66),
  networkId INT NOT NULL,

  FOREIGN KEY (networkId) REFERENCES network (id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS usercommunity (
  id VARCHAR(133) PRIMARY KEY,
  userId VARCHAR(66) NOT NULL,
  communityId VARCHAR(66) NOT NULL,

  FOREIGN KEY (userId) REFERENCES user (id),
  FOREIGN KEY (communityId) REFERENCES community (id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS userpermission (
  id VARCHAR(133) PRIMARY KEY,
  userId VARCHAR(66) NOT NULL,
  permission VARCHAR(66) NOT NULL,

  FOREIGN KEY (userId) REFERENCES user (id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS usercommunityrating (
  id VARCHAR(133) PRIMARY KEY,
  communityId VARCHAR(66) NOT NULL,
  rating INT,
  userId VARCHAR(66) NOT NULL,

  FOREIGN KEY (communityId) REFERENCES community (id),
  FOREIGN KEY (userId) REFERENCES user (id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tag (
  id VARCHAR(71) PRIMARY KEY,
  communityId VARCHAR(66) NOT NULL,
  name VARCHAR(25) NOT NULL,
  description TEXT,
  postCount INT DEFAULT 0,
  deletedPostCount INT DEFAULT 0,
  language INT,
  ipfsHash VARCHAR(66),
  ipfsHash2 VARCHAR(66),

  FOREIGN KEY (communityId) REFERENCES community (id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS post (
  id VARCHAR(66) PRIMARY KEY,
  id2 VARCHAR(66),
  ipfsHash VARCHAR(66),
  ipfsHash2 VARCHAR(66),
  postType TINYINT NOT NULL,
  author VARCHAR(66) NOT NULL,
  rating INT DEFAULT 0,
  postTime INT,
  lastMod INT,
  communityId VARCHAR(66) NOT NULL,
  title VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  postContent TEXT NOT NULL,
  commentCount SMALLINT DEFAULT 0,
  replyCount INT DEFAULT 0,
  isDeleted BOOLEAN DEFAULT 0,
  officialReply VARCHAR(74) DEFAULT '0-0',
  bestReply VARCHAR(74) DEFAULT '0-0',
  language INT,
  handle VARCHAR(66),
  messengerType INT,

  FOREIGN KEY (author) REFERENCES user (id),
  FOREIGN KEY (communityId) REFERENCES community (id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS posttag (
  id VARCHAR(138) PRIMARY KEY,
  postId VARCHAR(66) NOT NULL,
  tagId VARCHAR(71) NOT NULL,

  FOREIGN KEY (postId) REFERENCES post (id),
  FOREIGN KEY (tagId) REFERENCES tag (id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reply (
  id VARCHAR(74) PRIMARY KEY,
  id2 VARCHAR(66),
  ipfsHash VARCHAR(66),
  ipfsHash2 VARCHAR(66),
  author VARCHAR(66) NOT NULL,
  rating INT DEFAULT 0,
  postTime INT NOT NULL,
  postId VARCHAR(66) NOT NULL,
  parentReplyId VARCHAR(74) NOT NULL,
  content TEXT NOT NULL,
  commentCount SMALLINT DEFAULT 0,
  isDeleted BOOLEAN DEFAULT 0,
  isOfficialReply BOOLEAN DEFAULT 0,
  isBestReply BOOLEAN DEFAULT 0,
  isFirstReply BOOLEAN DEFAULT 0,
  isQuickReply BOOLEAN DEFAULT 0,
  language INT,
  handle VARCHAR(66),
  messengerType INT,

  FOREIGN KEY (author) REFERENCES user (id),
  FOREIGN KEY (postId) REFERENCES post (id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS comment (
  id VARCHAR(78) PRIMARY KEY,
  id2 VARCHAR(66),
  ipfsHash VARCHAR(66),
  ipfsHash2 VARCHAR(66),
  author VARCHAR(66) NOT NULL,
  rating INT DEFAULT 0,
  postTime INT NOT NULL,
  postId VARCHAR(66) NOT NULL,
  parentReplyId VARCHAR(74),
  content TEXT NOT NULL,
  language INT,
  isDeleted BOOLEAN DEFAULT 0,

  FOREIGN KEY (author) REFERENCES user (id),
  FOREIGN KEY (postId) REFERENCES post (id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS achievement (
  id INT PRIMARY KEY,
  factCount INT,
  maxCount INT,
  achievementURI VARCHAR(66),
  achievementsType INT,
  lowerValue INT,
  name VARCHAR(30),
  description VARCHAR(250),
  image VARCHAR(66),
  communityId VARCHAR(66),
  attrcommunityId VARCHAR(66),
  attrEvent VARCHAR(50),
  attrType VARCHAR(20)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS userachievement (
  id VARCHAR(74) PRIMARY KEY,
  userId VARCHAR(66) NOT NULL,
  achievementId INT NOT NULL,

  FOREIGN KEY (userId) REFERENCES user (id),
  FOREIGN KEY (achievementId) REFERENCES achievement (id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS period (
  id INT PRIMARY KEY,
  startPeriodTime INT NOT NULL,
  endPeriodTime INT NOT NULL,
  isFinished BOOLEAN NOT NULL DEFAULT 0
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS userreward (
  id VARCHAR(84) PRIMARY KEY,
  periodId INT NOT NULL,
  userId VARCHAR(66) NOT NULL,
  tokenToReward VARCHAR(40) NOT NULL,
  isPaid BOOLEAN DEFAULT 0,

  FOREIGN KEY (periodId) REFERENCES period (id),
  FOREIGN KEY (userId) REFERENCES user (id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS contractinfo (
  id VARCHAR(66) PRIMARY KEY,
  deployTime INT NOT NULL,
  periodLength INT NOT NULL,
  lastUpdatePeriod INT
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS history (
  id VARCHAR(66) PRIMARY KEY,
  transactionHash VARCHAR(66) NOT NULL,
  postId VARCHAR(66) NOT NULL,
  replyId VARCHAR(133),
  commentId VARCHAR(200),
  eventEntity VARCHAR(15),
  eventName VARCHAR(15),
  actionUser VARCHAR(66) NOT NULL,
  timeStamp INT NOT NULL,
  networkId INT NOT NULL,

  FOREIGN KEY (postId) REFERENCES post (id),
  FOREIGN KEY (actionUser) REFERENCES user (id),
  FOREIGN KEY (networkId) REFERENCES network (id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS communitydocumentation (
  id VARCHAR(66) PRIMARY KEY,
  documentationJSON TEXT,
  ipfsHash VARCHAR(66),

  FOREIGN KEY (id) REFERENCES community (id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS communitytranslation (
  id VARCHAR(70) PRIMARY KEY,
  communityId VARCHAR(66) NOT NULL,
  name VARCHAR(40),
  description VARCHAR(250),
  language VARCHAR(5),
  enableAutotranslation BOOLEAN,

  FOREIGN KEY (communityId) REFERENCES community (id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tagtranslation (
  id VARCHAR(75) PRIMARY KEY,
  tagId VARCHAR(71) NOT NULL,
  name VARCHAR(40) NOT NULL,
  description TEXT,
  language INT,

  FOREIGN KEY (tagId) REFERENCES tag (id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS posttranslation (
  id VARCHAR(70) PRIMARY KEY,
  postId VARCHAR(66) NOT NULL,
  language INT,
  author VARCHAR(66) NOT NULL,
  ipfsHash VARCHAR(66),
  title VARCHAR(130) NOT NULL,
  content TEXT,

  FOREIGN KEY (postId) REFERENCES post (id),
  FOREIGN KEY (author) REFERENCES user (id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS replytranslation (
  id VARCHAR(74) PRIMARY KEY,
  replyId VARCHAR(74) NOT NULL,
  language INT,
  author VARCHAR(66) NOT NULL,
  ipfsHash VARCHAR(66),
  content TEXT,

  FOREIGN KEY (replyId) REFERENCES reply (id),
  FOREIGN KEY (author) REFERENCES user (id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS commenttranslation (
  id VARCHAR(82) PRIMARY KEY,
  commentId VARCHAR(78) NOT NULL,
  language INT,
  author VARCHAR(66) NOT NULL,
  ipfsHash VARCHAR(66),
  content TEXT,

  FOREIGN KEY (commentId) REFERENCES comment (id),
  FOREIGN KEY (author) REFERENCES user (id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS postvotehistory (
  id VARCHAR(133) PRIMARY KEY,
  postId VARCHAR(66) NOT NULL,
  direction INT,
  userId VARCHAR(66) NOT NULL,

  FOREIGN KEY (postId) REFERENCES post (id),
  FOREIGN KEY (userId) REFERENCES user (id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS replyvotehistory (
  id VARCHAR(141) PRIMARY KEY,
  replyId VARCHAR(74) NOT NULL,
  direction INT,
  userId VARCHAR(66) NOT NULL,

  FOREIGN KEY (replyId) REFERENCES reply (id),
  FOREIGN KEY (userId) REFERENCES user (id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
