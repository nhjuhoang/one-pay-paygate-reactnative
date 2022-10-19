"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OPErrorCase = exports.OPCurrency = void 0;
exports.multiply = multiply;
exports.op_createPaymentUrl = op_createPaymentUrl;
exports.op_createReturnUrlFromUrlScheme = op_createReturnUrlFromUrlScheme;
exports.op_openWithPayment = op_openWithPayment;
exports.op_openWithUrl = op_openWithUrl;
var _reactNative = require("react-native");
var _constants = require("./constants");
var _utils = require("./utils");
const LINKING_ERROR = `The package 'react-native-onepay-paygate' doesn't seem to be linked. Make sure: \n\n` + _reactNative.Platform.select({
  ios: "- You have run 'pod install'\n",
  default: ''
}) + '- You rebuilt the app after installing the package\n' + '- You are not using Expo managed workflow\n';
const OnepayPaygate = _reactNative.NativeModules.OnepayPaygate ? _reactNative.NativeModules.OnepayPaygate : new Proxy({}, {
  get() {
    throw new Error(LINKING_ERROR);
  }
});
let OPCurrency;
exports.OPCurrency = OPCurrency;
(function (OPCurrency) {
  OPCurrency[OPCurrency["vnd"] = 0] = "vnd";
  OPCurrency[OPCurrency["usd"] = 1] = "usd";
})(OPCurrency || (exports.OPCurrency = OPCurrency = {}));
let OPErrorCase;
exports.OPErrorCase = OPErrorCase;
(function (OPErrorCase) {
  OPErrorCase[OPErrorCase["MOBILE_NOT_APP_BANKING"] = 0] = "MOBILE_NOT_APP_BANKING";
  OPErrorCase[OPErrorCase["NOT_CONNECT_WEB_ONEPAY"] = 1] = "NOT_CONNECT_WEB_ONEPAY";
  OPErrorCase[OPErrorCase["NOT_FOUND_APP_BANKING"] = 2] = "NOT_FOUND_APP_BANKING";
  OPErrorCase[OPErrorCase["WEB_ONEPAY_STATUS_500"] = 3] = "WEB_ONEPAY_STATUS_500";
})(OPErrorCase || (exports.OPErrorCase = OPErrorCase = {}));
function multiply(a, b) {
  return OnepayPaygate.multiply(a, b);
}
function secureHashQueries(queries, hashKeyCustomer) {
  return OnepayPaygate.generateSecureHash(queries, hashKeyCustomer);
}
const createReturnUrl = paymentEntity => {
  return op_createReturnUrlFromUrlScheme(paymentEntity.urlSchemes);
};
function op_createReturnUrlFromUrlScheme(urlScheme) {
  return `${urlScheme}://onepay/`;
}
async function op_createPaymentUrl(paymentEntity) {
  let version = _constants.VERSION_PAYGATE;
  let code = Date.now();
  let title = paymentEntity.merchant;
  let amountString = `${Math.floor(paymentEntity.amount * 100)}`;
  let returnUrl = createReturnUrl(paymentEntity);
  let ticketNo = _constants.TICKET_NO;
  let localeName = _reactNative.Platform.OS === 'ios' ? _reactNative.NativeModules.SettingsManager.settings.AppleLocale || _reactNative.NativeModules.SettingsManager.settings.AppleLanguages[0] //iOS 13
  : _reactNative.NativeModules.I18nManager.localeIdentifier;
  let languageString = localeName.includes('vi') ? 'vn' : 'en';
  let queries = {
    vpc_Version: version,
    vpc_Command: _constants.COMMAND_PAYGATE,
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
    vpc_Theme: _constants.VPC_THEME,
    AgainLink: _constants.AGAIN_LINK
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
  Object.assign({}, queries), paymentEntity.hashKey);
  // queriesMap.set('vpc_SecureHash', secureHash);
  queries.vpc_SecureHash = secureHash;
  // queries.vpc_SecureHash = await OnepayPaygate.generateSecureHash(
  //   queries,
  //   paymentEntity.hashKey
  // );
  console.log('queries.vpc_SecureHash : ' + queries.vpc_SecureHash);
  let queriesString = Object.entries(queries).map(value => `${value[0]}=${value[1]}`).filter(value => value.length > 0).join('&');
  // console.log('queries map entries: ' + Array.from(queriesMap).map(value ));
  // let queriesString = Object.entries(queriesMap)
  //   .map((value) => `${value[0]}=${value[1]}`)
  //   .filter((value) => value.length > 0)
  //   .join('&');
  // queriesString += `&vpc_SecureHash=${secureHash}`;
  console.log('queries string: ' + queriesString);
  console.log('encode uri: ' + encodeURI(_constants.LINK_PAYGATE + '?' + queriesString));
  return {
    paymentUrl: encodeURI(`${_constants.LINK_PAYGATE}?${queriesString}`),
    // paymentUrl: `${LINK_PAYGATE}?${queriesString}`,
    returnUrl: createReturnUrl(paymentEntity)
  };
}
async function op_openWithPayment(paymentEntity) {
  let payment = await op_createPaymentUrl(paymentEntity);
  return op_openWithUrl(payment.paymentUrl, payment.returnUrl);
}
function op_openWithUrl(paymentUrl, returnUrl) {
  return new Promise((resolve, reject) => {
    OnepayPaygate.open(paymentUrl, returnUrl).then(resultUrl => {
      console.log('result url: ' + resultUrl);
      let obj = (0, _utils.getQueryParamsFromUrl)(resultUrl);
      let result = {
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
        version: obj.vpc_Version
      };
      resolve(result);
    }).catch(error => {
      reject(error);
    });
  });
}
//# sourceMappingURL=index.js.map