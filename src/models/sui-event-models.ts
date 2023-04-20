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