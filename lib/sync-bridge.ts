type BucketWriter = (key: string, json: string) => Promise<void>;

let bucketWriter: BucketWriter | null = null;

export function registerBucketWriter(fn: BucketWriter | null) {
  bucketWriter = fn;
}

export function hasBucketWriter() {
  return bucketWriter != null;
}

export async function writeBucket(key: string, json: string) {
  if (typeof window === "undefined") return;

  if (bucketWriter) {
    await bucketWriter(key, json);
    return;
  }

  localStorage.setItem(key, json);
  window.dispatchEvent(new CustomEvent("akno:storage-updated", { detail: { key } }));
}
