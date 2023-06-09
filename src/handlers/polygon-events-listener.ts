/* eslint-disable no-await-in-loop */
import { readEvents } from 'src/controllers/evm-blockchain-controller';
import { runTask } from 'src/core/utils/ecs';
import { log } from 'src/core/utils/logger';
import { handleScheduleRequest } from 'src/core/utils/schedule';
import { sleep } from 'src/core/utils/time';
import {
  Network,
  ReadNotificationsRequestModel,
} from 'src/models/event-models';

const DELAY_MS = 1000;

async function readEdgewareEventsLoop() {
  log('Start Edgeware listener.');
  while (true) {
    const request = new ReadNotificationsRequestModel(Network.Polygon);
    await handleScheduleRequest(request, readEvents);
    await sleep(DELAY_MS);
  }
}

const handler = async () => runTask(readEdgewareEventsLoop);
handler();
