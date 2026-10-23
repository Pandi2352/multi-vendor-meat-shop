import type { SVGProps } from 'react';

export interface MenuLinesIconProps extends SVGProps<SVGSVGElement> {
  strokeWidth?: number;
}

/** Brand menu icon: two full-width lines and a shorter third line, rounded ends. Same API as lucide icons. */
export function MenuLinesIcon({ strokeWidth = 2.2, ...props }: MenuLinesIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h9" />
    </svg>
  );
}
