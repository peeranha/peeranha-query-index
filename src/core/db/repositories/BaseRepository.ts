import { DatabaseManager } from 'src/core/db/db-manager';

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
    property: string,
    key: string,
    value: any
  ): Promise<any[]> {
    const result = await DatabaseManager.getInstance()
      .select(property)
      .from(this.tableName)
      .where(key, value);

    return JSON.parse(JSON.stringify(result));
  }

  public async create(data: any): Promise<any> {
    await DatabaseManager.getInstance()(this.tableName)
      .insert(data)
      .onConflict('id')
      .ignore();
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
