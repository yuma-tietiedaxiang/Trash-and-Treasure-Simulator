import { useState, useEffect } from "react";
import { Smartphone, Radio } from "lucide-react";

export function NFCScreen() {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // TODO: Simulate NFC recognition
    // In actual application, this would call Web NFC API (if browser supports)
    // if ('NDEFReader' in window) {
    //   const ndef = new NDEFReader();
    //   await ndef.scan();
    // }

    // Countdown
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          // Jump to badge website
          setTimeout(() => {
            window.location.href = "https://green-badge-zeta.vercel.app/";
          }, 500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="text-center space-y-12 max-w-lg">
        {/* NFC Icon Animation */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-48 bg-green-600/20 rounded-full animate-ping"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-40 h-40 bg-green-600/30 rounded-full animate-pulse"></div>
          </div>
          <div className="relative flex items-center justify-center h-48">
            <div className="bg-green-600 rounded-full p-8 shadow-2xl">
              <Radio className="w-20 h-20 text-white" />
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-4">
          <h2 className="text-green-700">NFC Recognition Module</h2>
          <p className="text-xl text-gray-700">
            Please place your phone on the NFC recognition module
          </p>
          <p className="text-gray-600">(near the camera position)</p>
        </div>

        {/* Phone Icon */}
        <div className="flex justify-center">
          <div className="bg-gray-100 rounded-2xl p-6 shadow-lg">
            <Smartphone className="w-16 h-16 text-gray-700 animate-bounce" />
          </div>
        </div>

        {/* Status and Countdown */}
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse"></div>
            <p className="text-green-700">Recognizing...</p>
          </div>

          {countdown > 0 && (
            <p className="text-gray-500">
              {countdown} seconds until automatic jump to badge page
            </p>
          )}
        </div>

        {/* Technical Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-left">
          <p className="text-blue-800">💡 Technical Note:</p>
          <p className="text-blue-600 mt-2">
            TODO: In actual application, need to integrate Web NFC API or
            hardware NFC reader
          </p>
          <code className="block mt-2 bg-blue-100 p-2 rounded text-xs text-blue-900">
            {`// const ndef = new NDEFReader();
// await ndef.scan();`}
          </code>
        </div>
      </div>
    </div>
  );
}
