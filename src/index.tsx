import { NativeModules, Platform } from 'react-native';
import {
  AGAIN_LINK,
  COMMAND_PAYGATE,
  LINK_PAYGATE,
  TICKET_NO,
  VERSION_PAYGATE,
  VPC_THEME,
} from './constants';
import { getQueryParamsFromUrl } from './utils';

const LINKING_ERROR =
  `The package 'react-native-onepay-paygate' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const OnepayPaygate = NativeModules.OnepayPaygate
  ? NativeModules.OnepayPaygate
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export enum OPCurrency {
  vnd,
  usd,
}

export enum OPErrorCase {
  MOBILE_NOT_APP_BANKING, // app mobile banking doesn't install or not config in LSApplicationQueriesSchemes
  NOT_CONNECT_WEB_ONEPAY, // app not connect web onepay.Please check the information set onepay sent.
  NOT_FOUND_APP_BANKING, // App banking isn't exist. Contact the onepay developer with information of the message field in error.
  WEB_ONEPAY_STATUS_500, // app not connect web onepay.Contact onepay for support.
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

export function multiply(a: number, b: number): Promise<number> {
  return OnepayPaygate.multiply(a, b);
}

function secureHashQueries(
  queries: { [key: string]: string },
  hashKeyCustomer: string
): Promise<string> {
  return OnepayPaygate.generateSecureHash(queries, hashKeyCustomer);
}

const createReturnUrl = (paymentEntity: OPPaymentEntity) => {
  return op_createReturnUrlFromUrlScheme(paymentEntity.urlSchemes);
};

export function op_createReturnUrlFromUrlScheme(urlScheme: string): string {
  return `${urlScheme}://onepay/`;
}

export async function op_createPaymentUrl(
  paymentEntity: OPPaymentEntity
): Promise<OPPaymentUrl> {
  let version = VERSION_PAYGATE;
  let code = Date.now();
  let title = paymentEntity.merchant;
  let amountString = `${Math.floor(paymentEntity.amount * 100)}`;
  let returnUrl = createReturnUrl(paymentEntity);
  let ticketNo = TICKET_NO;
  let localeName: string =
    Platform.OS === 'ios'
      ? NativeModules.SettingsManager.settings.AppleLocale ||
        NativeModules.SettingsManager.settings.AppleLanguages[0] //iOS 13
      : NativeModules.I18nManager.localeIdentifier;
  let languageString = localeName.includes('vi') ? 'vn' : 'en';
  let queries: { [key: string]: string } = {
    vpc_Version: version,
    vpc_Command: COMMAND_PAYGATE,
    vpc_AccessCode: paymentEntity.accessCode,
    vpc_Merchant: paymentEntity.merchant,
    vpc_Locale: languageString,
    vpc_ReturnURL: returnUrl,
    vpc_MerchTxnRef: `${code}`,
    vpc_OrderInfo: paymentEntity.orderInformation,
    vpc_Amount: amountString,
    vpc_TicketNo: ticketNo,
    Title: title,
    vpc_Currency: paymentEntity.currency === OPCurrency.vnd ? 'VND' : 'USD',
    vpc_Theme: VPC_THEME,
    AgainLink: AGAIN_LINK,
  };
  // let queriesMap = new Map(Object.entries(queries));
  if (paymentEntity.customerPhone && paymentEntity.customerPhone.length > 0) {
    // queriesMap.set('vpc_Customer_Phone', paymentEntity.customerPhone);
    queries.vpc_Customer_Phone = paymentEntity.customerPhone;
  }
  if (paymentEntity.customerEmail && paymentEntity.customerEmail.length > 0) {
    // queriesMap.set('vpc_Customer_Email', paymentEntity.customerEmail);
    queries.vpc_Customer_Email = paymentEntity.customerEmail;
  }
  if (paymentEntity.customerId && paymentEntity.customerId.length > 0) {
    // queriesMap.set('vpc_Customer_Id', paymentEntity.customerId);
    queries.vpc_Customer_Id = paymentEntity.customerId;
  }
  let secureHash = await secureHashQueries(
    // Object.fromEntries(queriesMap),
    Object.assign({}, queries),
    paymentEntity.hashKey
  );
  // queriesMap.set('vpc_SecureHash', secureHash);
  queries.vpc_SecureHash = secureHash;
  // queries.vpc_SecureHash = await OnepayPaygate.generateSecureHash(
  //   queries,
  //   paymentEntity.hashKey
  // );
  // console.log('queries.vpc_SecureHash : ' + queries.vpc_SecureHash);
  let queriesString = Object.entries(queries)
    .map((value) => `${value[0]}=${value[1]}`)
    .filter((value) => value.length > 0)
    .join('&');
  // console.log('queries map entries: ' + Array.from(queriesMap).map(value ));
  // let queriesString = Object.entries(queriesMap)
  //   .map((value) => `${value[0]}=${value[1]}`)
  //   .filter((value) => value.length > 0)
  //   .join('&');
  // queriesString += `&vpc_SecureHash=${secureHash}`;
  // console.log('queries string: ' + queriesString);
  // console.log('encode uri: ' + encodeURI(LINK_PAYGATE + '?' + queriesString));
  return {
    paymentUrl: encodeURI(`${LINK_PAYGATE}?${queriesString}`),
    // paymentUrl: `${LINK_PAYGATE}?${queriesString}`,
    returnUrl: createReturnUrl(paymentEntity),
  };
}

export async function op_openWithPayment(
  paymentEntity: OPPaymentEntity
): Promise<OPPaymentResult> {
  let payment = await op_createPaymentUrl(paymentEntity);
  return op_openWithUrl(payment.paymentUrl, payment.returnUrl);
}

export function op_openWithUrl(
  paymentUrl: string,
  returnUrl: string
): Promise<OPPaymentResult> {
  return new Promise((resolve, reject) => {
    OnepayPaygate.open(paymentUrl, returnUrl)
      .then((resultUrl: string) => {
        // console.log('result url: ' + resultUrl);
        let obj = getQueryParamsFromUrl(resultUrl);
        let result: OPPaymentResult = {
          isSuccess: obj.vpc_TxnResponseCode === '0',
          amount: obj.vpc_Amount,
          card: obj.vpc_Card,
          cardNumber: obj.vpc_CardNum,
          command: obj.vpc_Command,
          merchTxnRef: obj.vpc_MerchTxnRef,
          merchant: obj.vpc_Merchant,
          message: obj.vpc_Message,
          orderInfo: obj.vpc_OrderInfo,
          payChannel: obj.vpc_PayChannel,
          transactionNo: obj.vpc_TransactionNo,
          version: obj.vpc_Version,
        };
        resolve(result);
      })
      .catch((error: any) => {
        reject(error);
      });
  });
}
