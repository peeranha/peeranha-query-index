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

export class ItemVotedEventModel extends BaseNotificationEventModel {
  user: string;

  postId: string;

  replyId: string;

  commentId: string;

  voteDirection: number;

  constructor(event: any) {
    super(event);
    const args = event.args ?? event;
    this.user = args.user;
    this.postId = `${event.network}-${args.postId?.toNumber()}`;
    this.replyId = `${event.network}-${args.replyId}`;
    this.commentId = `${event.network}-${args.commentId}`;
    this.voteDirection = args?.voteDirection;
    this.notificationType = this.getType(event.network);
  }

  protected getType(network: Network): NotificationsTypes {
    if (this.voteDirection === 1) {
      return this.replyId === `${network}-0`
        ? NotificationsTypes.QuestionUpVoted
        : NotificationsTypes.AnswerUpVoted;
    }
    if (this.voteDirection === -1) {
      return this.replyId === `${network}-0`
        ? NotificationsTypes.QuestionUpVoteCanceled
        : NotificationsTypes.AnswerUpVoteCanceled;
    }
    if (this.voteDirection === 2) {
      return this.replyId === `${network}-0`
        ? NotificationsTypes.QuestionDownVoted
        : NotificationsTypes.AnswerDownVoted;
    }
    if (this.voteDirection === -2) {
      return this.replyId === `${network}-0`
        ? NotificationsTypes.QuestionDownVoteCanceled
        : NotificationsTypes.AnswerDownVoteCanceled;
    }
    return NotificationsTypes.Unknown;
  }
}

export class ReplyMarkedTheBestEventModel extends BaseNotificationEventModel {
  user: string;

  postId: string;

  replyId: string;

  constructor(event: any) {
    super(event);
    const args = event.args ?? event;
    this.user = args.user;
    this.postId = `${event.network}-${args.postId?.toNumber()}`;
    this.replyId = `${event.network}-${args.replyId}`;
    this.notificationType = this.getType(event.network);
  }

  protected getType(_network: Network): NotificationsTypes {
    return NotificationsTypes.AnswerMarkedTheBest;
  }
}

export class ReplyCreatedEventModel extends BaseNotificationEventModel {
  user: string;

  postId: string;

  parentReplyId: string;

  replyId: string;

  constructor(event: any) {
    super(event);
    const args = event.args ?? event;
    this.user = args.user;
    this.parentReplyId = `${event.network}-${args.parentReplyId}`;
    this.postId = `${event.network}-${args.postId?.toNumber()}`;
    this.replyId = `${event.network}-${args.replyId}`;
    this.notificationType = this.getType(event.network);
  }

  protected getType(_network: Network): NotificationsTypes {
    return NotificationsTypes.QuestionAnswered;
  }
}

export class CommentCreatedEventModel extends BaseNotificationEventModel {
  user: string;

  postId: string;

  replyId: string;

  commentId: string;

  constructor(event: any) {
    super(event);
    const args = event.args ?? event;
    this.user = args.user;
    this.postId = `${event.network}-${args.postId?.toNumber()}`;
    this.replyId = `${event.network}-${args.parentReplyId}`; // ~parentReplyId
    this.commentId = `${event.network}-${args.commentId}`;
    this.notificationType = this.getType(event.network);
  }

  protected getType(network: Network): NotificationsTypes {
    return this.replyId === `${network}-0`
      ? NotificationsTypes.QuestionCommented
      : NotificationsTypes.AnswerCommented;
  }
}

export class PostTypeChangedEventModel extends BaseNotificationEventModel {
  public user: string;

  public newPostType: number;

  public postId: string;

  constructor(event: any) {
    super(event);
    const args = event.args ?? event;
    this.user = args.user;
    this.newPostType = args.newPostType;
    this.postId = `${event.network}-${args.postId?.toNumber()}`;
    this.notificationType = this.getType(event.network);
  }

  protected getType(_network: Network): NotificationsTypes {
    return NotificationsTypes.PostTypeChanged;
  }
}

export class ChangePostCommunityEventModel extends BaseNotificationEventModel {
  user: string;

  postId: string;

  oldCommunityId: string;

  constructor(event: any) {
    super(event);
    const args = event.args ?? event;
    this.user = args.user;
    this.postId = `${event.network}-${args.postId?.toNumber()}`;
    this.oldCommunityId = `${event.network}-${String(args.oldCommunityId)}`;
    this.notificationType = this.getType(event.network);
  }

  protected getType(_network: Network): NotificationsTypes {
    return NotificationsTypes.PostCommunityChanged;
  }
}
