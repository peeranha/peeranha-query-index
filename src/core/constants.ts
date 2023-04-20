export const FIRST_QUEUE = `${process.env.ENV}-firstQueue.fifo`;
export const SECOND_QUEUE = `${process.env.ENV}-secondQueue.fifo`;

export const SUI_FIRST_QUEUE = `${process.env.ENV}-firstSuiQueue.fifo`;

const FIRST_CLUSTER_CREDENTIALS = 'FIRST_CLUSTER_CREDENTIALS';
const SECOND_CLUSTER_CREDENTIALS = 'SECOND_CLUSTER_CREDENTIALS';

export const credentialsSecret = {
  [FIRST_QUEUE]: FIRST_CLUSTER_CREDENTIALS,
  [SUI_FIRST_QUEUE]: FIRST_CLUSTER_CREDENTIALS,
  [SECOND_QUEUE]: SECOND_CLUSTER_CREDENTIALS,
};
