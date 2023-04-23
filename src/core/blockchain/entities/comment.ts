export class Comment {
  ipfsDoc: [string, string];

  author: string;

  rating: number;

  postTime: number;

  propertyCount: number;

  isDeleted: boolean;

  constructor(comment: any) {
    [
      this.ipfsDoc,
      this.author,
      this.rating,
      this.postTime,
      this.propertyCount,
      this.isDeleted,
    ] = comment;
  }
}

export class CommentData extends Comment {
  id2: string;

  content: string;

  constructor(comment: any, extra: any = {}) {
    super(comment);
    this.content = comment?.content;
    this.id2 = extra?.id2;
  }
}
