import React, { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Camera, Loader2, Upload, AlertCircle } from "lucide-react";
import {
  trashModelService,
  TrashPrediction,
} from "../services/trashModelService";
import {
  CameraUtils,
  checkCameraSupport,
  checkFileUploadSupport,
} from "../utils/cameraUtils";

interface RecognitionScreenProps {
  onConfirm: (item: { name: string; category: string }) => void;
  onReset: () => void;
}

export function RecognitionScreen({
  onConfirm,
  onReset,
}: RecognitionScreenProps) {
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [recognizedItem, setRecognizedItem] = useState<{
    name: string;
    category: string;
  } | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<TrashPrediction[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraUtils = useRef<CameraUtils>(new CameraUtils());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    initializeModel();
    return () => {
      // Clean up camera resources
      cameraUtils.current.stopCamera();
    };
  }, []);

  const initializeModel = async () => {
    try {
      setIsModelLoading(true);
      setError(null);
      await trashModelService.loadModel();
      console.log("Model initialization completed");
    } catch (error) {
      console.error("Model initialization failed:", error);
      setError("Model loading failed, please refresh the page and try again");
    } finally {
      setIsModelLoading(false);
    }
  };

  const startCameraRecognition = async () => {
    const cameraSupport = checkCameraSupport();
    if (!cameraSupport.supported) {
      setError(
        cameraSupport.reason ||
          "Your browser does not support camera functionality"
      );
      return;
    }

    try {
      setIsRecognizing(true);
      setError(null);
      setShowResultDialog(false);

      // Set cameraActive to true first, so the video element will render
      setCameraActive(true);

      // Wait for React to re-render and bind ref
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (!videoRef.current) {
        // Try to get video element via querySelector
        const videoElement = document.querySelector(
          "video"
        ) as HTMLVideoElement;
        if (videoElement) {
          await cameraUtils.current.initializeCamera(videoElement);
          setIsRecognizing(false);
          return;
        }
        throw new Error(
          "Video element not found, please refresh the page and try again"
        );
      }

      await cameraUtils.current.initializeCamera(videoRef.current);
      setIsRecognizing(false); // Stop loading state after camera initialization succeeds
    } catch (error) {
      console.error("Camera initialization failed:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Unable to access camera, please check permission settings"
      );
      setIsRecognizing(false);
      // If initialization fails, reset cameraActive state
      setCameraActive(false);
    }
  };

  const captureAndRecognize = async () => {
    try {
      setIsRecognizing(true);
      setError(null);

      const canvas = cameraUtils.current.captureImage();
      if (!canvas) {
        throw new Error("Unable to capture image");
      }

      // Use model for prediction
      const results = await trashModelService.predict(canvas);
      setPredictions(results);

      if (results.length > 0) {
        const topResult = results[0];
        setRecognizedItem({
          name: topResult.chineseName,
          category: topResult.chineseCategory,
        });
        setShowResultDialog(true);
      } else {
        setError("Unable to identify trash type");
      }
    } catch (error) {
      console.error("Recognition failed:", error);
      setError("Recognition failed, please try again");
    } finally {
      setIsRecognizing(false);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsRecognizing(true);
      setError(null);
      setShowResultDialog(false);

      const results = await trashModelService.predictFromFile(file);
      setPredictions(results);

      if (results.length > 0) {
        const topResult = results[0];
        setRecognizedItem({
          name: topResult.chineseName,
          category: topResult.chineseCategory,
        });
        setShowResultDialog(true);
      } else {
        setError("Unable to identify trash type");
      }
    } catch (error) {
      console.error("File recognition failed:", error);
      setError("File recognition failed, please try again");
    } finally {
      setIsRecognizing(false);
    }
  };

  const handleRecognizeAgain = () => {
    setShowResultDialog(false);
    setRecognizedItem(null);
    setPredictions([]);
    setError(null);
  };

  const handleConfirm = () => {
    if (recognizedItem) {
      onConfirm(recognizedItem);
    }
  };

  const stopCamera = () => {
    cameraUtils.current.stopCamera();
    setCameraActive(false);
    setIsRecognizing(false);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Coffee Cup":
        return "text-black";
      case "Refundable Bottle":
        return "text-purple-600";
      case "Landfill":
        return "text-red-600";
      case "Mixed Recycling":
        return "text-gray-600";
      case "Paper Cardboard":
        return "text-blue-600";
      case "Food Waste":
        return "text-pink-600";
      default:
        return "text-gray-600";
    }
  };

  if (isModelLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="text-center space-y-6 max-w-2xl w-full">
          <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl aspect-video flex items-center justify-center">
            <div className="text-center space-y-4 text-white">
              <Loader2 className="w-16 h-16 animate-spin mx-auto" />
              <p className="text-xl">Loading AI model...</p>
              <p className="text-sm text-gray-300">
                Initial loading may take some time
              </p>
            </div>
          </div>
          <Button
            onClick={onReset}
            variant="outline"
            className="border-green-600 text-green-600 hover:bg-green-50"
          >
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="text-center space-y-6 max-w-2xl w-full">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Camera View */}
        <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl aspect-video relative">
          {cameraActive ? (
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
          ) : (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <div className="text-center space-y-4">
                <Camera className="w-24 h-24 text-gray-400 mx-auto" />
              </div>
            </div>
          )}

          {/* Recognition Overlay */}
          {isRecognizing && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="text-center space-y-4 text-white">
                <Loader2 className="w-16 h-16 animate-spin mx-auto" />
                <p className="text-xl">Recognizing trash...</p>
                <p className="text-sm text-gray-300">AI model analyzing</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {!cameraActive ? (
            <>
              <Button
                onClick={startCameraRecognition}
                className="bg-green-600 hover:bg-green-700 flex items-center justify-center space-x-2"
                disabled={isRecognizing}
              >
                <Camera className="w-5 h-5" />
                <span>Open Camera Recognition</span>
              </Button>

              {checkFileUploadSupport() && (
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="flex items-center justify-center space-x-2"
                  disabled={isRecognizing}
                >
                  <Upload className="w-5 h-5" />
                  <span>Upload Image Recognition</span>
                </Button>
              )}
            </>
          ) : (
            <>
              <Button
                onClick={captureAndRecognize}
                className="bg-green-600 hover:bg-green-700"
                disabled={isRecognizing}
              >
                Capture and Recognize
              </Button>
              <Button
                onClick={stopCamera}
                variant="outline"
                disabled={isRecognizing}
              >
                Close Camera
              </Button>
            </>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          style={{ display: "none" }}
        />

        {/* Instructions */}
        <div className="text-gray-600">
          <p>
            Supports real-time camera recognition and image upload recognition
          </p>
          <p className="text-sm">
            Recognition accuracy may vary due to lighting and angle
          </p>
        </div>

        {/* Back Button */}
        <Button
          onClick={onReset}
          variant="outline"
          className="border-green-600 text-green-600 hover:bg-green-50"
        >
          Return to Home
        </Button>
      </div>

      {/* Recognition Result Dialog */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-center">
              Recognition Complete
            </DialogTitle>
            <DialogDescription className="text-center pt-4">
              <div className="space-y-4">
                <div className="bg-green-50 rounded-lg p-6 space-y-3">
                  <p className="text-3xl font-bold">{recognizedItem?.name}</p>
                  <p
                    className={`text-xl font-semibold ${getCategoryColor(
                      recognizedItem?.category || ""
                    )}`}
                  >
                    {recognizedItem?.category}
                  </p>
                  {predictions.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm text-gray-600">
                        Confidence:{" "}
                        {Math.round(predictions[0].confidence * 100)}%
                      </p>
                      {predictions.length > 1 && (
                        <div className="text-xs text-gray-500">
                          <p>Other possible classifications:</p>
                          {predictions.slice(1, 3).map((pred, index) => (
                            <p key={index}>
                              {pred.chineseName} -{" "}
                              {Math.round(pred.confidence * 100)}%
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              onClick={handleRecognizeAgain}
              variant="outline"
              className="flex-1 sm:flex-none border-gray-300"
            >
              Recognize Again
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700"
            >
              Confirm Classification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
