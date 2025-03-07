import React from "react";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export default function MultiSelect({
  label,
  name,
  options,
  value,
  onChange,
  placeholder,
}) {
  const handleChange = (optionId) => {
    const newValue = value.includes(optionId)
      ? value.filter((id) => id !== optionId)
      : [...value, optionId];
    
    onChange({
      target: {
        name,
        value: newValue,
      },
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex flex-col gap-2 p-2 border rounded-md">
        {options.map((option) => (
          <div key={option.id} className="flex items-center gap-2">
            <Checkbox
              id={`${name}-${option.id}`}
              checked={value.includes(option.id)}
              onCheckedChange={() => handleChange(option.id)}
            />
            <label
              htmlFor={`${name}-${option.id}`}
              className="text-sm cursor-pointer"
            >
              {option.label}
            </label>
          </div>
        ))}
        {options.length === 0 && (
          <p className="text-sm text-gray-500">{placeholder || "Select a category first"}</p>
        )}
      </div>
    </div>
  );
}
