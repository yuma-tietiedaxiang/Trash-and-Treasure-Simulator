export class CameraUtils {
  private stream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;

  async initializeCamera(videoElement: HTMLVideoElement): Promise<void> {
    try {
      console.log("Starting camera initialization...");

      // Check if in secure context
      if (!window.isSecureContext) {
        throw new Error("Camera needs to be used in HTTPS environment");
      }

      // Check browser support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Your browser does not support camera functionality");
      }

      // Try to get camera permission
      console.log("Requesting camera permission...");

      // First try rear camera
      let constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "environment",
        },
      };

      try {
        this.stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log("Successfully obtained rear camera");
      } catch (environmentError) {
        console.log("Rear camera unavailable, trying front camera...");

        // If rear camera fails, try front camera
        constraints = {
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user",
          },
        };

        try {
          this.stream = await navigator.mediaDevices.getUserMedia(constraints);
          console.log("Successfully obtained front camera");
        } catch (userError) {
          console.log("Front camera also failed, trying default camera...");

          // Finally try default camera
          constraints = {
            video: {
              width: { ideal: 640 },
              height: { ideal: 480 },
            },
          };

          this.stream = await navigator.mediaDevices.getUserMedia(constraints);
          console.log("Successfully obtained default camera");
        }
      }

      this.videoElement = videoElement;
      videoElement.srcObject = this.stream;

      // Wait for video to load
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Video loading timeout"));
        }, 10000); // 10 second timeout

        videoElement.onloadedmetadata = () => {
          clearTimeout(timeout);
          videoElement
            .play()
            .then(() => {
              console.log("Video playback started");
              resolve(void 0);
            })
            .catch(reject);
        };

        videoElement.onerror = (error) => {
          clearTimeout(timeout);
          console.error("Video loading error:", error);
          reject(new Error("Video loading failed"));
        };
      });

      console.log("Camera initialization successful");
    } catch (error) {
      console.error("Camera initialization failed:", error);

      // Provide more detailed error information
      let errorMessage = "Unable to access camera";

      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          errorMessage =
            "Camera permission denied, please allow camera access in browser settings";
        } else if (error.name === "NotFoundError") {
          errorMessage = "Camera device not found";
        } else if (error.name === "NotReadableError") {
          errorMessage = "Camera is occupied by another application";
        } else if (error.name === "OverconstrainedError") {
          errorMessage = "Camera does not support the requested configuration";
        } else if (error.message.includes("HTTPS")) {
          errorMessage =
            "Camera needs to be used in HTTPS environment, please use secure connection";
        } else {
          errorMessage = `Camera initialization failed: ${error.message}`;
        }
      }

      throw new Error(errorMessage);
    }
  }

  captureImage(): HTMLCanvasElement | null {
    if (!this.videoElement) {
      throw new Error("Camera not initialized");
    }

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Unable to create canvas context");
    }

    // Set canvas size same as video
    canvas.width = this.videoElement.videoWidth;
    canvas.height = this.videoElement.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);

    return canvas;
  }

  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null;
      this.videoElement = null;
    }
  }

  isInitialized(): boolean {
    return this.stream !== null && this.videoElement !== null;
  }

  getVideoElement(): HTMLVideoElement | null {
    return this.videoElement;
  }
}

// Check if browser supports camera
export function checkCameraSupport(): { supported: boolean; reason?: string } {
  // Check basic support
  if (!navigator.mediaDevices) {
    return {
      supported: false,
      reason: "Browser does not support MediaDevices API",
    };
  }

  if (!navigator.mediaDevices.getUserMedia) {
    return {
      supported: false,
      reason: "Browser does not support getUserMedia",
    };
  }

  // Check if in secure context
  if (!window.isSecureContext) {
    return {
      supported: false,
      reason: "Need to use camera in HTTPS environment",
    };
  }

  return { supported: true };
}

// Check if browser supports file upload
export function checkFileUploadSupport(): boolean {
  return !!(window.File && window.FileReader && window.FileList && window.Blob);
}
