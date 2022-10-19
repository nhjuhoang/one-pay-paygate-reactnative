export declare enum OPCurrency {
    vnd = 0,
    usd = 1
}
export declare enum OPErrorCase {
    MOBILE_NOT_APP_BANKING = 0,
    NOT_CONNECT_WEB_ONEPAY = 1,
    NOT_FOUND_APP_BANKING = 2,
    WEB_ONEPAY_STATUS_500 = 3
}
export interface OPPaymentEntity {
    amount: number;
    orderInformation: string;
    currency: OPCurrency;
    accessCode: string;
    merchant: string;
    hashKey: string;
    urlSchemes: string;
    customerPhone?: string;
    customerEmail?: string;
    customerId?: string;
}
export interface OPPaymentResult {
    isSuccess: boolean;
    amount?: string;
    card?: string;
    cardNumber?: string;
    command?: string;
    merchTxnRef?: string;
    merchant?: string;
    message?: string;
    orderInfo?: string;
    payChannel?: string;
    transactionNo?: string;
    version?: string;
}
export interface OPErrorResult {
    errorCase: OPErrorCase;
}
export interface OPPaymentUrl {
    paymentUrl: string;
    returnUrl: string;
}
export declare function multiply(a: number, b: number): Promise<number>;
export declare function op_createReturnUrlFromUrlScheme(urlScheme: string): string;
export declare function op_createPaymentUrl(paymentEntity: OPPaymentEntity): Promise<OPPaymentUrl>;
export declare function op_openWithPayment(paymentEntity: OPPaymentEntity): Promise<OPPaymentResult>;
export declare function op_openWithUrl(paymentUrl: string, returnUrl: string): Promise<OPPaymentResult>;
