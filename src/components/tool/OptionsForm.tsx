"use client";

import { useRef } from "react";
import { Button, Checkbox, Input, InputNumber, Radio, Select } from "antd";
import type { OptionField, OptionValue, OptionValues } from "../../tools/types";

interface Props {
  fields: OptionField[];
  values: OptionValues;
  onChange: (key: string, value: OptionValue) => void;
  disabled?: boolean;
}

/**
 * Renders a tool's option schema. Every tool that needs settings declares them in
 * the registry, so no tool ever ships its own bespoke form.
 */
export default function OptionsForm({ fields, values, onChange, disabled }: Props) {
  if (fields.length === 0) return null;

  return (
    <fieldset className="mt-7 rounded-2xl border border-[var(--border)] bg-[var(--page)] p-5 sm:p-6" disabled={disabled}>
      <legend className="sr-only">Options</legend>
      <div className="mb-5">
        <h2 className="text-sm font-bold text-[var(--text-primary)]">Customize your output</h2>
        <p className="mt-1 text-xs text-[var(--text-muted)]">Choose the settings that fit this document.</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        {fields
          .filter((field) => !(field.key === "mosaic" && fields.some((item) => item.type === "position-grid")))
          .map((field) => {
            const controlId = `option-${field.key}`;
            const helpId = field.help ? `${controlId}-help` : undefined;
            const value = values[field.key] ?? field.defaultValue;

            return (
              <div
                key={field.key}
                className={field.type === "radio" || field.type === "position-grid" ? "sm:col-span-2" : undefined}
              >
              {field.type !== "checkbox" && (
                <label
                  htmlFor={controlId}
                  className="mb-1.5 block text-sm font-semibold text-[var(--text-primary)]"
                >
                  {field.label}
                </label>
              )}

              {field.type === "text" && (
                <Input
                  id={controlId}
                  value={String(value)}
                  placeholder={field.placeholder}
                  aria-describedby={helpId}
                  onChange={(event) => onChange(field.key, event.target.value)}
                />
              )}

              {field.type === "color" && (
                <Input
                  id={controlId}
                  type="color"
                  className="h-10 w-full cursor-pointer"
                  value={String(value)}
                  aria-describedby={helpId}
                  onChange={(event) => onChange(field.key, event.target.value)}
                />
              )}

              {field.type === "checkbox" && (
                <Checkbox
                  id={controlId}
                  checked={Boolean(value)}
                  aria-describedby={helpId}
                  onChange={(event) => onChange(field.key, event.target.checked)}
                >
                  {field.label}
                </Checkbox>
              )}

              {field.type === "position-grid" && (
                <div className="flex flex-wrap items-center gap-6">
                  <div
                    role="group"
                    aria-label={field.label}
                    className="grid w-fit grid-cols-3 overflow-hidden rounded-md border border-[var(--border)]"
                  >
                    {field.choices?.map((choice) => {
                      const selected = value === choice.value;
                      const mosaic = Boolean(values.mosaic ?? fields.find((item) => item.key === "mosaic")?.defaultValue);
                      return (
                        <button
                          key={String(choice.value)}
                          type="button"
                          aria-label={choice.label}
                          aria-pressed={selected}
                          title={choice.label}
                          disabled={disabled}
                          onClick={() => onChange(field.key, choice.value)}
                          className={`flex h-10 w-10 items-center justify-center border border-dashed border-[var(--border)] transition-colors focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500 ${selected ? "bg-red-50" : "bg-white hover:bg-[var(--page)]"}`}
                        >
                          {(selected || mosaic) && (
                            <span className={`${mosaic ? "h-2.5 w-2.5" : "h-3 w-3"} rounded-full bg-[#cc4435] ${selected ? "ring-2 ring-red-200" : "opacity-60"}`} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {fields.some((item) => item.key === "mosaic") && (() => {
                    const mosaicField = fields.find((item) => item.key === "mosaic")!;
                    const mosaicChecked = Boolean(values.mosaic ?? mosaicField.defaultValue);
                    return (
                      <div>
                        <Checkbox
                          id="option-mosaic"
                          checked={mosaicChecked}
                          disabled={disabled}
                          aria-describedby="option-mosaic-help"
                          onChange={(event) => onChange("mosaic", event.target.checked)}
                        >
                          {mosaicField.label}
                        </Checkbox>
                        {mosaicField.help && (
                          <p id="option-mosaic-help" className="mt-1.5 max-w-48 text-xs leading-5 text-[var(--text-muted)]">
                            {mosaicField.help}
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {field.type === "number" && (
                <InputNumber
                  id={controlId}
                  className="w-full"
                  value={Number(value)}
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  aria-describedby={helpId}
                  onChange={(next) =>
                    onChange(field.key, next ?? (field.defaultValue as number))
                  }
                />
              )}

              {field.type === "select" && (
                <Select
                  id={controlId}
                  className="w-full"
                  value={value}
                  aria-describedby={helpId}
                  options={field.choices}
                  onChange={(next) => onChange(field.key, next as OptionValue)}
                />
              )}

              {field.type === "radio" && (
                <Radio.Group
                  id={controlId}
                  value={value}
                  aria-describedby={helpId}
                  onChange={(event) => onChange(field.key, event.target.value)}
                  className="flex flex-wrap gap-x-6 gap-y-2"
                >
                  {field.choices?.map((choice) => (
                    <Radio key={String(choice.value)} value={choice.value}>
                      {choice.label}
                    </Radio>
                  ))}
                </Radio.Group>
              )}

              {field.type === "file" && (
                <Input
                  id={controlId}
                  type="file"
                  accept={field.accept}
                  aria-describedby={helpId}
                  onChange={(event) => onChange(field.key, event.target.files?.[0] ?? "")}
                />
              )}

              {field.type === "signature" && (
                <SignatureInput
                  id={controlId}
                  accept={field.accept}
                  disabled={disabled}
                  onChange={(file) => onChange(field.key, file ?? "")}
                />
              )}

              {field.help && (
                <p id={helpId} className="mt-1.5 text-xs leading-5 text-[var(--text-muted)]">
                  {field.help}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

function SignatureInput({
  id,
  accept,
  disabled,
  onChange,
}: {
  id: string;
  accept?: string;
  disabled?: boolean;
  onChange: (file: File | null) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);

  const point = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const clear = () => {
    const canvas = canvasRef.current;
    canvas?.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    onChange(null);
  };

  const finish = () => {
    drawingRef.current = false;
    canvasRef.current?.toBlob((blob) => {
      if (blob) onChange(new File([blob], "drawn-signature.png", { type: "image/png" }));
    }, "image/png");
  };

  return (
    <div className="space-y-2">
      <canvas
        ref={canvasRef}
        id={id}
        width={700}
        height={180}
        aria-label="Draw your signature"
        className="h-28 w-full touch-none rounded-xl border border-[var(--border-strong)] bg-white"
        onPointerDown={(event) => {
          if (disabled) return;
          const canvas = canvasRef.current;
          const next = point(event);
          const context = canvas?.getContext("2d");
          if (!canvas || !next || !context) return;
          canvas.setPointerCapture(event.pointerId);
          drawingRef.current = true;
          context.beginPath();
          context.moveTo(next.x, next.y);
          context.strokeStyle = "#0b1739";
          context.lineWidth = 5;
          context.lineCap = "round";
          context.lineJoin = "round";
        }}
        onPointerMove={(event) => {
          if (!drawingRef.current) return;
          const next = point(event);
          const context = canvasRef.current?.getContext("2d");
          if (!next || !context) return;
          context.lineTo(next.x, next.y);
          context.stroke();
        }}
        onPointerUp={finish}
        onPointerCancel={finish}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button size="small" onClick={clear} disabled={disabled}>Clear drawing</Button>
        <label className="cursor-pointer text-xs font-semibold text-[var(--secondary)] hover:underline">
          Or upload PNG/JPG
          <input
            type="file"
            accept={accept}
            disabled={disabled}
            className="sr-only"
            onChange={(event) => onChange(event.target.files?.[0] ?? null)}
          />
        </label>
      </div>
    </div>
  );
}
