/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from "react";
import { WebGPUHandler } from "./WebGPUHandler";

type UserWorkerHandlerOptions = {
  autoload: boolean;
};

type GenFnType = {
  messages: { role: string; content: string }[];
  reasonEnabled: boolean;
};

type ProgressItemType = {
  status: string;
  name: string;
  file: string;
  progress: number;
  loaded: number;
  total: number;
};

export const useWebGpuHandler = (
  options: UserWorkerHandlerOptions = { autoload: true }
) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isCompatible, setIsCompatible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const workerHandlerRef = useRef<any>(null);

  // Model loading and progress
  const [error, setError] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [progressItems, setProgressItems] = useState<ProgressItemType[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Inputs and outputs
  const [message, setMessage] = useState<{ id: string; text: string }>({
    id: "",
    text: "",
  });
  const [messageId, setMessageId] = useState("");

  const callbacks = useMemo(() => {
    return {
      loading: (data: any) => {
        setIsLoading(true);
        setLoadingMessage(data.data);
      },
      initiate: (data: any) => {
        setProgressItems((prev: any) => [...prev, data]);
      },
      done: (data: any) => {
        setProgressItems((prev: any) =>
          prev.filter((item: any) => item.file !== data.file)
        );
      },
      ready: () => {
        setIsLoading(false);
        setIsLoaded(true);
      },
      progress: (data: any) => {
        setProgressItems((prev: any) =>
          prev.map((item: any) => {
            if (item.file === data.file) {
              return { ...item, ...data };
            }
            return item;
          })
        );
      },
      start: () => {
        setIsRunning(true);
        setMessage({ id: "", text: "" });
      },
      update: (data: any) => {
        const { output } = data;

        if (output)
          setMessage((prev) => {
            return { id: messageId, text: prev.text + output };
          });
      },
      complete: () => {
        setIsRunning(false);
        setMessageId("");
      },
      error: (data: any) => {
        setError(data.data);
        setMessageId("");
      },
    };
  }, [messageId]);

  useEffect(() => {
    if (workerHandlerRef.current) return;
    const worker = new Worker(new URL("./worker.js", import.meta.url), {
      type: "module",
    });

    workerHandlerRef.current = new WebGPUHandler(worker, callbacks);
  }, [callbacks, messageId]);

  const load = async () => {
    const workerHandler = workerHandlerRef.current;
    setIsLoading(true);
    try {
      await workerHandler.loadModel();
      workerHandler.setupEventListener();
      setIsLoaded(true);
    } catch {
      console.log("fail loading local model with worker");
    }
  };
  const reset = async () => {
    workerHandlerRef.current.reset();
  };

  useEffect(() => {
    (async () => {
      const workerHandler = workerHandlerRef.current;
      try {
        setIsLoading(true);
        await workerHandler.checkGpu();
        const isCom = await workerHandler.isCompatible();
        if (isCom) {
          setIsCompatible(true);
          if (options.autoload) load();
        }
      } catch {
        console.log("error setup local model with worker");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [options.autoload]);

  const generate = (
    message: string,
    id: string,
    options?: { reason: boolean }
  ) => {
    const data: GenFnType = {
      messages: [{ role: "user", content: message }], // this must be an array
      reasonEnabled: options?.reason || false,
    };
    setMessageId(id);
    workerHandlerRef.current.generate(data);
  };

  const stop = () => {
    workerHandlerRef.current.interrupt();
  };

  return {
    isLoading,
    isLoaded,
    isCompatible,
    load,
    reset,
    generate,
    stop,
    error,
    loadingMessage,
    progressItems,
    isRunning,
    message,
    messageId,
  };
};
