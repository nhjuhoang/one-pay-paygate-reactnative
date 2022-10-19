import Foundation 

@objc(OnepayPaygate)
class OnepayPaygate: NSObject {
    var activityIndicator: UIActivityIndicatorView?

    @objc(multiply:withB:withResolver:withRejecter:)
    func multiply(a: Float, b: Float, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        resolve(a*b)
    }
    
    @objc(generateSecureHash:hashKeyCustomer:withResolver:withRejecter:)
    func generateSecureHash(dict: [String: String], hashKeyCustomer: String, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        let secureHash = secureHashKey(dict: dict, hashKeyCustomer: hashKeyCustomer);
        resolve(secureHash);
    }
    
    @objc(open:returnUrl:withResolver:withRejecter:)
    func openOnepayPaygate(paymentUrl: String, returnUrl: String, resolve: @escaping RCTPromiseResolveBlock,reject: @escaping RCTPromiseRejectBlock) -> Void {
        guard let paymentURL = URL(string: paymentUrl) else {
            reject("payment_url_parsing_error", "payment url không đúng", nil)
            return
        }
        DispatchQueue.main.async {
//            let controller = WebOnepayPaymentViewController(
//                                    nibName: "WebOnepayPaymentViewController",
//                                    bundle: Bundle(for: WebOnepayPaymentViewController.self))
            let controller = WebOnepayPaymentViewController()
            controller.orderPayment = OnepayPaymentEntity(requestURL: paymentURL, returnURL: returnUrl)
            controller.resolveBlock = resolve
            controller.rejectBlock = reject
            controller.modalPresentationStyle = .fullScreen
            UIApplication.shared.keyWindow?.rootViewController?.topMostViewController().present(controller, animated: true)
        }
//        self.present(controller, animated: true, completion: nil)
    }

    private func secureHashKey(dict:[String:String], hashKeyCustomer: String) -> String {
        var stringDict = ""
        let dictSort = dict.sorted { $0.0 < $1.0 }
        var index = 0
        for (key, value) in dictSort {
            index = index + 1
            if key.starts(with: "vpc_") {
                if index < dictSort.count {
                    stringDict = stringDict + "\(key)=\(value)" + "&"
                }else {
                    stringDict = stringDict + "\(key)=\(value)"
                }
            }
        }
        let hmacData2 = hmac(hashName:"SHA256", message:stringDict.data(using:.utf8)!, key: hashKeyCustomer.hexaData)
        print("\(hashKeyCustomer): \(hashKeyCustomer.hexaData)")
        let str = hmacData2!.hexEncodedString(options: .upperCase)
        return str
    }
    
    private func hmac(hashName:String, message:Data, key:Data) -> Data? {
        let algos = ["SHA1":   (kCCHmacAlgSHA1,   CC_SHA1_DIGEST_LENGTH),
                     "MD5":    (kCCHmacAlgMD5,    CC_MD5_DIGEST_LENGTH),
                     "SHA224": (kCCHmacAlgSHA224, CC_SHA224_DIGEST_LENGTH),
                     "SHA256": (kCCHmacAlgSHA256, CC_SHA256_DIGEST_LENGTH),
                     "SHA384": (kCCHmacAlgSHA384, CC_SHA384_DIGEST_LENGTH),
                     "SHA512": (kCCHmacAlgSHA512, CC_SHA512_DIGEST_LENGTH)]
        guard let (hashAlgorithm, length) = algos[hashName]  else { return nil }
        var macData = Data(count: Int(length))
        
        macData.withUnsafeMutableBytes { (macBytes: UnsafeMutableRawBufferPointer) in
            message.withUnsafeBytes { (messageBytes: UnsafeRawBufferPointer) in
                key.withUnsafeBytes {(keyBytes : UnsafeRawBufferPointer) in
                    CCHmac(CCHmacAlgorithm(hashAlgorithm),
                           keyBytes.baseAddress?.assumingMemoryBound(to: UInt8.self),
                           key.count,
                           messageBytes.baseAddress?.assumingMemoryBound(to: UInt8.self),
                           message.count,
                           macBytes.baseAddress?.assumingMemoryBound(to: UInt8.self))
                }
            }
        }
        return macData
    }
}

extension UIViewController {
    func topMostViewController() -> UIViewController {
        if self.presentedViewController == nil {
            return self
        }
        if let navigation = self.presentedViewController as? UINavigationController {
            return navigation.visibleViewController?.topMostViewController() ?? self
        }
        if let tab = self.presentedViewController as? UITabBarController {
            if let selectedTab = tab.selectedViewController {
                return selectedTab.topMostViewController()
            }
            return tab.topMostViewController()
        }
        return self.presentedViewController?.topMostViewController() ?? self
    }
    
    func find<VC: UIViewController>(_ type: VC.Type) -> VC? {
        if self.presentedViewController == nil {
            return self as? VC
        }
        if let navigation = self.presentedViewController as? UINavigationController {
            return navigation.children.first(where: { $0 is VC }) as? VC ?? navigation.visibleViewController?.find(type)
        }
        if let tab = self.presentedViewController as? UITabBarController {
            if let selectedTab = tab.selectedViewController {
                return selectedTab.find(type)
            }
            return tab.find(type)
        }
        return self.presentedViewController?.find(type)
    }
}
