export class Post {
  postType: number;

  author: string;

  rating: number;

  postTime: number;

  communityId: number;

  officialReply: number;

  bestReply: number;

  propertyCount: number;

  commentCount: number;

  replyCount: number;

  deletedReplyCount: number;

  isDeleted: boolean;

  tags: number[];

  ipfsDoc: any[];

  constructor(post: any) {
    [
      this.postType,
      this.author,
      this.rating,
      this.postTime,
      this.communityId,
      this.officialReply,
      this.bestReply,
      this.propertyCount,
      this.commentCount,
      this.replyCount,
      this.deletedReplyCount,
      this.isDeleted,
      this.tags,
      this.ipfsDoc,
    ] = post;
  }
}

export class PostData extends Post {
  public title: string;

  public content: string;

  constructor(post: any) {
    super(post);
    this.title = post?.title;
    this.content = post?.content;
  }
}
