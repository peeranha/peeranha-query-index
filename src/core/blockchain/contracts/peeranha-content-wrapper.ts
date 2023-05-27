import peeranhaContentInterface from 'src/core/blockchain/contracts/abi/PeeranhaContent.json';
import { BaseContractWrapper } from 'src/core/blockchain/contracts/base-contract-wrapper';
import { Documentation } from 'src/core/blockchain/entities/documentation';
import { ConfigurationError } from 'src/core/errors';
import { Network } from 'src/models/event-models';

export class PeeranhaContentWrapper extends BaseContractWrapper {
  public async getPost(postId: string): Promise<any> {
    return this.contract.getPost(postId.split('-')[1]);
  }

  public async getReply(postId: string, replyId: string): Promise<any> {
    return this.contract.getReply(postId.split('-')[1], replyId.split('-')[1]);
  }

  public async getComment(
    postId: string,
    replyId: string,
    commentId: string
  ): Promise<any> {
    return this.contract.getComment(
      postId.split('-')[1],
      replyId.split('-')[1],
      commentId.split('-')[1]
    );
  }

  public async getDocumentationTree(
    communityId: string
  ): Promise<Documentation> {
    return this.contract.getDocumentationTree(communityId.split('-')[1]);
  }

  public async getItemProperty(
    propertyId: number,
    postId: string,
    replyId?: string,
    commentId?: string
  ): Promise<string> {
    return this.contract.getItemProperty(
      propertyId,
      postId.split('-')[1],
      replyId?.split('-')[1] ?? 0,
      commentId?.split('-')[1] ?? 0
    );
  }

  public async getItemLanguage(
    postId: string,
    replyId?: string,
    commentId?: string
  ) {
    return this.contract.getItemLanguage(
      postId.split('-')[1],
      replyId?.split('-')[1] ?? 0,
      commentId?.split('-')[1] ?? 0
    );
  }

  public getAddress(network: Network): string {
    let contentAddress;
    if (network === Network.Polygon) {
      contentAddress = process.env.POLYGON_CONTENT_ADDRESS;
    }
    if (network === Network.Edgeware) {
      contentAddress = process.env.EDGEWARE_CONTENT_ADDRESS;
    }
    if (!contentAddress) {
      throw new ConfigurationError('CONTENT_ADDRESS is not configured');
    }

    return contentAddress;
  }

  public getAbi() {
    return peeranhaContentInterface.abi;
  }
}
