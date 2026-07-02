"use client";

import { useMemo } from "react";
import ReactFlagsSelect from "react-flags-select";

type Props = {
  value?: string;
  onChange: (value: string) => void;
  error?: boolean;
  hint?: string;
  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
};

export function CountryFlagsSelect({
  value,
  onChange,
  error = false,
  hint,
  placeholder = "Sélectionner un pays",
  searchable = true,
  disabled = false,
}: Props) {
  const selectedCode = useMemo(() => {
    const normalized = (value ?? "").trim().toUpperCase();
    return /^[A-Z]{2}$/.test(normalized) ? normalized : "";
  }, [value]);

  return (
    <div>
      <ReactFlagsSelect
        selected={selectedCode}
        onSelect={(code) => onChange(code)}
        searchable={searchable}
        placeholder={placeholder}
        disabled={disabled}
        showSelectedLabel
        showOptionLabel
        selectedSize={14}
        optionsSize={12}
        className={`country-flags-select ${error ? "is-error" : ""}`}
      />
      {hint ? (
        <p className={`mt-1 text-xs ${error ? "text-error-500" : "text-gray-500"}`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
