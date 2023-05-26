import peeranhaContentInterface from 'src/core/blockchain/contracts/abi/PeeranhaContent.json';
import { BaseContractWrapper } from 'src/core/blockchain/contracts/base-contract-wrapper';
import { Documentation } from 'src/core/blockchain/entities/documentation';
import { ConfigurationError } from 'src/core/errors';
import { Network } from 'src/models/event-models';

export class PeeranhaContentWrapper extends BaseContractWrapper {
  public async getPost(postId: number): Promise<any> {
    return this.contract.getPost(postId);
  }

  public async getReply(postId: number, replyId: number): Promise<any> {
    return this.contract.getReply(postId, replyId);
  }

  public async getComment(
    postId: number,
    replyId: number,
    commentId: number
  ): Promise<any> {
    return this.contract.getComment(postId, replyId, commentId);
  }

  public async getDocumentationTree(
    communityId: number
  ): Promise<Documentation> {
    return this.contract.getDocumentationTree(communityId);
  }

  public async getItemProperty(
    propertyId: number,
    postId: number,
    replyId?: number,
    commentId?: number
  ): Promise<string> {
    return this.contract.getItemProperty(
      propertyId,
      postId,
      replyId ?? 0,
      commentId ?? 0
    );
  }

  public async getItemLanguage(
    postId: number,
    replyId?: number,
    commentId?: number
  ) {
    return this.contract.getItemLanguage(postId, replyId ?? 0, commentId ?? 0);
  }

  public getAddress(network: Network): string {
    const contentAddress = !network
      ? process.env.POLYGON_CONTENT_ADDRESS
      : process.env.EDGEWARE_CONTENT_ADDRESS;
    if (!contentAddress) {
      throw new ConfigurationError('CONTENT_ADDRESS is not configured');
    }

    return contentAddress;
  }

  public getAbi() {
    return peeranhaContentInterface.abi;
  }
}
