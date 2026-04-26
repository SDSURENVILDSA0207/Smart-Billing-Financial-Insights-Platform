"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type SubNavItem = { href: string; label: string; isActive?: (pathname: string) => boolean };

export function ModuleSubnav({ items }: { items: SubNavItem[] }) {
  const pathname = usePathname() ?? "";
  return (
    <div className="mb-9 border-b border-warm/[0.06]">
      <div className="-mb-px flex flex-wrap gap-6">
        {items.map((item) => {
          const active = item.isActive ? item.isActive(pathname) : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              className={`relative pb-3 text-[13px] font-medium transition ${
                active
                  ? "text-warm after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-brass"
                  : "text-warm-muted hover:text-warm"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
