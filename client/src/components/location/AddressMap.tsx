"use client";

import { useEffect, useRef, useState } from "react";
import { Check, MapPin, Minus, Plus, Move, RotateCcw } from "lucide-react";
import type { Map as LeafletMap } from "leaflet";
import type { SavedLocation } from "@/types/user";
import { getMapTile } from "@/sevices/location.service";

type Point = SavedLocation["point"];

export default function AddressMap({
  point,
  onSelect,
  onEditingChange,
  needsAdjustment = false,
  disabled = false,
}: {
  point: Point;
  onSelect: (point: NonNullable<Point>) => void;
  onEditingChange: (editing: boolean) => void;
  needsAdjustment?: boolean;
  disabled?: boolean;
}) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [editing, setEditing] = useState(!point || needsAdjustment);
  const [canSelect, setCanSelect] = useState(!!point && !needsAdjustment);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (needsAdjustment) setEditing(true);
  }, [needsAdjustment]);

  useEffect(() => {
    let cancelled = false;
    let observer: ResizeObserver | undefined;
    setReady(false);
    setFailed(false);
    import("leaflet")
      .then((L) => {
        if (cancelled || !container.current) return;
        const reduced = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        const instance = L.map(container.current, {
          zoomControl: false,
          scrollWheelZoom: false,
          zoomAnimation: !reduced,
          fadeAnimation: !reduced,
          markerZoomAnimation: !reduced,
        });
        map.current = instance;
        // Nigeria is a map overview, never a default customer position.
        instance.setView(
          point ? [point.coordinates[1], point.coordinates[0]] : [9.08, 8.67],
          point ? (needsAdjustment ? 13 : 17) : 6,
        );
        instance.on("moveend", () => setCanSelect(instance.getZoom() >= 15));
        const requests = new Map<HTMLElement, AbortController>();
        // Leaflet image URLs cannot send our session header; fetch tiles through the HTTP service.
        const AuthenticatedTiles = L.GridLayer.extend({
          createTile: (
            coordinates: import("leaflet").Coords,
            done: import("leaflet").DoneCallback,
          ) => {
            const image = document.createElement("img");
            image.alt = "";
            const request = new AbortController();
            requests.set(image, request);
            getMapTile(
              coordinates.z,
              coordinates.x,
              coordinates.y,
              request.signal,
            )
              .then((blob) => {
                if (cancelled || request.signal.aborted) return;
                const source = URL.createObjectURL(blob);
                image.onload = () => {
                  URL.revokeObjectURL(source);
                  done(undefined, image);
                };
                image.onerror = () => {
                  URL.revokeObjectURL(source);
                  done(new Error("Map tile unavailable"), image);
                };
                image.src = source;
              })
              .catch(() => {
                if (!cancelled && !request.signal.aborted)
                  done(new Error("Map tile unavailable"), image);
              });
            return image;
          },
        }) as typeof L.GridLayer;
        const tiles = new AuthenticatedTiles({
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors · <a href="https://www.geoapify.com/">Geoapify</a>',
          maxZoom: 19,
          keepBuffer: 0,
          updateWhenIdle: true,
        });
        tiles.on("tileunload", (event) => {
          requests.get(event.tile)?.abort();
          requests.delete(event.tile);
        });
        tiles.addTo(instance);
        tiles.on("tileerror", () => {
          if (!cancelled) setFailed(true);
        });
        if (typeof ResizeObserver !== "undefined") {
          observer = new ResizeObserver(() => instance.invalidateSize());
          observer.observe(container.current);
        }
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      observer?.disconnect();
      map.current?.remove();
      map.current = null;
    };
    // The map is created once; selected points are synchronized below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retry]);

  useEffect(() => {
    onEditingChange(editing);
    const instance = map.current;
    if (!instance) return;
    if (editing && !disabled) {
      instance.dragging.enable();
      instance.keyboard.enable();
      instance.touchZoom.enable();
      instance.doubleClickZoom.enable();
    } else {
      instance.dragging.disable();
      instance.keyboard.disable();
      instance.touchZoom.disable();
      instance.doubleClickZoom.disable();
    }
  }, [editing, ready, onEditingChange, disabled]);

  useEffect(() => {
    if (point && map.current)
      map.current.setView(
        [point.coordinates[1], point.coordinates[0]],
        Math.max(map.current.getZoom(), needsAdjustment ? 13 : 16),
        { animate: false },
      );
  }, [point, ready]);

  return (
    <div className="relative isolate h-64 overflow-hidden bg-[#e5e9df] lg:h-full lg:min-h-[620px] [&_.leaflet-control-attribution]:text-[9px] [&_.leaflet-container]:font-sans">
      <div
        ref={container}
        role="region"
        aria-label="Address map. Use the adjust pin button to change your location."
        className="absolute inset-0 z-0 h-full w-full"
      />
      <div className="pointer-events-none absolute top-5 left-5 right-18 z-10">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/95 px-3.5 py-2 text-[10px] font-medium text-foodie-forest shadow-sm">
          <span className="size-1.5 rounded-full bg-foodie-action" />
          {editing ? "Move the map beneath the pin" : "Your selected location"}
        </span>
      </div>
      {(point || editing) && (
        <div className="pointer-events-none absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-full drop-shadow-lg">
          <MapPin
            size={46}
            fill="#c74724"
            color="white"
            strokeWidth={1.4}
            aria-hidden="true"
          />
        </div>
      )}
      <div className="absolute top-5 right-4 z-10 flex flex-col overflow-hidden rounded-xl border border-foodie-line bg-white shadow-sm">
        <button
          type="button"
          disabled={!ready || disabled}
          aria-label="Zoom in"
          onClick={() => map.current?.zoomIn()}
          className="grid size-10 place-items-center border-b border-foodie-line hover:bg-foodie-paper"
        >
          <Plus size={17} />
        </button>
        <button
          type="button"
          disabled={!ready || disabled}
          aria-label="Zoom out"
          onClick={() => map.current?.zoomOut()}
          className="grid size-10 place-items-center hover:bg-foodie-paper"
        >
          <Minus size={17} />
        </button>
      </div>
      {failed && (
        <div
          role="status"
          className="absolute top-19 left-4 right-16 z-10 rounded-xl bg-foodie-paper/95 p-3 text-[11px] leading-relaxed"
        >
          The map couldn’t load fully. You can still review your address.
          <button
            type="button"
            onClick={() => setRetry((value) => value + 1)}
            className="mt-2 flex min-h-8 items-center gap-2 font-semibold text-foodie-action"
          >
            <RotateCcw size={12} />
            Reload map
          </button>
        </div>
      )}
      {!ready && !failed && (
        <p
          role="status"
          className="absolute bottom-21 left-5 z-10 rounded-full bg-white/90 px-4 py-2 text-xs text-foodie-muted"
        >
          Opening your map…
        </p>
      )}
      <div className="absolute right-5 bottom-9 left-5 z-10 flex items-center justify-center gap-2">
        {editing ? (
          <>
            {point && !needsAdjustment && (
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  map.current?.setView(
                    [point.coordinates[1], point.coordinates[0]],
                    17,
                    { animate: false },
                  );
                }}
                className="min-h-11 rounded-full bg-white px-5 text-xs font-medium shadow-sm"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              disabled={disabled || !ready || failed || !canSelect}
              onClick={() => {
                const center = map.current?.getCenter().wrap();
                if (!center) return;
                onSelect({
                  type: "Point",
                  coordinates: [center.lng, center.lat],
                });
                setEditing(false);
              }}
              className="flex min-h-11 items-center gap-2 rounded-full bg-foodie-forest px-5 text-xs font-medium text-white shadow-lg disabled:opacity-50"
            >
              <Check size={15} />
              {canSelect ? "Use this pin" : "Zoom in to your street"}
            </button>
          </>
        ) : (
          <button
            type="button"
            disabled={!ready || disabled}
            onClick={() => setEditing(true)}
            className="flex min-h-11 items-center gap-2 rounded-full border border-foodie-line bg-white px-5 text-xs font-medium shadow-lg"
          >
            <Move size={15} />
            Adjust pin
          </button>
        )}
      </div>
    </div>
  );
}
