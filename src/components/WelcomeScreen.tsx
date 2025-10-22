import React from "react";
import { Button } from "./ui/button";
import { Leaf } from "lucide-react";

interface WelcomeScreenProps {
  onStartRecognition: () => void;
}

export function WelcomeScreen({ onStartRecognition }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="text-center space-y-8 max-w-lg">
        {/* Logo Icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-green-600 rounded-full p-6 shadow-lg">
            <Leaf className="w-16 h-16 text-white" />
          </div>
        </div>

        {/* Welcome Text */}
        <div className="space-y-3">
          <h1 className="text-green-800">Welcome Trash & Treasure Simulator</h1>

          <p className="text-gray-600 max-w-md mx-auto">
            Using AI recognition technology to help you correctly classify trash
            and earn eco-friendly badge rewards
          </p>
        </div>

        {/* Start Button */}
        <div className="pt-6">
          <Button
            onClick={onStartRecognition}
            className="bg-green-600 hover:bg-green-700 text-white px-12 py-6 shadow-lg hover:shadow-xl transition-all"
            size="lg"
          >
            Dispose Trash
          </Button>
        </div>

        {/* Info */}
        <div className="pt-8 text-gray-500 space-y-1">
          <p>Please place the trash in front of the camera for recognition</p>
          <p>The system will automatically recognize and classify</p>
        </div>
      </div>
    </div>
  );
}
