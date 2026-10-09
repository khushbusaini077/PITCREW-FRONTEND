import { isValidLat, isValidLng } from "@/lib/geo";

export const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const TEXT_MIN = 5;
export const TEXT_MAX = 1000;

export interface ReportFields {
  text: string;
  lat: string;
  lng: string;
  photo: File | null;
}
export type ReportErrors = Partial<Record<"text" | "lat" | "lng" | "photo", string>>;

export function validateReport(f: ReportFields, maxPhotoMb: number): ReportErrors {
  const e: ReportErrors = {};
  const len = f.text.trim().length;
  if (len < TEXT_MIN || len > TEXT_MAX) e.text = `Description must be ${TEXT_MIN} to ${TEXT_MAX} characters (now ${len}).`;
  if (f.lat.trim() === "" || !isValidLat(Number(f.lat))) e.lat = "Enter a latitude between -90 and 90, or pick a point on the map.";
  if (f.lng.trim() === "" || !isValidLng(Number(f.lng))) e.lng = "Enter a longitude between -180 and 180, or pick a point on the map.";
  if (f.photo) {
    if (!ALLOWED_PHOTO_TYPES.includes(f.photo.type)) e.photo = "Photo must be a JPEG, PNG or WebP image.";
    else if (f.photo.size > maxPhotoMb * 1024 * 1024) e.photo = `Photo must be ${maxPhotoMb} MB or smaller.`;
  }
  return e;
}
