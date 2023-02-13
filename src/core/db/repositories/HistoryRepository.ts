import { HistoryEntity } from 'src/core/db/entities';
import { BaseRepository } from 'src/core/db/repositories/BaseRepository';

import { getPostId } from '../../index/post';

const TABLE_NAME = 'history';

export class HistoryRepository extends BaseRepository<HistoryEntity, string> {
  constructor() {
    super(TABLE_NAME);
  }

  public async createHistory(
    event: any,
    entityType: string,
    operationType: string
  ) {
    const history = new HistoryEntity({
      id: event.transaction,
      transactionHash: event.transaction,
      postId: String(getPostId(event.postId)),
      replyId: event.replyId
        ? `${getPostId(event.postId)}-${event.replyId}`
        : undefined,
      commentId: event.commentId
        ? `${getPostId(event.postId)}-${event.replyId}-${event.commentId}`
        : undefined,
      eventEntity: entityType,
      eventName: operationType,
      actionUser: event.user,
      timestamp: event.timestamp,
    });

    await this.create(history);
  }
}
