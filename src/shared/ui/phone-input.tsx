"use client";

import type { InputHTMLAttributes } from "react";

interface PhoneInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> {
  value: string;
  onChange: (value: string) => void;
}

/** Приводит ввод к белорусскому формату +375 (29) 123-45-67, не мешая другим странам. */
export function formatPhone(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  // Международный номер другой страны оставляем как есть.
  if (trimmed.startsWith("+") && !trimmed.startsWith("+375")) return trimmed;

  let digits = trimmed.replace(/\D/g, "");
  if (digits.startsWith("375")) digits = digits.slice(3);
  else if (digits.startsWith("80")) digits = digits.slice(2);

  const local = digits.slice(0, 9);
  if (!local) return "+375 ";

  let out = `+375 (${local.slice(0, 2)}`;
  if (local.length >= 2) out += ")";
  if (local.length > 2) out += ` ${local.slice(2, 5)}`;
  if (local.length > 5) out += `-${local.slice(5, 7)}`;
  if (local.length > 7) out += `-${local.slice(7, 9)}`;
  return out;
}

export default function PhoneInput({ value, onChange, placeholder = "+375 (29) 123-45-67", ...props }: PhoneInputProps) {
  return (
    <input
      {...props}
      type="tel"
      inputMode="tel"
      autoComplete={props.autoComplete ?? "tel"}
      value={value}
      onChange={event => onChange(formatPhone(event.target.value))}
      placeholder={placeholder}
    />
  );
}
