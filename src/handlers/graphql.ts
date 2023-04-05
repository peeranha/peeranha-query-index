import { executeQuery } from 'src/controllers/graphql-controller';
import { handleRequest } from 'src/core/utils/http';
import { ExecuteQueryRequest } from 'src/models/graphql-models';

export const handler = async (event: any) =>
  handleRequest(ExecuteQueryRequest, executeQuery, event);
