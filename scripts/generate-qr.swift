import Foundation
import AppKit
import CoreImage
import Vision
let destination = "https://drtimli.github.io/connect.html"
let filter = CIFilter(name: "CIQRCodeGenerator")!
filter.setValue(Data(destination.utf8), forKey: "inputMessage")
filter.setValue("M", forKey: "inputCorrectionLevel")
let qr = filter.outputImage!
let scale: CGFloat = 16
let border: CGFloat = 4
let extent = qr.extent.insetBy(dx: -border, dy: -border)
let white = CIImage(color: CIColor.white).cropped(to: extent)
let padded = qr.composited(over: white).transformed(by: CGAffineTransform(scaleX: scale, y: scale))
let context = CIContext(options: [.useSoftwareRenderer: true])
let image = context.createCGImage(padded, from: padded.extent)!
let bitmap = NSBitmapImageRep(cgImage: image)
try bitmap.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: CommandLine.arguments[1]))
let savedImage = NSImage(contentsOfFile: CommandLine.arguments[1])!
let savedCG = savedImage.cgImage(forProposedRect: nil, context: nil, hints: nil)!
let request = VNDetectBarcodesRequest()
request.symbologies = [.qr]
try VNImageRequestHandler(cgImage: savedCG).perform([request])
guard request.results?.first?.payloadStringValue == destination else { fatalError("QR verification failed") }
print("Verified combined QR destination: \(destination)")
let original = VNDetectBarcodesRequest()
original.symbologies = [.qr]
try VNImageRequestHandler(url: URL(fileURLWithPath: CommandLine.arguments[2])).perform([original])
print("Original WeChat QR decoded: \(original.results?.first?.payloadStringValue != nil)")
