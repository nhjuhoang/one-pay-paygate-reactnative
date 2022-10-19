#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(OnepayPaygate, NSObject)

RCT_EXTERN_METHOD(multiply:(float)a withB:(float)b
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(generateSecureHash:(NSDictionary*)dict
                  hashKeyCustomer:(NSString*)hashKeyCustomer
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(open:(NSString*)paymentUrl
                  returnUrl:(NSString*)returnUrl
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)

@end
