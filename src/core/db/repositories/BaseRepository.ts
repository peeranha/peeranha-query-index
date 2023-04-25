import { DatabaseManager } from 'src/core/db/db-manager';
import { log, LogLevel } from 'src/core/utils/logger';

export abstract class BaseRepository<EntityT, KeyT> {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  public async get(id: KeyT): Promise<EntityT | undefined> {
    const result = await DatabaseManager.getInstance()
      .select()
      .from(this.tableName)
      .where('id', id)
      .first();

    return result;
  }

  public async getListOfProperties(
    properties: string | string[],
    key: string,
    value: any
  ): Promise<EntityT[]> {
    const result = await DatabaseManager.getInstance()
      .column(properties)
      .select()
      .from(this.tableName)
      .where(key, value);

    return JSON.parse(JSON.stringify(result));
  }

  public async create(data: EntityT | EntityT[]): Promise<any> {
    try {
      await DatabaseManager.getInstance()(this.tableName).insert(data);
    } catch (err: any) {
      if (err.code !== 'ER_DUP_ENTRY') {
        log(
          `Error when inserting data ${JSON.stringify(data)} into table ${
            this.tableName
          }`,
          LogLevel.ERROR
        );
        log(JSON.stringify(err), LogLevel.ERROR);
        throw err;
      }
    }
  }

  public async update(id: KeyT, data: any): Promise<any> {
    await DatabaseManager.getInstance()(this.tableName)
      .where('id', id)
      .update(data);
  }

  public async delete(id: KeyT): Promise<any> {
    await DatabaseManager.getInstance()(this.tableName).where('id', id).del();
  }

  public static async transaction(func: Function, eventModel: any) {
    await DatabaseManager.getInstance().transaction(async () => {
      await func(eventModel);
    });
  }
}
