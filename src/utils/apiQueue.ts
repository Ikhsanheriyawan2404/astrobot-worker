type Task<T> = {
  fn: () => Promise<T>;
  resolve: (v: T) => void;
  reject: (e: any) => void;
};

class RateLimiter {
  private intervalMs: number;
  private queue: Task<any>[] = [];
  private running = false;
  private lastRun = 0;

  constructor(intervalMs = 1000) {
    this.intervalMs = intervalMs;
  }

  enqueue<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.runLoop();
    });
  }

  private async runLoop() {
    if (this.running) return;
    this.running = true;

    while (this.queue.length > 0) {
      const task = this.queue.shift()!;

      // respect interval between calls
      const now = Date.now();
      const since = now - this.lastRun;
      const wait = Math.max(0, this.intervalMs - since);
      if (wait > 0) {
        await new Promise((r) => setTimeout(r, wait));
      }

      try {
        const res = await task.fn();
        this.lastRun = Date.now();
        task.resolve(res);
      } catch (err) {
        this.lastRun = Date.now();
        task.reject(err);
      }
    }

    this.running = false;
  }
}

const limiters = new Map<string, RateLimiter>();

const getLimiter = (key: string, intervalMs = 1000) => {
  if (!limiters.has(key)) {
    limiters.set(key, new RateLimiter(intervalMs));
  }
  return limiters.get(key)!;
};

/**
 * Enqueue a function to be executed under a per-key rate limit.
 * Default is 1000ms between executions for the same key.
 */
export const enqueueApiCall = <T>(key: string, fn: () => Promise<T>, intervalMs = 1000): Promise<T> => {
  const limiter = getLimiter(key, intervalMs);
  return limiter.enqueue(fn);
};

export const callPrayerApi = <T>(fn: () => Promise<T>) => enqueueApiCall('prayer', fn, 1000);
export const callWeatherApi = <T>(fn: () => Promise<T>) => enqueueApiCall('weather', fn, 1000);

export default { enqueueApiCall, callPrayerApi, callWeatherApi };
