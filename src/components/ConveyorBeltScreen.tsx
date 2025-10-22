import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Package, ArrowRight } from "lucide-react";

interface ConveyorBeltScreenProps {
  category: string;
  onComplete: () => void;
}

export function ConveyorBeltScreen({
  category,
  onComplete,
}: ConveyorBeltScreenProps) {
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);

  useEffect(() => {
    // Simulate conveyor belt animation, show completion dialog after 3 seconds
    const timer = setTimeout(() => {
      setShowCompletionDialog(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const getBinColor = (category: string) => {
    switch (category) {
      case "Coffee Cup":
        return "bg-black";
      case "Refundable Bottle":
        return "bg-purple-600";
      case "Landfill":
        return "bg-red-600";
      case "Mixed Recycling":
        return "bg-gray-200 border-2 border-gray-400";
      case "Paper Cardboard":
        return "bg-blue-600";
      case "Food Waste":
        return "bg-pink-600";
      default:
        return "bg-gray-500";
    }
  };

  const getTextColor = (category: string) => {
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="text-center space-y-12 max-w-3xl w-full">
        {/* Status Text */}
        <div className="space-y-2">
          <h2 className="text-green-700">
            Trash is moving on the conveyor belt
          </h2>
          <p className="text-xl text-gray-600">
            Heading to{" "}
            <span className={`${getTextColor(category)} font-semibold`}>
              {category}
            </span>{" "}
            bin...
          </p>
        </div>

        {/* Conveyor Belt Animation */}
        <div className="relative py-12">
          {/* Conveyor Belt */}
          <div className="bg-gray-300 h-24 rounded-lg relative overflow-hidden">
            {/* Belt Pattern */}
            <div className="absolute inset-0 flex items-center">
              <div className="conveyor-pattern h-1 bg-gray-400 w-full"></div>
            </div>

            {/* Moving Package */}
            <div className="absolute inset-y-0 left-0 flex items-center animate-package-move">
              <div className="bg-amber-100 border-2 border-amber-600 rounded-lg p-4 shadow-lg">
                <Package className="w-12 h-12 text-amber-600" />
              </div>
            </div>
          </div>

          {/* Destination Bin */}
          <div className="absolute -right-12 top-1/2 -translate-y-1/2 z-10">
            <div
              className={`${getBinColor(category)} rounded-lg p-6 shadow-xl`}
            >
              <div
                className={`text-center space-y-1 ${
                  category === "Mixed Recycling"
                    ? "text-gray-600"
                    : "text-white"
                }`}
              >
                <div className="text-3xl">🗑️</div>
                <p className="text-xs whitespace-nowrap font-medium">
                  {category}
                </p>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="absolute right-24 top-1/2 -translate-y-1/2">
            <ArrowRight className="w-8 h-8 text-green-600 animate-pulse" />
          </div>
        </div>

        {/* Loading Indicator */}
        <div className="flex justify-center items-center space-x-2 text-gray-500">
          <div
            className="w-2 h-2 bg-green-600 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          ></div>
          <div
            className="w-2 h-2 bg-green-600 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          ></div>
          <div
            className="w-2 h-2 bg-green-600 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          ></div>
        </div>

        <p className="text-gray-500">Conveying, please wait...</p>
      </div>

      {/* Completion Dialog */}
      <Dialog
        open={showCompletionDialog}
        onOpenChange={setShowCompletionDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center"></DialogTitle>
            <DialogDescription className="text-center pt-4">
              <div className="space-y-4">
                <div className="text-6xl">🎉</div>
                <div className="space-y-2">
                  <p className="text-xl text-gray-800">
                    Trash disposal completed!
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-green-700">
                    Please click the button below to collect your eco-friendly
                    badge reward
                  </p>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={onComplete}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Confirm and Collect Reward
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes packageMove {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(calc(100vw - 200px));
          }
        }

        .animate-package-move {
          animation: packageMove 3s ease-in-out forwards;
        }

        .conveyor-pattern {
          background-image: repeating-linear-gradient(
            90deg,
            transparent,
            transparent 20px,
            #9ca3af 20px,
            #9ca3af 22px
          );
          animation: conveyorMove 1s linear infinite;
        }

        @keyframes conveyorMove {
          from {
            background-position: 0 0;
          }
          to {
            background-position: 22px 0;
          }
        }
      `}</style>
    </div>
  );
}
