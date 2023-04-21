export function parseNullableInt(stringVal: string | undefined): number {
  if (stringVal === undefined) {
    return 0;
  }
  return parseInt(stringVal, 10);
}

export function parseIntArray(stringArray: string[]): number[] {
  return stringArray.map((element) => parseNullableInt(element));
}
