"use client";

import { useEffect, useId, useState } from "react";
import Select, {
  type GroupBase,
  type Props as SelectProps,
  type StylesConfig,
} from "react-select";

export interface SelectOption {
  label: string;
  value: string;
}

const styles: StylesConfig<SelectOption, false, GroupBase<SelectOption>> = {
  control: (base, state) => ({
    ...base,
    minHeight: 46,
    borderRadius: 12,
    fontSize: 14,
    borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
    boxShadow: state.isFocused ? "0 0 0 2px rgba(59, 130, 246, 0.2)" : "none",
    "&:hover": {
      borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
    },
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "2px 12px",
  }),
  input: (base) => ({
    ...base,
    margin: 0,
    padding: 0,
    fontSize: 14,
  }),
  placeholder: (base) => ({
    ...base,
    color: "#94a3b8",
    fontSize: 14,
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: "#94a3b8",
    "&:hover": {
      color: "#64748b",
    },
  }),
  menu: (base) => ({
    ...base,
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.12)",
    zIndex: 30,
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 60,
  }),
  option: (base, state) => ({
    ...base,
    fontSize: 14,
    backgroundColor: state.isSelected
      ? "#2563eb"
      : state.isFocused
        ? "#eff6ff"
        : "#ffffff",
    color: state.isSelected ? "#ffffff" : "#0f172a",
    cursor: "pointer",
  }),
  singleValue: (base) => ({
    ...base,
    color: "#0f172a",
    fontSize: 14,
  }),
};

export default function AppSelect(
  props: SelectProps<SelectOption, false, GroupBase<SelectOption>>,
) {
  const instanceId = useId();
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  return (
    <Select<SelectOption, false, GroupBase<SelectOption>>
      unstyled={false}
      styles={styles}
      instanceId={instanceId}
      inputId={instanceId}
      menuPortalTarget={portalTarget}
      isSearchable={false}
      {...props}
    />
  );
}
