import {
  ExecuteQueryRequest,
  ExecuteQueryResponse,
} from 'src/models/graphql-models';

import { execute } from '../../.mesh';

export async function executeQuery(
  request: ExecuteQueryRequest
): Promise<ExecuteQueryResponse> {
  const document = request.query;

  const variables = request.variables ?? {};

  const result = await execute(document, variables);
  return new ExecuteQueryResponse(result);
}
