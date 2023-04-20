export function cleanEventType(eventType: string) {
  return eventType.replace(`${process.env.SUI_PACKAGE_ADDRESS}::`, '');
}
