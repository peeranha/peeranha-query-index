export function cleanEventType(eventType: string) {
  return eventType.substring(eventType.indexOf(':') + 2);
}

export function parseIntFromSuiBits(bits: string) {
  const hex = BigInt(bits).toString(16);
  if (hex.startsWith('80')) {
    // if negative
    return parseInt(hex.substring(2), 16) * -1;
  }
  return parseInt(bits, 10);
}
