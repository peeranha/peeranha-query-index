import { executeQuery } from '../controllers/graphql-controller';
import { handleRequest } from '../http';
import { ExecuteQueryRequest } from '../models/graphql-models';

export const handler = async (event: any) =>
  handleRequest(ExecuteQueryRequest, executeQuery, event);
