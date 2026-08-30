import { AKNO_STORAGE_KEYS } from "@/lib/persistence";

/** Clés synchronisées cloud + localStorage */
export const DATA_BUCKET_KEYS = Object.values(AKNO_STORAGE_KEYS);

export type DataBucketKey = (typeof DATA_BUCKET_KEYS)[number];
