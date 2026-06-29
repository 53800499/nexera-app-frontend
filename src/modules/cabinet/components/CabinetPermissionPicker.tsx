"use client";

import Checkbox from "@/components/form/input/Checkbox";
import {
  CABINET_SCOPE_PERMISSION_OPTIONS,
  type CabinetScopePermissionCode,
} from "../constants/cabinetPermissionLabels";

type Props = {
  value: CabinetScopePermissionCode[];
  onChange: (permissions: CabinetScopePermissionCode[]) => void;
  disabled?: boolean;
};

export function CabinetPermissionPicker({ value, onChange, disabled }: Props) {
  const toggle = (code: CabinetScopePermissionCode, checked: boolean) => {
    if (checked) {
      onChange([...new Set([...value, code])]);
      return;
    }
    onChange(value.filter((item) => item !== code));
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Droits accordés au cabinet
      </p>
      {CABINET_SCOPE_PERMISSION_OPTIONS.map((option) => (
        <label
          key={option.code}
          className={`flex items-start gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-800 ${
            option.available ? "" : "opacity-70"
          }`}
        >
          <Checkbox
            className="mt-0.5"
            checked={value.includes(option.code)}
            disabled={disabled || !option.available}
            onChange={(checked) => toggle(option.code, checked)}
          />
          <span>
            <span className="block text-sm font-medium text-gray-800 dark:text-white/90">
              {option.label}
              {!option.available ? (
                <span className="ml-2 text-xs font-normal text-gray-400">
                  (prochainement)
                </span>
              ) : null}
            </span>
            <span className="mt-0.5 block text-xs text-gray-500">
              {option.description}
            </span>
          </span>
        </label>
      ))}
    </div>
  );
}
