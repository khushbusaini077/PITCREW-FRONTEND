import { ApiError, ConfigError } from "./client";

/** Maps error.code to user text. Never inspects error.message. */
export function describeError(err: unknown): string {
  if (err instanceof ConfigError) return err.message;
  if (!(err instanceof ApiError)) return "Something went wrong. Please try again.";
  switch (err.code) {
    case "NETWORK_ERROR":
      return "Cannot reach the server. Check your connection and retry.";
    case "TIMEOUT":
      return "The server took too long to respond. It may still be waking up, so retry in a moment.";
    case "VALIDATION_ERROR":
      return "Some details are invalid. Check the highlighted fields and try again.";
    case "OUTSIDE_SERVICE_AREA":
      return "This location is outside the service area. Pick a point inside the ward boundaries on the map.";
    case "PHOTO_TOO_LARGE":
      return "The photo is too large. Choose a smaller image.";
    case "UNSUPPORTED_MEDIA_TYPE":
      return "Unsupported photo format. Use JPEG, PNG or WebP.";
    case "RATE_LIMITED":
      return "Too many submissions in a short time. Wait a minute and retry.";
    case "DB_UNAVAILABLE":
      return "The database is temporarily unavailable. Retry shortly.";
    case "ALREADY_FIXED":
      return "This pothole was already marked as fixed. The list has been refreshed.";
    case "NOT_FOUND":
      return "The requested item was not found.";
    case "UNAUTHORIZED":
      return "The crew key is missing or wrong. Enter it again.";
    case "FORBIDDEN":
      return "This key belongs to a different crew. Enter the key for this crew.";
    case "BAD_REQUEST":
      return "The request was malformed.";
    case "INTERNAL_ERROR":
      return `The server hit an unexpected error.${err.requestId ? ` Reference: ${err.requestId}` : ""}`;
    default:
      return `Request failed (${err.code}).`;
  }
}

/** Field name reported by the server in error.details.field, for highlighting. */
export function errorField(err: unknown): string | null {
  if (err instanceof ApiError && err.details && typeof err.details.field === "string") return err.details.field;
  return null;
}

/** True when the server answered with a 4xx, i.e. the same request would fail again unchanged. */
export const isClientRejection = (err: unknown): boolean => err instanceof ApiError && err.status >= 400 && err.status < 500;
