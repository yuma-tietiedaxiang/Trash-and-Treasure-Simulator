import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { trashModelService } from "../services/trashModelService";

export function ModelTestComponent() {
  const [modelStatus, setModelStatus] = useState<
    "loading" | "loaded" | "error"
  >("loading");
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    testModelLoading();
  }, []);

  const testModelLoading = async () => {
    try {
      setModelStatus("loading");
      await trashModelService.loadModel();
      setModelStatus("loaded");
      setTestResults((prev) => [...prev, "✅ Model loaded successfully"]);

      // Test model information
      const labels = trashModelService.getLabels();
      const mapping = trashModelService.getLabelMapping();

      setTestResults((prev) => [
        ...prev,
        `📋 Model labels: ${labels.join(", ")}`,
      ]);
      setTestResults((prev) => [
        ...prev,
        `🗂️ Label mapping: ${Object.keys(mapping).length} categories`,
      ]);
    } catch (error) {
      setModelStatus("error");
      setTestResults((prev) => [...prev, `❌ Model loading failed: ${error}`]);
    }
  };

  const testImageProcessing = () => {
    // Create a test image
    const canvas = document.createElement("canvas");
    canvas.width = 224;
    canvas.height = 224;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      // Draw a simple test image
      ctx.fillStyle = "#ff0000";
      ctx.fillRect(0, 0, 224, 224);
      ctx.fillStyle = "#ffffff";
      ctx.font = "20px Arial";
      ctx.fillText("TEST", 100, 120);

      setTestResults((prev) => [...prev, "🎨 Test image created successfully"]);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">AI Model Integration Test</h2>

      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <span className="font-medium">Model Status:</span>
          <span
            className={`px-2 py-1 rounded text-sm ${
              modelStatus === "loaded"
                ? "bg-green-100 text-green-800"
                : modelStatus === "loading"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {modelStatus === "loaded"
              ? "Loaded"
              : modelStatus === "loading"
              ? "Loading"
              : "Error"}
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <Button onClick={testModelLoading} disabled={modelStatus === "loading"}>
          Retest Model Loading
        </Button>
        <Button onClick={testImageProcessing} variant="outline">
          Test Image Processing
        </Button>
        <Button onClick={clearResults} variant="outline">
          Clear Results
        </Button>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium mb-2">Test Results:</h3>
        <div className="space-y-1">
          {testResults.length === 0 ? (
            <p className="text-gray-500">No test results yet</p>
          ) : (
            testResults.map((result, index) => (
              <p key={index} className="text-sm">
                {result}
              </p>
            ))
          )}
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>
          This test component is used to verify if the AI model integration is
          working properly.
        </p>
        <p>
          Model file location: <code>public/trash-categorise-model/</code>
        </p>
      </div>
    </div>
  );
}
