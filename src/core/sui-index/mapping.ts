import { UserCreatedSuiEventModel } from "src/models/sui-event-models";
import { createSuiUser } from "./user";

export async function handleNewSuiUser(eventModel: UserCreatedSuiEventModel) {
    await createSuiUser(eventModel.userId, eventModel.timestamp);
}