export interface FundType {
    img: string,
    title: string,
    amount: number,
    target: number,
    asset: string,
    addressFund: string,
    ownerAddress: string | undefined,
}

export type FundDetailType = {
    description: string | undefined;
    daysTarget: number;
    daysPassed: number;
    type: number;
}
