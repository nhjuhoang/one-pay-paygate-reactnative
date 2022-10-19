# react-native-onepay-paygate

onepay paygate sdk for react native

## Installation

download the file react-native-onepay-paygate-0.1.0.tgz and install by npm

```sh
npm install <path_to_file>/react-native-onepay-paygate-0.1.0.tgz
```

## Usage

```js
import {
  op_createPaymentUrl,
  OPCurrency,
  op_openWithUrl,
  OPErrorResult,
} from 'react-native-onepay-paygate';

// ...

```

open onepay paygate with entity

```js
op_openWithPayment({
            amount,
            accessCode: ACCESS_CODE_PAYGATE,
            currency: OPCurrency.vnd,
            hashKey: HASH_KEY,
            merchant: MERCHANT_PAYGATE,
            orderInformation: `${MERCHANT_PAYGATE} test`,
            urlSchemes: URL_SCHEMES,
          }).then(result => {

          }).catch(error => {

          });
```

open onepay paygate with url

```js
op_openWithUrl(paymentUrl, returnUrl)
              .then((paymentResult) => {
                console.log(paymentResult);
                if (paymentResult.isSuccess) {
                  Alert.alert('Thong bao', 'thanh toan thanh cong');
                }
              })
              .catch((error) => {
                Alert.alert(
                  'Thong bao',
                  'Thanh toan that bai: ' +
                    (error as OPErrorResult).errorCase.toString()
                );
              });
```

create payment url and return url

```js
op_createPaymentUrl({
            amount,
            accessCode: ACCESS_CODE_PAYGATE,
            currency: OPCurrency.vnd,
            hashKey: HASH_KEY,
            merchant: MERCHANT_PAYGATE,
            orderInformation: `${MERCHANT_PAYGATE} test`,
            urlSchemes: URL_SCHEMES,
          }).then((value) => {
            console.log('payment url: ' + value.paymentUrl);
            console.log('payment url: ' + value.returnUrl);
          });
```

create return url with url schemes (format: ** `${urlScheme}://onepay/` **)

```js
op_createReturnUrlFromUrlScheme(URL_SCHEMES);
```

Add to Info.plist in your **ios** folder:
```xml

<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<array>
    <dict>
        <key>CFBundleTypeRole</key>
        <string>Editor</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>{YOUR_MERCHANT_APP_SCHEME}</string>
        </array>
    </dict>
</array>
</plist>


```


## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## Authors

* **Nguyen Thanh Binh (nhatnuoc)**
