import { AttributeMap } from 'aws-sdk/clients/dynamodb';
import { DynamoDBConnector } from 'src/core/dynamodb/DynamoDbConnector';
import { Config } from 'src/core/dynamodb/entities/Config';
import { BaseDynamoDbRepository } from 'src/core/dynamodb/repositories/BaseDynamoDbRepository';

const BASE_TABLE_NAME_CONFIG = 'config';

export const NEXT_CURSOR = 'nextCursor';

export class ConfigRepository extends BaseDynamoDbRepository<Config, string> {
  constructor(conn: DynamoDBConnector) {
    super(conn, BASE_TABLE_NAME_CONFIG);
  }

  protected toAttributeMap(item: Config): AttributeMap {
    return {
      key: { S: item.key },
      value: { S: item.value },
    };
  }

  protected fromAttributeMap(itemAttributeMap: AttributeMap): Config {
    if (!itemAttributeMap) {
      throw Error('Unexpected undefined itemAttributeMap');
    }

    return new Config({
      key: itemAttributeMap?.key?.S,
      value: itemAttributeMap?.value?.S,
    });
  }

  protected buildKey(key: string): any {
    return {
      key: {
        S: key,
      },
    };
  }
}
