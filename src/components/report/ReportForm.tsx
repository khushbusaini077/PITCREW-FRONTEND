"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { LocationPicker } from "@/components/map/DynamicMap";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/States";
import { errorField, isClientRejection } from "@/lib/api/errorMessages";
import { round6, type Coord } from "@/lib/geo";
import type { RoadClass } from "@/lib/types/models";
import { useConfig, useWards } from "@/features/dashboard/queries";
import { configNumber, useOnline } from "@/features/shared/hooks";
import { TEXT_MAX, validateReport, type ReportErrors } from "@/features/report/validation";
import { useSubmitComplaint } from "@/features/report/useSubmitComplaint";
import { ResultCard } from "./ResultCard";

const ROAD_OPTIONS: { value: RoadClass | ""; label: string }[] = [
  { value: "", label: "Not sure" },
  { value: "main", label: "Main road" },
  { value: "secondary", label: "Secondary road" },
  { value: "lane", label: "Lane" },
];

const inputCls = "mt-1 w-full border border-slate-300 bg-white px-3 py-2 text-base aria-[invalid=true]:border-red-500";

export function ReportForm() {
  const online = useOnline();
  const config = useConfig();
  const wards = useWards();
  const submit = useSubmitComplaint();
  const maxPhotoMb = configNumber(config.data, "MAX_PHOTO_MB", 5);

  const [text, setText] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [roadClass, setRoadClass] = useState<RoadClass | "">("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [errors, setErrors] = useState<ReportErrors>({});
  const [geoMessage, setGeoMessage] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [accuracy, setAccuracy] = useState<number | null>(null); // only set by "Use my location"
  const requestId = useRef<string>(crypto.randomUUID());
  const fileRef = useRef<HTMLInputElement>(null);

  const previewUrl = useMemo(() => (photo ? URL.createObjectURL(photo) : null), [photo]);
  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const picked: Coord | null = useMemo(() => {
    const a = Number(lat);
    const b = Number(lng);
    return lat.trim() !== "" && lng.trim() !== "" && Number.isFinite(a) && Number.isFinite(b) ? { lat: a, lng: b } : null;
  }, [lat, lng]);

  const setCoord = (c: Coord, acc: number | null = null) => {
    setAccuracy(acc); // a hand-picked point has no GPS accuracy
    setLat(c.lat.toFixed(6));
    setLng(c.lng.toFixed(6));
    setErrors((e) => ({ ...e, lat: undefined, lng: undefined }));
  };

  const useMyLocation = () => {
    setGeoMessage(null);
    if (!("geolocation" in navigator)) return setGeoMessage("This browser does not support location. Pick a point on the map instead.");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        setCoord({ lat: round6(pos.coords.latitude), lng: round6(pos.coords.longitude) }, pos.coords.accuracy);
      },
      (err) => {
        setLocating(false);
        setGeoMessage(
          err.code === err.PERMISSION_DENIED
            ? "Location permission was denied. Pick a point on the map instead."
            : "Could not determine your location. Pick a point on the map instead.",
        );
      },
      { enableHighAccuracy: true, timeout: 15_000 },
    );
  };

  const doSubmit = () => {
    const found = validateReport({ text, lat, lng, photo }, maxPhotoMb);
    setErrors(found);
    if (Object.keys(found).length > 0 || submit.isPending) return;
    submit.mutate(
      { clientRequestId: requestId.current, text: text.trim(), lat: Number(lat), lng: Number(lng), gpsAccuracyM: accuracy, roadClass: roadClass === "" ? null : roadClass, photo },
      // A server rejection means this request id is "used up" for this content: use a fresh one next time.
      { onError: (err) => isClientRejection(err) && (requestId.current = crypto.randomUUID()) },
    );
  };

  const onSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    doSubmit();
  };

  const reset = () => {
    submit.reset();
    setText("");
    setLat("");
    setLng("");
    setRoadClass("");
    setPhoto(null);
    setAccuracy(null);
    setErrors({});
    if (fileRef.current) fileRef.current.value = "";
    requestId.current = crypto.randomUUID();
  };

  if (submit.isSuccess) return <ResultCard result={submit.data} onReset={reset} />;

  const serverField = errorField(submit.error);
  const fieldErr = (name: keyof ReportErrors) => errors[name] ?? (serverField === name ? "Rejected by the server. Please review this field." : undefined);

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div>
        <label htmlFor="text" className="text-lg">
          Describe the problem
        </label>
        <textarea
          id="text"
          rows={4}
          value={text}
          maxLength={TEXT_MAX}
          onChange={(e) => setText(e.target.value)}
          aria-invalid={Boolean(fieldErr("text"))}
          aria-describedby="text-help"
          className={inputCls}
          placeholder="Size, depth, anything dangerous nearby…"
        />
        <p id="text-help" className={`mt-1 text-sm ${fieldErr("text") ? "text-red-700" : "text-slate-500"}`}>
          {fieldErr("text") ?? `${text.trim().length}/${TEXT_MAX} characters, at least 5.`}
        </p>
      </div>

      <div>
        <label htmlFor="photo" className="text-lg">
          Photo <span className="font-normal text-slate-500">(optional)</span>
        </label>
        <input
          id="photo"
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
          aria-invalid={Boolean(fieldErr("photo"))}
          className="mt-1 block w-full text-sm file:mr-3 file:rounded-sm file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-white"
        />
        <p className={`mt-1 text-sm ${fieldErr("photo") ? "text-red-700" : "text-slate-500"}`}>{fieldErr("photo") ?? `JPEG, PNG or WebP, up to ${maxPhotoMb} MB.`}</p>
        {previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- local blob preview, not optimizable
          <img src={previewUrl} alt="Selected photo preview" className="mt-2 h-32 rounded-sm border border-slate-200 object-cover" />
        )}
      </div>

      <fieldset>
        <legend className="text-lg">Location</legend>
        <div className="mt-2 h-64 overflow-hidden rounded-sm border border-slate-300">
          {wards.isPending ? <Skeleton className="h-full w-full" /> : <LocationPicker value={picked} onChange={(c) => setCoord(c)} wards={wards.data ?? []} />}
        </div>
        {wards.isError && <p className="mt-1 text-sm text-slate-600">Ward boundaries could not be loaded, but you can still pick a point or use your location.</p>}
        <p className="mt-1 text-sm text-slate-500">Tap the map to drop a pin, or use your location.</p>
        <button type="button" onClick={useMyLocation} disabled={locating} className="mt-2 rounded-sm border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-100 disabled:opacity-60">
          {locating ? "Finding you…" : "Use my location"}
        </button>
        {geoMessage && (
          <p role="alert" className="mt-1 text-sm text-red-700">
            {geoMessage}
          </p>
        )}
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="lat" className="text-sm font-medium">
              Latitude
            </label>
            <input id="lat" inputMode="decimal" value={lat} onChange={(e) => {
              setLat(e.target.value);
              setAccuracy(null);
            }} aria-invalid={Boolean(fieldErr("lat"))} className={inputCls} />
            {fieldErr("lat") && <p className="mt-1 text-sm text-red-700">{fieldErr("lat")}</p>}
          </div>
          <div>
            <label htmlFor="lng" className="text-sm font-medium">
              Longitude
            </label>
            <input id="lng" inputMode="decimal" value={lng} onChange={(e) => {
              setLng(e.target.value);
              setAccuracy(null);
            }} aria-invalid={Boolean(fieldErr("lng"))} className={inputCls} />
            {fieldErr("lng") && <p className="mt-1 text-sm text-red-700">{fieldErr("lng")}</p>}
          </div>
        </div>
      </fieldset>

      <div>
        <label htmlFor="road" className="text-lg">
          Road type
        </label>
        <select id="road" value={roadClass} onChange={(e) => setRoadClass(e.target.value as RoadClass | "")} className={inputCls}>
          {ROAD_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {submit.isError && (
        <ErrorState error={submit.error} onRetry={doSubmit} />
      )}
      {!online && <p role="alert" className="text-sm text-slate-700">You are offline. Submit again once you are back online.</p>}

      <button type="submit" disabled={!online || submit.isPending} className="w-full rounded-sm btn-grad px-4 py-3 text-base font-medium text-white  disabled:opacity-60">
        {submit.isPending ? "Submitting…" : "Submit report"}
      </button>
      <p className="text-xs text-slate-500">No name, phone or email is collected.</p>
    </form>
  );
}
