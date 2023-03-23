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
  content: string;

  constructor(comment: any) {
    super(comment);
    this.content = comment?.content;
  }
}
