"use client";

import { useEffect, useRef, useState } from "react";
import { LoaderCircle, MapPin, Minus, Plus, RotateCcw } from "lucide-react";
import type { GridLayer, Map as LeafletMap } from "leaflet";
import type { SavedLocation } from "@/types/user";
import { createAddressTiles } from "@/lib/address-map-tiles";

type Point = SavedLocation["point"];

export default function AddressMap({
  point,
  onSelect,
  onMoving,
  onEditingChange,
  needsAdjustment = false,
  disabled = false,
}: {
  point: Point;
  onSelect: (point: NonNullable<Point>) => void;
  onMoving: () => void;
  onEditingChange: (editing: boolean) => void;
  needsAdjustment?: boolean;
  disabled?: boolean;
}) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const tiles = useRef<GridLayer | null>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [moving, setMoving] = useState(false);
  const [streetLevel, setStreetLevel] = useState(!!point && !needsAdjustment);
  const [retry, setRetry] = useState(0);
  const latest = useRef({
    point,
    needsAdjustment,
    disabled,
    onSelect,
    onMoving,
  });
  latest.current = { point, needsAdjustment, disabled, onSelect, onMoving };

  useEffect(() => {
    let cancelled = false;
    let observer: ResizeObserver | undefined;
    let wheelTimer: ReturnType<typeof setTimeout> | undefined;
    let wheelActive = false;
    let resizing = false;
    let frame = 0;
    let horizontal = 0;
    let vertical = 0;
    let removeWheel: (() => void) | undefined;
    setFailed(false);
    setLoading(true);
    import("leaflet")
      .then((L) => {
        if (cancelled || !container.current) return;
        const reduced = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        const instance = L.map(container.current, {
          zoomControl: false,
          scrollWheelZoom: "center",
          wheelPxPerZoomLevel: 120,
          zoomAnimation: !reduced,
          fadeAnimation: !reduced,
          markerZoomAnimation: !reduced,
        });
        map.current = instance;
        const initial = latest.current;
        // Nigeria is an overview, never a default customer position.
        instance.setView(
          initial.point
            ? [initial.point.coordinates[1], initial.point.coordinates[0]]
            : [9.08, 8.67],
          initial.point ? (initial.needsAdjustment ? 13 : 17) : 6,
        );
        setStreetLevel(instance.getZoom() >= 15);
        function startMoving() {
          if (resizing) return;
          setMoving(true);
          latest.current.onMoving();
        }
        function finishMoving() {
          if (wheelActive || resizing) return;
          setMoving(false);
          const zoomed = instance.getZoom() >= 15;
          setStreetLevel(zoomed);
          if (!zoomed || latest.current.disabled) return;
          const center = instance.getCenter().wrap();
          const selected = latest.current.point;
          if (
            selected &&
            !latest.current.needsAdjustment &&
            Math.abs(center.lng - selected.coordinates[0]) < 0.0000001 &&
            Math.abs(center.lat - selected.coordinates[1]) < 0.0000001
          )
            return;
          latest.current.onSelect({
            type: "Point",
            coordinates: [center.lng, center.lat],
          });
        }
        instance.on("movestart", startMoving);
        instance.on("moveend", finishMoving);

        // Two-finger scrolling pans; trackpad pinch (ctrl+wheel) uses Leaflet's zoom.
        function wheel(event: WheelEvent) {
          if (latest.current.disabled || event.ctrlKey) return;
          event.preventDefault();
          event.stopImmediatePropagation();
          if (!wheelActive) startMoving();
          wheelActive = true;
          const scale =
            event.deltaMode === 1
              ? 16
              : event.deltaMode === 2
                ? instance.getSize().y
                : 1;
          horizontal +=
            (event.shiftKey && !event.deltaX ? event.deltaY : event.deltaX) *
            scale;
          vertical +=
            (event.shiftKey && !event.deltaX ? 0 : event.deltaY) * scale;
          if (!frame)
            frame = requestAnimationFrame(() => {
              frame = 0;
              instance.panBy([horizontal, vertical], {
                animate: false,
                noMoveStart: true,
              });
              horizontal = 0;
              vertical = 0;
            });
          clearTimeout(wheelTimer);
          wheelTimer = setTimeout(() => {
            wheelActive = false;
            finishMoving();
          }, 450);
        }
        const element = container.current;
        element.addEventListener("wheel", wheel, {
          passive: false,
          capture: true,
        });
        removeWheel = () => element.removeEventListener("wheel", wheel, true);

        const layer = createAddressTiles(L);
        tiles.current = layer;
        const errors = new Set<HTMLElement>();
        layer.on("loading", () => {
          if (!cancelled) setLoading(true);
        });
        layer.on("load", () => {
          if (!cancelled) setLoading(false);
        });
        layer.on("tileerror", ({ tile }) => {
          errors.add(tile);
          if (!cancelled) setFailed(true);
        });
        function clearTileError({ tile }: import("leaflet").TileEvent) {
          errors.delete(tile);
          if (!cancelled) setFailed(errors.size > 0);
        }
        layer.on("tileload", clearTileError);
        layer.on("tileunload", clearTileError);
        layer.addTo(instance);
        if (typeof ResizeObserver !== "undefined") {
          observer = new ResizeObserver(() => {
            // Expanding address details must resize the map without selecting a new place.
            resizing = true;
            instance.invalidateSize({ animate: false });
            resizing = false;
          });
          observer.observe(element);
        }
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
      clearTimeout(wheelTimer);
      cancelAnimationFrame(frame);
      removeWheel?.();
      observer?.disconnect();
      map.current?.remove();
      map.current = null;
      tiles.current = null;
    };
  }, [retry]);

  useEffect(() => {
    onEditingChange(
      moving || loading || failed || !streetLevel || needsAdjustment || !ready,
    );
  }, [
    moving,
    loading,
    failed,
    streetLevel,
    needsAdjustment,
    ready,
    onEditingChange,
  ]);

  useEffect(() => {
    const instance = map.current;
    if (!instance) return;
    for (const handler of [
      instance.dragging,
      instance.keyboard,
      instance.touchZoom,
      instance.doubleClickZoom,
      instance.scrollWheelZoom,
    ]) {
      if (disabled) handler.disable();
      else handler.enable();
    }
  }, [disabled, ready]);

  return (
    <div className="relative isolate h-[360px] overflow-hidden bg-[#e5e9df] sm:h-[420px] lg:h-full lg:min-h-[620px] [&_.leaflet-control-attribution]:text-[9px] [&_.leaflet-container]:font-sans">
      <div
        ref={container}
        role="region"
        aria-label="Address map. Drag or scroll to move the pin. Pinch or use the zoom buttons to zoom."
        className="absolute inset-0 z-0 h-full w-full"
      />
      <div className="pointer-events-none absolute top-5 left-5 right-18 z-10">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/95 px-3.5 py-2 text-[10px] font-medium text-foodie-forest shadow-sm">
          <span className="size-1.5 rounded-full bg-foodie-action" />
          {moving ? "Finding your spot…" : "Place the pin on your address"}
        </span>
      </div>
      <div className="pointer-events-none absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-full drop-shadow-md">
        <MapPin
          size={38}
          fill="#c74724"
          color="white"
          strokeWidth={1.4}
          aria-hidden="true"
        />
      </div>
      <div className="absolute top-5 right-4 z-10 flex flex-col overflow-hidden rounded-xl border border-foodie-line bg-white shadow-sm">
        <button
          type="button"
          disabled={!ready || disabled}
          aria-label="Zoom in"
          onClick={() => map.current?.zoomIn()}
          className="grid size-10 place-items-center border-b border-foodie-line hover:bg-foodie-paper disabled:opacity-50"
        >
          <Plus size={17} />
        </button>
        <button
          type="button"
          disabled={!ready || disabled}
          aria-label="Zoom out"
          onClick={() => map.current?.zoomOut()}
          className="grid size-10 place-items-center hover:bg-foodie-paper disabled:opacity-50"
        >
          <Minus size={17} />
        </button>
      </div>
      {failed && (
        <div
          role="status"
          className="absolute top-20 left-4 right-16 z-10 rounded-xl bg-foodie-paper/95 p-3 text-[11px] leading-relaxed"
        >
          Some streets couldn’t load. Try loading the map again.
          <button
            type="button"
            onClick={() => {
              setFailed(false);
              setLoading(true);
              if (tiles.current) tiles.current.redraw();
              else {
                setReady(false);
                setRetry((value) => value + 1);
              }
            }}
            className="mt-2 flex min-h-8 items-center gap-2 font-semibold text-foodie-action"
          >
            <RotateCcw size={12} />
            Reload map
          </button>
        </div>
      )}
      <div className="pointer-events-none absolute right-5 bottom-9 left-5 z-10 flex justify-center">
        <p
          role="status"
          className="flex items-center gap-2 rounded-2xl bg-white/95 px-4 py-3 text-center text-[10px] font-medium text-foodie-forest shadow-sm"
        >
          {loading && !failed && (
            <LoaderCircle
              size={13}
              className="animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
          )}
          {!ready ? (
            "Opening your map…"
          ) : loading && !failed ? (
            "Loading streets…"
          ) : !streetLevel ? (
            "Zoom in to your street to set the pin"
          ) : (
            <>
              <span className="hidden sm:inline">
                Drag or scroll to move · Pinch or + / − to zoom
              </span>
              <span className="sm:hidden">Drag to move · Pinch to zoom</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
