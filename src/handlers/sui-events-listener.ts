/* eslint-disable no-await-in-loop */
import { readSuiEvents } from 'src/controllers/sui-blockchain-controller';
import { runTask } from 'src/core/utils/ecs';
import { sleep } from 'src/core/utils/time';
import { ReadSuiEventsRequestModel } from 'src/models/sui-models';

const DELAY_MS = 1000;

async function readSuiEventsLoop() {
  while (true) {
    await readSuiEvents(new ReadSuiEventsRequestModel());
    await sleep(DELAY_MS);
  }
}

const handler = async () => runTask(readSuiEventsLoop);
handler();
