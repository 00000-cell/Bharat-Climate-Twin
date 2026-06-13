"use client";

import { useEffect, useState } from "react";

import { api } from "@/lib/api";
import type { District } from "@/lib/types";

export function DistrictSelector({
  value,
  onChange
}: {
  value?: number;
  onChange: (districtId: number) => void;
}) {
  const [districts, setDistricts] = useState<District[]>([]);

  useEffect(() => {
    api.districts().then((items) => {
      setDistricts(items);
      if (!value && items[0]) onChange(items[0].id);
    });
  }, [onChange, value]);

  return (
    <select
      value={value ?? ""}
      onChange={(event) => onChange(Number(event.target.value))}
      className="h-10 w-full rounded-md border border-input bg-slate-950/70 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-300"
    >
      {districts.map((district) => (
        <option key={district.id} value={district.id}>
          {district.name}, {district.state_name}
        </option>
      ))}
    </select>
  );
}
