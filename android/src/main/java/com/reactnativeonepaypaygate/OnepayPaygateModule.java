package com.reactnativeonepaypaygate;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.os.Parcelable;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.module.annotations.ReactModule;
import com.lib.paygate.OpUtils;

import java.io.Serializable;

@ReactModule(name = OnepayPaygateModule.NAME)
public class OnepayPaygateModule extends ReactContextBaseJavaModule implements Serializable {
    public static final String NAME = "OnepayPaygate";

    public OnepayPaygateModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    @NonNull
    public String getName() {
        return NAME;
    }

    // Example method
    // See https://reactnative.dev/docs/native-modules-android
    @ReactMethod
    public void multiply(int a, int b, Promise promise) {
        promise.resolve(a * b);
    }

    @ReactMethod
    public void generateSecureHash(ReadableMap dict, String hashKeyCustomer, Promise promise) {
        String secureHash = com.lib.paygate.OpUtils.genSecureHash(dict.toHashMap(), hashKeyCustomer);
        promise.resolve(secureHash);
    }

    @ReactMethod
    public void open(String paymentUrl, String returnUrl, Promise promise) {
      OpUtils.returnUrl = returnUrl;
      ReactApplicationContext context = getReactApplicationContext();
      Intent intent = new Intent(context, OpPaymentActivity.class);
      intent.putExtra("KEY_URL", paymentUrl);
//      intent.putExtra("KEY_RETURN_URL", returnUrl);
      int REQUEST_CODE = 123;
      context.addActivityEventListener(new ActivityEventListener() {
        @Override
        public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
          if (requestCode != REQUEST_CODE) {
            return;
          }
          if (resultCode == Activity.RESULT_OK) {
            promise.resolve(data.getData().toString());
          } else {
            int errorCode = data.getIntExtra("error_code", Integer.MIN_VALUE);
            String errorMessage = data.getStringExtra("error_message");
            promise.reject("" + errorCode, errorMessage);
          }
        }

        @Override
        public void onNewIntent(Intent intent) {

        }
      });
      context.startActivityForResult(intent, REQUEST_CODE, Bundle.EMPTY);
    }

    public static native int nativeMultiply(int a, int b);
}
