export class Post {
  id: string;

  postType: number;

  author: string;

  rating: number;

  postTime: number;

  communityId: string;

  officialReply: string;

  bestReply: string;

  propertyCount: number;

  commentCount: number;

  replyCount: number;

  deletedReplyCount: number;

  isDeleted: boolean;

  tags: number[];

  ipfsDoc: [string, string];

  constructor(post: any) {
    this.id = post.id;
    this.postType = post.postType;
    this.author = post.author;
    this.rating = post.rating;
    this.postTime = post.postTime;
    this.communityId = String(post.communityId);
    this.officialReply = String(post.officialReply);
    this.bestReply = String(post.bestReply);
    this.propertyCount = post.propertyCount;
    this.commentCount = post.commentCount;
    this.replyCount = post.replyCount;
    this.deletedReplyCount = post.deletedReplyCount;
    this.isDeleted = post.isDeleted;
    this.tags = post.tags;
    this.ipfsDoc = post.ipfsDoc;
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
