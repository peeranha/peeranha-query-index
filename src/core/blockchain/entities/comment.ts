export class Comment {
  ipfsDoc: [string, string];

  author: string;

  rating: number;

  postTime: number;

  propertyCount: number;

  language: number;

  isDeleted: boolean;

  constructor(comment: any) {
    this.ipfsDoc = comment.ipfsDoc;
    this.author = comment.author;
    this.rating = comment.rating;
    this.postTime = comment.postTime;
    this.propertyCount = comment.propertyCount;
    this.isDeleted = comment.isDeleted;
    this.language = comment.language;
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
