/* eslint-disable @typescript-eslint/no-explicit-any */

export type WorkerHandlerCallbacks = {
  loading?: (data: string) => void;
  initiate?: (data: string) => void;
  progress?: (data: string) => void;
  done?: (data: string) => void;
  update?: (data: any) => void;
  ready?: (data: any) => void;
  start: (data: any) => void;
  complete?: (data: any) => void;
  error?: (data: any) => void;
};

type GenFnType = {
  messages: string[];
  reasonEnabled: boolean;
};

// Create a Worker context handler
export class WebGPUHandler {
  private hasGpu: boolean = false;
  constructor(
    private readonly worker: Worker,
    protected callbacks: WorkerHandlerCallbacks
  ) {}

  isValid(worker: Worker) {
    return this.worker === worker;
  }

  listeners = (e: MessageEvent) => {
    const data = e.data;
    const status = e.data.status as keyof WorkerHandlerCallbacks;
    try {
      const a = this.callbacks[status];
      if (a) a(data);
    } catch (error) {
      this.worker.postMessage({
        status: "error",
        data: error instanceof Error ? error.toString() : "Unknown error",
      });
    }
  };
  onErrorListener(e: ErrorEvent) {
    console.error("Worker error:", e);
  }

  setupEventListener(): void {
    this.worker.addEventListener("message", this.listeners);
    this.worker.addEventListener("error", this.onErrorListener);
  }
  removeEventListeners(): void {
    this.worker.removeEventListener("message", this.listeners);
    this.worker.removeEventListener("error", this.onErrorListener);
  }

  interrupt() {
    if (!this.hasGpu) return;
    this.worker.postMessage({ type: "interrupt" });
  }
  generate(data: GenFnType) {
    if (!this.hasGpu) return;
    this.worker.postMessage({ type: "generate", data });
  }

  async checkGpu() {
    const adapter = await (navigator as any).gpu.requestAdapter();
    if (!adapter) {
      this.hasGpu = false;
      throw new Error("WebGPU is not supported (no adapter found)");
    }
    // fp16_supported = adapter.features.has("shader-f16")
    this.hasGpu = true;
    return adapter;
  }
  async loadModel() {
    if (!this.hasGpu) return;
    this.worker.postMessage({ type: "load" });
  }
  reset() {
    if (!this.hasGpu) return;
    this.worker.postMessage({ type: "reset" });
  }

  async isCompatible() {
    return this.hasGpu;
  }
}
