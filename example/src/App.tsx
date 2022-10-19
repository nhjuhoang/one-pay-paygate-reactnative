import * as React from 'react';

import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ToastAndroid,
  Platform,
} from 'react-native';
import {
  op_createPaymentUrl,
  OPCurrency,
  op_openWithUrl,
  OPErrorResult,
} from 'react-native-onepay-paygate';

function HomeScreen() {
  const [amount, setAmount] = React.useState<number | undefined>(2000);

  const ACCESS_CODE_PAYGATE = '6BEB2566'; // Onepay send for merchant
  const MERCHANT_PAYGATE = 'TESTONEPAY34'; //  Merchant register with onepay
  const HASH_KEY = '6D0870CDE5F24F34F3915FB0045120D6'; // Onepay send for merchant
  const URL_SCHEMES = 'merchantappscheme'; // get CFBundleURLSchemes in Info.plist
  const ONE_PAY_RETURN_URL = "https://storage-dev.tixlabs.io/sites/onepay-return-url.html"
  const ONE_PAY_AGAIN_LINK= "https://tixlab.vn"

  const paymentUrl = 'https://mtf.onepay.vn/paygate/vpcpay.op?AgainLink=https%3A%2F%2Ftixlab.vn&Title=Thanh+toan+cho+don+hang+POEME1666154184567__20221019152816&vpc_AccessCode=6BEB2546&vpc_Amount=2802000&vpc_CardList=QR&vpc_Command=pay&vpc_Currency=VND&vpc_Locale=vn&vpc_MerchTxnRef=POEME1666154184567__20221019152816&vpc_Merchant=TESTONEPAY&vpc_OrderInfo=POEME1666154184567&vpc_ReturnURL=merchantappscheme%3A%2F%2Fonepay&vpc_TicketNo=%5B%3A%3A1%5D%3A52265&vpc_Version=2&vpc_SecureHash=55A6B502CBEE6E50B741A2BE5E5AC97EF0F408F1B974F2A72505D516F41F26BD'

  React.useEffect(() => {
    // multiply(3, 7).then(setResult);
  }, []);
  return (
    <View style={styles.container}>
      {/* <TextInput
        value={`${amount}`}
        onChangeText={(text) => {
          setAmount(Number(text));
        }}
        keyboardType={'number-pad'}
        style={{
          borderWidth: 1,
          borderColor: 'black',
          width: 200,
          marginBottom: 20
        }}
      /> */}
      <TouchableOpacity
        onPress={() => {
          op_openWithUrl(paymentUrl, URL_SCHEMES)
          .then((paymentResult) => {
            console.log(paymentResult);
            if (paymentResult.isSuccess) {
                Alert.alert('Thong bao', 'thanh toan thanh cong');
            } else {
              if (Platform.OS === 'android') {
                ToastAndroid.show('thanh toan that bai', ToastAndroid.LONG);
              } else {
                Alert.alert('Thong bao', 'thanh toan that bai');
              }
            }
          })
          .catch((error) => {
            Alert.alert(
              'Thong bao',
              'Thanh toan that bai: ' +
                (error as OPErrorResult).errorCase.toString()
            );
          });

          // if (!amount) {
          //   Alert.alert('Thông báo', 'Vui lòng nhập số tiền!');
          //   return;
          // }
          // op_createPaymentUrl({
          //   amount,
          //   accessCode: ACCESS_CODE_PAYGATE,
          //   currency: OPCurrency.vnd,
          //   hashKey: HASH_KEY,
          //   merchant: MERCHANT_PAYGATE,
          //   orderInformation: `${MERCHANT_PAYGATE} test`,
          //   urlSchemes: URL_SCHEMES,
          // }).then((value) => {
          //   console.log('payment url: ' + value.paymentUrl);
          //   op_openWithUrl(value.paymentUrl, ONE_PAY_RETURN_URL)
          //     .then((paymentResult) => {
          //       console.log(paymentResult);
          //       if (paymentResult.isSuccess) {
          //           Alert.alert('Thong bao', 'thanh toan thanh cong');
          //       } else {
          //         if (Platform.OS === 'android') {
          //           ToastAndroid.show('thanh toan that bai', ToastAndroid.LONG);
          //         } else {
          //           Alert.alert('Thong bao', 'thanh toan that bai');
          //         }
          //       }
          //     })
          //     .catch((error) => {
          //       Alert.alert(
          //         'Thong bao',
          //         'Thanh toan that bai: ' +
          //           (error as OPErrorResult).errorCase.toString()
          //       );
          //     });
          // });
        }}
      >
        <View style={{ backgroundColor: 'black', width: 200, height: 50, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{color: 'white'}}>thanh toan 12312</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

export default function App() {
  return <HomeScreen />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
