export class BaseSuiEventModel {
  public txDigest: string;

  public eventSeq: string;

  public packageId: string;

  public transactionModule: string;

  public sender: string;

  public type: string;

  public timestamp: number;

  constructor(event: any, timestamp: number) {
    this.txDigest = event.id.txDigest;
    this.eventSeq = event.id.eventSeq;
    this.packageId = event.packageId;
    this.transactionModule = event.transactionModule;
    this.sender = event.sender;
    this.type = event.type;
    this.timestamp = timestamp;
  }
}

export class UserCreatedSuiEventModel extends BaseSuiEventModel {
  public userId: string;

  constructor(event: any, timestamp: number) {
    super(event, timestamp);
    this.userId = event.parsedJson.userId;
  }
}

export class UserUpdatedSuiEventModel extends BaseSuiEventModel {
  public userId: string;

  constructor(event: any, timestamp: number) {
    super(event, timestamp);
    this.userId = event.parsedJson.userId;
  }
}

export class CommunityCreatedSuiEventModel extends BaseSuiEventModel {
  public userId: string;

  public communityId: string;

  constructor(event: any, timestamp: number) {
    super(event, timestamp);
    this.userId = event.parsedJson.userId;
    this.communityId = event.parsedJson.communityId;
  }
}

export class CommunityUpdatedSuiEventModel extends BaseSuiEventModel {
  public userId: string;

  public communityId: string;

  constructor(event: any, timestamp: number) {
    super(event, timestamp);
    this.userId = event.parsedJson.userId;
    this.communityId = event.parsedJson.communityId;
  }
}

export class TagCreatedSuiEventModel extends BaseSuiEventModel {
  public userId: string;

  public communityId: string;

  public tagId: number;

  constructor(event: any, timestamp: number) {
    super(event, timestamp);
    this.userId = event.parsedJson.userId;
    this.communityId = event.parsedJson.communityId;
    this.tagId = event.parsedJson.tagId;
  }
}

export class TagUpdatedSuiEventModel extends BaseSuiEventModel {
  public userId: string;

  public communityId: string;

  public tagId: number;

  constructor(event: any, timestamp: number) {
    super(event, timestamp);
    this.userId = event.parsedJson.userId;
    this.communityId = event.parsedJson.communityId;
    this.tagId = event.parsedJson.tagId;
  }
}
