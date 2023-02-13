import { ConfigurationError } from 'src/core/errors';

import peeranhaContentInterface from './abi/PeeranhaContent.json';
import { BaseContractWrapper } from './base-contract-wrapper';
import { Documentation } from '../entities/documentation';

export class PeeranhaContentWrapper extends BaseContractWrapper {
  public async createUserByDelegate(
    userAddress: string,
    ipfsHashHex: string
  ): Promise<string> {
    const txObj = await this.contractWithSigner.createUserByDelegate(
      userAddress,
      ipfsHashHex
    );
    return txObj.hash;
  }

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

  public getAddress(): string {
    if (!process.env.MAIN_CONTRACT_ADDRESS) {
      throw new ConfigurationError('MAIN_CONTRACT_ADDRESS is not configured');
    }

    return process.env.MAIN_CONTRACT_ADDRESS;
  }

  public getAbi() {
    return peeranhaContentInterface.abi;
  }
}
