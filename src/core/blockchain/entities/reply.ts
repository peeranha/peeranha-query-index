export class Reply {
  ipfsDoc: any[];

  author: string;

  rating: number;

  postTime: number;

  parentReplyId: number;

  commentCount: number;

  propertyCount: number;

  isFirstReply: boolean;

  isQuickReply: boolean;

  isDeleted: boolean;

  constructor(reply: any) {
    [
      this.ipfsDoc,
      this.author,
      this.rating,
      this.postTime,
      this.parentReplyId,
      this.commentCount,
      this.propertyCount,
      this.isFirstReply,
      this.isQuickReply,
      this.isDeleted,
    ] = reply;
  }
}

export class ReplyData extends Reply {
  content: string;

  constructor(reply: any) {
    super(reply);
    this.content = reply?.content;
  }
}
