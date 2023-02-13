import { ethers } from 'ethers';

export function formatUnixTimestamp(timeStamp: number): string {
  return new Date(timeStamp * 1000).toISOString().slice(0, 10);
}

export function formatCurrency(value: number): string {
  return value.toFixed(2);
}

export function formatContractResponse(response: any): any {
  if (ethers.BigNumber.isBigNumber(response)) {
    return response.toHexString();
  }

  const includedProperties: any[] = [];
  Object.entries(response).forEach((p) => {
    const property = p;
    if (property[0].length > 1) {
      const val = property[1];
      if (ethers.BigNumber.isBigNumber(val)) {
        property[1] = val.toHexString();
      }

      if (typeof val === 'object') {
        let newVal = formatContractResponse(val);
        if (Object.keys(newVal).length === 0) {
          newVal = [];
        }
        property[1] = newVal;
      }

      includedProperties.push(property);
    }
  });

  const resultObj = Object.fromEntries(includedProperties);
  if (Object.keys(resultObj).length === 0) {
    return [];
  }

  return resultObj;
}
