export function cleanEventType(eventType: string) {
  return eventType.substring(eventType.indexOf(':') + 2);
}
