import React, { useState } from "react";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { RecognitionScreen } from "./components/RecognitionScreen";
import { ConveyorBeltScreen } from "./components/ConveyorBeltScreen";
import { NFCScreen } from "./components/NFCScreen";

type Step = "welcome" | "recognition" | "conveyor" | "nfc";

export default function App() {
  const [currentStep, setCurrentStep] = useState<Step>("welcome");
  const [recognizedItem, setRecognizedItem] = useState<{
    name: string;
    category: string;
  } | null>(null);

  const handleStartRecognition = () => {
    setCurrentStep("recognition");
  };

  const handleConfirmClassification = (item: {
    name: string;
    category: string;
  }) => {
    setRecognizedItem(item);
    setCurrentStep("conveyor");
  };

  const handleConveyorComplete = () => {
    setCurrentStep("nfc");
  };

  const handleReset = () => {
    setCurrentStep("welcome");
    setRecognizedItem(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50">
      {currentStep === "welcome" && (
        <WelcomeScreen onStartRecognition={handleStartRecognition} />
      )}
      {currentStep === "recognition" && (
        <RecognitionScreen
          onConfirm={handleConfirmClassification}
          onReset={handleReset}
        />
      )}
      {currentStep === "conveyor" && recognizedItem && (
        <ConveyorBeltScreen
          category={recognizedItem.category}
          onComplete={handleConveyorComplete}
        />
      )}
      {currentStep === "nfc" && <NFCScreen />}
    </div>
  );
}
