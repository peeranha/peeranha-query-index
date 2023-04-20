import { UserData } from "src/core/blockchain/entities/user";
import { log, LogLevel } from "src/core/utils/logger";
import { getObject } from "./sui";
import { AddIpfsData, byteArrayToHexString } from "src/core/utils/ipfs";
import { RuntimeError } from "../errors";

export async function getSuiUserById(
    userId: string
  ): Promise<UserData | undefined> {
    try {
      const userObject = await getObject(userId);

      log(`User object: ${JSON.stringify(userObject)}`);

      const fields = userObject.data?.content?.fields;
      
      if(!fields) {
        throw new RuntimeError(`Missing 'fields' in response for user ${userId}.`)
      }

      const ipfsHash1 = byteArrayToHexString(fields.ipfsDoc.fields.hash);
      const ipfsHash2 = byteArrayToHexString(fields.ipfsDoc.fields.hash2);

      const user = new UserData([
        [
          ipfsHash1, 
          ipfsHash2
        ],
        fields.energy,
        fields.lastUpdatePeriod,
        fields.followedCommunities
      ]);
      log(`User Data from contract: ${JSON.stringify(user)}`);
      await AddIpfsData(user, user.ipfsDoc[0]);
      log(`User Data with Ipfs info: ${JSON.stringify(user)}`);
      return user;
    } catch (err: any) {
      log(
        `Error during getting user. Params: userId - ${userId}\n${err}`,
        LogLevel.ERROR
      );
      return undefined;
    }
  }