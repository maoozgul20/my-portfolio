const I = ({ children, size = 18, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    {children}
  </svg>
)
export const Arrow = (p) => <I {...p}><path d="M5 12h14M13 6l6 6-6 6" /></I>
export const Download = (p) => <I {...p}><path d="M12 4v11M7 11l5 5 5-5M5 20h14" /></I>
export const Mail = (p) => <I {...p}><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="m4 7 8 6 8-6" /></I>
export const Pin = (p) => <I {...p}><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.800 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></I>
export const Close = (p) => <I {...p}><path d="M6 6l12 12M18 6 6 18" /></I>
export const Menu = (p) => <I {...p}><path d="M4 7h16M4 12h16M4 17h16" /></I>
export const Sun = (p) => <I {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8" /></I>
export const Moon = (p) => <I {...p}><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" /></I>
export const Up = (p) => <I {...p}><path d="M12 19V5M6 11l6-6 6 6" /></I>
export const Cap = (p) => <I {...p}><path d="m2 9 10-5 10 5-10 5L2 9Z" /><path d="M6 11.500V16c0 1.200 2.700 3 6 3s6-1.800 6-3v-4.500M22 9v6" /></I>
export const Brief = (p) => <I {...p}><rect x="3" y="7" width="18" height="13" rx="2.500" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18" /></I>
export const Spark = (p) => <I {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.500 2.500M15.500 15.500 18 18M18 6l-2.500 2.500M8.500 15.500 6 18" /></I>
export const GitHub = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2a10 10 0 0 0-3.160 19.490c.5.090.680-.220.680-.480v-1.700c-2.780.600-3.370-1.340-3.370-1.340-.450-1.160-1.110-1.470-1.110-1.470-.910-.620.070-.610.070-.610 1 .070 1.530 1.030 1.530 1.030.900 1.530 2.340 1.090 2.910.830.090-.650.350-1.090.630-1.340-2.220-.250-4.550-1.110-4.550-4.940 0-1.090.390-1.980 1.030-2.680-.100-.250-.450-1.270.100-2.650 0 0 .840-.270 2.750 1.020a9.560 9.560 0 0 1 5 0c1.910-1.290 2.750-1.020 2.750-1.020.550 1.380.200 2.400.100 2.650.640.700 1.030 1.590 1.030 2.680 0 3.840-2.340 4.680-4.570 4.930.360.310.680.920.680 1.850v2.750c0 .270.180.580.690.480A10 10 0 0 0 12 2Z" />
  </svg>
)
export const Logo = ({ size = 34 }) => (
  <svg width={size} height={size * 0.62} viewBox="0 0 58 36" aria-hidden="true">
    <defs>
      <linearGradient id="mz" x1="0" x2="1">
        <stop offset="0" stopColor="#00E5FF" />
        <stop offset="1" stopColor="#00BFA6" />
      </linearGradient>
    </defs>
    <path d="M2 34V2h6l9 16 9-16h6v32h-6V14l-9 15-9-15v20zm34-32h20v6L42 28h14v6H35v-6l14-20H36z" fill="url(#mz)" />
  </svg>
)
