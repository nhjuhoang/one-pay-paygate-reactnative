package com.reactnativeonepaypaygate;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.DialogInterface;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.net.http.SslError;
import android.os.Bundle;
import android.text.TextUtils;
import android.util.Base64;
import android.util.Log;
import android.view.View;
import android.webkit.SslErrorHandler;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.RelativeLayout;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.Observer;

import com.lib.paygate.OpUtils;

import java.net.URISyntaxException;
import java.util.Map;

public class OpPaymentActivity extends AppCompatActivity {
    private static final String KEY_URL = "KEY_URL";
  private static final String KEY_RETURN_URL = "KEY_RETURN_URL";
    private static final String TAG = "OpPaymentActivity";
    private RelativeLayout layoutLoading;
    private WebView webView;
    private MutableLiveData<String> resultLiveData;

    @Override
    protected void onNewIntent(Intent intentDeepLink) {
        super.onNewIntent(intentDeepLink);
        if (intentDeepLink != null && intentDeepLink.getData() != null) {
            Uri uri = intentDeepLink.getData();
            if (getResultLiveData().getValue() == null) {
                String encryptLink = uri.getQueryParameter("deep_link");
                if (!TextUtils.isEmpty(encryptLink)) {
                    Uri uriDeeplink = Uri.parse(new String(Base64.decode(encryptLink, Base64.DEFAULT)));
                    webView.loadUrl(uriDeeplink.getQueryParameter("url"));
                } else if (!TextUtils.isEmpty(uri.getQueryParameter("url"))) {
                    webView.loadUrl(uri.getQueryParameter("url"));
                } else {
                    webView.loadUrl(uri.toString());
                }
            }
        }
    }

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (getActionBar() != null) {
            getActionBar().hide();
        }
        if (getSupportActionBar() != null) {
            getSupportActionBar().hide();
        }
        setContentView(R.layout.activity_payment);
        layoutLoading = findViewById(R.id.layout_loading);
        webView = findViewById(R.id.webview);
        setupLiveData();
        setupWebview();

        Intent intent = getIntent();
        if (intent == null)
            return;
        String url = intent.getStringExtra(KEY_URL);
        if (!TextUtils.isEmpty(url)) {
            Log.d(TAG, "url: " + url);
            webView.loadUrl(url);
        }
        if (intent.getData() != null) {
            Uri uriDep = intent.getData();
            Log.d(TAG, "data deeplink oncreate " + uriDep.toString());
            webView.loadUrl(uriDep.getQueryParameter("url"));
        }
    }

    /**
     * setup live data
     */
    private void setupLiveData() {
        // Create the observer which updates the UI.
        final Observer<String> resultObserver = new Observer<String>() {
            @Override
            public void onChanged(@Nullable final String url) {
                handleResult(url);
            }
        };
        getResultLiveData().observe(this, resultObserver);
    }

    /**
     * setup webview
     */
    @SuppressLint("SetJavaScriptEnabled")
    private void setupWebview() {
        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);
        // webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(
                new WebViewClient() {

                  @Override
                    public void onPageStarted(WebView view, String url, Bitmap favicon) {
                        super.onPageStarted(view, url, favicon);
                        showLoading();
                        if (url.startsWith(OpUtils.returnUrl)) {
                            if (getResultLiveData().getValue() == null) {
                                getResultLiveData().setValue(url);
                            }
                        }
                    }

                    @Override
                    public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                        super.onReceivedError(view, request, error);
                        view.loadUrl("");
                    }

                    @Override
                    public void onPageFinished(WebView view, String url) {
                        super.onPageFinished(view, url);
                        hideLoading();
                    }

                    @Override
                    public boolean shouldOverrideUrlLoading(WebView view, String url) {
                        Log.d(TAG, "shouldOverrideUrlLoading: " + url);
                        if (url.startsWith("http://") || url.startsWith("https://")) {
                            return false;
                        }

                        // payment result
                        if (url.startsWith(OpUtils.returnUrl)) {
                            if (getResultLiveData().getValue() == null) {
                                getResultLiveData().setValue(url);
                            }
                            return true;
                        }

                        // goto bank app
                        // gotoBankApp(url);
                        gotoBankAppByUriIntent(url);
                        return true;
                    }
                });
    }

    /**
     * handle result
     *
     * @param url: url
     */
    private void handleResult(String url) {
      setResult(
        Activity.RESULT_OK,
        new Intent().setData(Uri.parse(url)));
      finish();
//      setResult(
//        Activity.RESULT_OK,
//        new Intent().putExtra("RESULT_URL", url));
//      finish();

//      Map<String, String> mapResponse = com.lib.paygate.OpUtils.splitQuery(url);
//      String responseCode = mapResponse.get("vpc_TxnResponseCode");
//      if (responseCode != null && responseCode.equals("0")) { // payment success
//          showDialogMessage(getString(R.string.payment_success), url);
//      } else { // payment failed
//          showDialogMessage(getString(R.string.payment_error), url);
//      }
    }

//    /**
//     * go to bank app
//     *
//     * @param url: url
//     */
//    private void gotoBankApp(String url) {
//        try {
//            Intent intent = new Intent(Intent.ACTION_VIEW);
//            intent.setData(Uri.parse(url));
//            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
//            startActivity(intent);
//        } catch (ActivityNotFoundException e) {
//            Toast.makeText(
//                    OpPaymentActivity.this,
//                    getString(R.string.no_app_found),
//                    Toast.LENGTH_LONG)
//                    .show();
//        }
//    }

    /**
     * goto bank app by Uri Intent
     *
     * @param url: url
     */
    private void gotoBankAppByUriIntent(String url) {
        try {
            Intent intent = Intent.parseUri(url, Intent.URI_INTENT_SCHEME);
            intent.setAction(Intent.ACTION_VIEW);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            startActivity(intent);
        } catch (URISyntaxException e) {
            e.printStackTrace();
        } catch (ActivityNotFoundException e) {
            Toast.makeText(
                    OpPaymentActivity.this,
                    getString(R.string.no_app_found),
                    Toast.LENGTH_LONG)
                    .show();
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.stopLoading();
            webView.destroy();
        }
        super.onDestroy();
    }

    private void showLoading() {
        layoutLoading.setVisibility(View.VISIBLE);
    }

    private void hideLoading() {
        layoutLoading.setVisibility(View.GONE);
    }

//    /**
//     * show dialog result
//     *
//     * @param message:   mesage
//     * @param urlResult: urlResult
//     */
//    private void showDialogMessage(String message, final String urlResult) {
//        AlertDialog.Builder builder = new AlertDialog.Builder(this);
//        builder.setMessage(message)
//                .setTitle(R.string.payment_dialog_title)
//                .setCancelable(false)
//                .setPositiveButton(
//                        android.R.string.ok,
//                        new DialogInterface.OnClickListener() {
//                            public void onClick(DialogInterface dialog, int id) {
//                                setResult(
//                                        Activity.RESULT_OK,
//                                        new Intent().setData(Uri.parse(urlResult)));
//                                finish();
//                            }
//                        });
//        AlertDialog alert = builder.create();
//        alert.show();
//    }

    private MutableLiveData<String> getResultLiveData() {
        if (resultLiveData == null) {
            resultLiveData = new MutableLiveData<>();
        }
        return resultLiveData;
    }

//    private void gotoAppStore(final String appPackageName) {
//        try {
//            startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=" + appPackageName)));
//        } catch (android.content.ActivityNotFoundException anfe) {
//            startActivity(new Intent(Intent.ACTION_VIEW,
//                    Uri.parse("https://play.google.com/store/apps/details?id=" + appPackageName)));
//        }
//    }
}
