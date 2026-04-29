"use client";

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export default function DepartmentFilter({ 
  departments, 
  allLabel,
  placeholder
}: { 
  departments: string[];
  allLabel: string;
  placeholder: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeDept = searchParams.get('department') || '';

  return (
    <div className="flex flex-col space-y-1.5">
      <label htmlFor="dept-filter" className="text-sm font-medium text-muted-foreground">{placeholder}</label>
      <select 
        id="dept-filter"
        value={activeDept}
        onChange={(e) => {
          const params = new URLSearchParams(searchParams.toString());
          if (e.target.value) {
            params.set('department', e.target.value);
          } else {
            params.delete('department');
          }
          router.push(`${pathname}?${params.toString()}`);
        }}
        className="flex h-10 w-[220px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="">{allLabel}</option>
        {departments.map(d => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>
    </div>
  );
}
