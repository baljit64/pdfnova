"use client";

import { Input, InputNumber, Radio, Select } from "antd";
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
    <fieldset className="mt-6 border-0 p-0" disabled={disabled}>
      <legend className="sr-only">Options</legend>
      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map((field) => {
          const controlId = `option-${field.key}`;
          const helpId = field.help ? `${controlId}-help` : undefined;
          const value = values[field.key] ?? field.defaultValue;

          return (
            <div
              key={field.key}
              className={field.type === "radio" ? "sm:col-span-2" : undefined}
            >
              <label
                htmlFor={controlId}
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                {field.label}
              </label>

              {field.type === "text" && (
                <Input
                  id={controlId}
                  value={String(value)}
                  placeholder={field.placeholder}
                  aria-describedby={helpId}
                  onChange={(event) => onChange(field.key, event.target.value)}
                />
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

              {field.help && (
                <p id={helpId} className="mt-1 text-xs text-gray-500">
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
