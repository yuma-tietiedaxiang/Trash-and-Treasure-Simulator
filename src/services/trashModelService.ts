import * as tf from "@tensorflow/tfjs";

export interface TrashPrediction {
  label: string;
  confidence: number;
  chineseName: string;
  chineseCategory: string;
}

export class TrashModelService {
  private model: tf.LayersModel | null = null;
  private isLoaded = false;
  private labels: string[] = [];

  // Model label mapping to English names and categories
  private labelMapping: Record<string, { name: string; category: string }> = {
    coffee_cups: { name: "Coffee Cup", category: "Coffee Cup" },
    refundable_10c: {
      name: "Refundable Bottle",
      category: "Refundable Bottle",
    },
    landfill: { name: "Landfill", category: "Landfill" },
    mixed_recycling: { name: "Mixed Recycling", category: "Mixed Recycling" },
    paper_cardboard: { name: "Paper Cardboard", category: "Paper Cardboard" },
    food: { name: "Food Waste", category: "Food Waste" },
  };

  async loadModel(): Promise<void> {
    try {
      console.log("Starting to load trash recognition model...");

      // Load model from public directory
      const modelUrl = "/model.json";
      this.model = await tf.loadLayersModel(modelUrl);

      // Get label information from metadata.json
      const metadataResponse = await fetch("/metadata.json");
      const metadata = await metadataResponse.json();
      this.labels = metadata.labels || [];

      console.log("Model loaded successfully, labels:", this.labels);
      this.isLoaded = true;
    } catch (error) {
      console.error("Model loading failed:", error);
      throw new Error("Unable to load trash recognition model");
    }
  }

  async predict(
    imageElement: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement
  ): Promise<TrashPrediction[]> {
    if (!this.model || !this.isLoaded) {
      throw new Error("Model not loaded yet");
    }

    try {
      // Preprocess image - resize to 224x224
      const tensor = tf.browser
        .fromPixels(imageElement)
        .resizeNearestNeighbor([224, 224])
        .expandDims(0)
        .div(255.0);

      // Perform prediction
      const predictions = this.model.predict(tensor) as tf.Tensor;
      const predictionsArray = await predictions.data();

      // Clean up tensor
      tensor.dispose();
      predictions.dispose();

      // Process prediction results
      const results: TrashPrediction[] = [];

      for (let i = 0; i < this.labels.length; i++) {
        const label = this.labels[i];
        const confidence = predictionsArray[i];
        const mapping = this.labelMapping[label];

        if (mapping) {
          results.push({
            label,
            confidence,
            chineseName: mapping.name,
            chineseCategory: mapping.category,
          });
        }
      }

      // Sort by confidence
      results.sort((a, b) => b.confidence - a.confidence);

      return results;
    } catch (error) {
      console.error("Prediction failed:", error);
      throw new Error("Image recognition failed");
    }
  }

  async predictFromFile(file: File): Promise<TrashPrediction[]> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = async () => {
        try {
          const results = await this.predict(img);
          resolve(results);
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = () => reject(new Error("Unable to load image file"));
      img.src = URL.createObjectURL(file);
    });
  }

  isModelLoaded(): boolean {
    return this.isLoaded;
  }

  getLabels(): string[] {
    return [...this.labels];
  }

  getLabelMapping(): Record<string, { name: string; category: string }> {
    return { ...this.labelMapping };
  }
}

// Create singleton instance
export const trashModelService = new TrashModelService();
