import { BaseEventModel, Network } from 'src/models/event-models';

export enum NotificationsTypes {
  Unknown = 0,
  QuestionUpVoted = 1,
  QuestionDownVoted = 2,
  QuestionUpVoteCanceled = 3,
  QuestionDownVoteCanceled = 4,
  AnswerUpVoted = 5,
  AnswerDownVoted = 6,
  AnswerUpVoteCanceled = 7,
  AnswerDownVoteCanceled = 8,
  AnswerMarkedTheBest = 9,
  QuestionAnswered = 10,
  QuestionCommented = 11,
  AnswerCommented = 12,
  QuestionTipped = 13,
  AnswerTipped = 14,
  PostTypeChanged = 15,
  PostCommunityChanged = 16,
}

export abstract class BaseNotificationEventModel extends BaseEventModel {
  notificationType!: NotificationsTypes;
  protected abstract getType(network: Network): NotificationsTypes;
}

export class ItemVotedSnsEventModel extends BaseNotificationEventModel {
  user: string;

  postId: string;

  replyId: number;

  commentId: number;

  voteDirection: number;

  network: Network;

  constructor(event: any) {
    super(event);
    const args = event.args ?? event;
    this.user = args.user;
    this.postId = args.postId;
    this.replyId = Number(args.replyId);
    this.commentId = Number(args.commentId);
    this.voteDirection = args?.voteDirection;
    this.notificationType = this.getType();
    this.network = event.network;
  }

  protected getType(): NotificationsTypes {
    if (this.voteDirection === 1) {
      return this.replyId === 0
        ? NotificationsTypes.QuestionUpVoted
        : NotificationsTypes.AnswerUpVoted;
    }
    if (this.voteDirection === -1) {
      return this.replyId === 0
        ? NotificationsTypes.QuestionUpVoteCanceled
        : NotificationsTypes.AnswerUpVoteCanceled;
    }
    if (this.voteDirection === 2) {
      return this.replyId === 0
        ? NotificationsTypes.QuestionDownVoted
        : NotificationsTypes.AnswerDownVoted;
    }
    if (this.voteDirection === -2) {
      return this.replyId === 0
        ? NotificationsTypes.QuestionDownVoteCanceled
        : NotificationsTypes.AnswerDownVoteCanceled;
    }
    return NotificationsTypes.Unknown;
  }
}

export class ReplyMarkedTheBestSnsEventModel extends BaseNotificationEventModel {
  user: string;

  postId: string;

  replyId: number;

  network: Network;

  constructor(event: any) {
    super(event);
    const args = event.args ?? event;
    this.user = args.user;
    this.postId = args.postId;
    this.replyId = Number(args.replyId);
    this.notificationType = this.getType();
    this.network = event.network;
  }

  protected getType(): NotificationsTypes {
    return NotificationsTypes.AnswerMarkedTheBest;
  }
}

export class ReplyCreatedSnsEventModel extends BaseNotificationEventModel {
  user: string;

  postId: string;

  parentReplyId: string;

  replyId: number;

  network: Network;

  constructor(event: any) {
    super(event);
    const args = event.args ?? event;
    this.user = args.user;
    this.parentReplyId = args.parentReplyId;
    this.postId = args.postId;
    this.replyId = Number(args.replyId);
    this.notificationType = this.getType();
    this.network = event.network;
  }

  protected getType(): NotificationsTypes {
    return NotificationsTypes.QuestionAnswered;
  }
}

export class CommentCreatedSnsEventModel extends BaseNotificationEventModel {
  user: string;

  postId: string;

  replyId: number;

  commentId: number;

  network: Network;

  constructor(event: any) {
    super(event);
    const args = event.args ?? event;
    this.user = args.user;
    this.postId = args.postId;
    this.replyId = Number(args.parentReplyId); // ~parentReplyId
    this.commentId = Number(args.commentId);
    this.notificationType = this.getType();
    this.network = event.network;
  }

  protected getType(): NotificationsTypes {
    return this.replyId === 0
      ? NotificationsTypes.QuestionCommented
      : NotificationsTypes.AnswerCommented;
  }
}

export class PostTypeChangedSnsEventModel extends BaseNotificationEventModel {
  public user: string;

  public newPostType: number;

  public postId: string;

  public network: Network;

  constructor(event: any) {
    super(event);
    const args = event.args ?? event;
    this.user = args.user;
    this.newPostType = args.newPostType;
    this.postId = args.postId;
    this.notificationType = this.getType();
    this.network = event.network;
  }

  protected getType(): NotificationsTypes {
    return NotificationsTypes.PostTypeChanged;
  }
}

export class ChangePostCommunitySnsEventModel extends BaseNotificationEventModel {
  user: string;

  postId: string;

  oldCommunityId: string;

  network: Network;

  constructor(event: any) {
    super(event);
    const args = event.args ?? event;
    this.user = args.user;
    this.postId = args.postId;
    this.oldCommunityId = args.oldCommunityId;
    this.notificationType = this.getType();
    this.network = event.network;
  }

  protected getType(): NotificationsTypes {
    return NotificationsTypes.PostCommunityChanged;
  }
}
