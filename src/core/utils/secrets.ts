import { SecretsManager } from 'aws-sdk';
import { ConfigurationError } from 'src/core/errors';
import { log } from 'src/core/utils/logger';

export const DB_SECRETS_ENC_KEY_SECRET_NAME = 'DB_SECRETS_ENC_KEY';

const client = new SecretsManager({ region: process.env.REGION });

export async function getSecretValue(secretName: string) {
  if (process.env.ENV === 'offline') {
    const secretValue = process.env[secretName];
    if (!secretValue) {
      throw new ConfigurationError(
        `Missing environment variable ${secretName}`
      );
    }
    return process.env[secretName];
  }
  try {
    const fullSecretName = `${process.env.ENV}/${secretName}`;
    const data: any = await client
      .getSecretValue({ SecretId: fullSecretName })
      .promise();
    if ('SecretString' in data) {
      return data.SecretString;
    }
    const buff = Buffer.from(data.SecretBinary, 'base64');
    return buff.toString('ascii');
  } catch (err: any) {
    if (err.code === 'DecryptionFailureException')
      // Secrets Manager can't decrypt the protected secret text using the provided KMS key.
      // Deal with the exception here, and/or rethrow at your discretion.
      throw err;
    else if (err.code === 'InternalServiceErrorException')
      // An error occurred on the server side.
      // Deal with the exception here, and/or rethrow at your discretion.
      throw err;
    else if (err.code === 'InvalidParameterException')
      // You provided an invalid value for a parameter.
      // Deal with the exception here, and/or rethrow at your discretion.
      throw err;
    else if (err.code === 'InvalidRequestException')
      // You provided a parameter value that is not valid for the current state of the resource.
      // Deal with the exception here, and/or rethrow at your discretion.
      throw err;
    else if (err.code === 'ResourceNotFoundException') {
      // We can't find the resource that you asked for.
      // Deal with the exception here, and/or rethrow at your discretion.
      log(`We can't find the secret that you asked for: ${secretName}`);
      throw err;
    }
    throw err;
  }
}
