"use client";
import { useRef, useState, useCallback } from "react";

export interface Task<T> {
  action: () => void;
}

export const useTaskQueue = <T>() => {
  const taskQueue = useRef<Task<T>[]>([]);
  const isProcessing = useRef(false);

  const [queue, setQueue] = useState<Task<T>[]>([]);

  const processQueue = useCallback(async () => {
    if (isProcessing.current || !taskQueue.current.length) return;
    isProcessing.current = true;

    while (taskQueue.current.length > 0) {
      const { action } = taskQueue.current.shift()!;

      await new Promise<void>((resolve) => {
        action();
        resolve();
      });
    }

    isProcessing.current = false;
  }, []);

  const enqueueTask = (action: () => void, delay = 5000) => {
    const timerId = setTimeout(() => {
      taskQueue.current.push({ action });
      setQueue([...taskQueue.current]); // Update state to reflect the queue's current state
      if (!isProcessing.current) {
        processQueue();
      }
    }, delay);

    return timerId;
  };

  return { queue, enqueueTask, processQueue };
};
