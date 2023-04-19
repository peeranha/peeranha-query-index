import { ReadSuiEventsRequestModel, ReadSuiEventsResponseModel } from 'src/models/sui-models';

export async function readSuiEvents(
    _readEventsRequest: ReadSuiEventsRequestModel
  ): Promise<ReadSuiEventsResponseModel> {

    /*
    1. Read cursor value from Config repository. 
    If this is the first call and cursor value is not vailable then use null
    */

    /*
    2. Make POST call to Sui RPC (https://rpc.testnet.sui.io) to method 'suix_queryTransactionBlocks'

    {
      "jsonrpc": "2.0",
      "id": 1,
      "method": "suix_queryTransactionBlocks",
      "params": [
        {
            "filter": {"MoveFunction": {"package": "0xec596b8c61663eaf9d2037828d591a44eaeb3f79ac3c94f43b85289ebb59472c"}}
        },
        null,
        100
      ]
    }

    null - is cursor. if available then pass cursor value
    100 - is max number of transactions to pull. Create a constant for that.
    */

    /*

    3. For each transaction received on the previous step call `sui_getTransactionBlock`

    {
      "jsonrpc": "2.0",
      "id": 1,
      "method": "sui_getTransactionBlock",
      "params": [
        "DD3uAmzXw3LBJugoKJvG2oQY1zYzLeXNCXBUZZSKopWV",
        {
          "showInput": false,
          "showRawInput": false,
          "showEffects": true,
          "showEvents": true,
          "showObjectChanges": true,
          "showBalanceChanges": false
        }
      ]
    }

    */

    /*
    4. Push results of each transaction to SQS queue for indexing
    */

    /*
    5. Save `cursor` value in response from suix_queryTransactionBlocks to config repo for the next run
    */

    return new ReadSuiEventsResponseModel();
  }