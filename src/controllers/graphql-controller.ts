import { execute } from '../../.mesh';
import {
  ExecuteQueryRequest,
  ExecuteQueryResponse,
} from '../models/graphql-models';

export async function executeQuery(
  request: ExecuteQueryRequest
): Promise<ExecuteQueryResponse> {
  const document = request.query;

  const variables = request.variables ?? {};

  const result = await execute(document, variables);
  return new ExecuteQueryResponse(result);
}
