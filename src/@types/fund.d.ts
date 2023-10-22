export interface FundType {
    id: string,
    img: string,
    title: string,
    amount: number,
    target: number,
    asset: string,
    addressFund: string,
    ownerAddress: string | undefined,
    verificated: boolean
}

export type FundDetailType = {
    description: string | undefined;
    daysTarget: number;
    daysPassed: number;
    type: number;
}
