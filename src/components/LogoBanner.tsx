interface Props {
  className?: string
}

export default function LogoBanner({ className }: Props) {
  return (
    <svg
      viewBox="0 0 440 64"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Colección AL"
      className={className}
    >
      {/* LOGO MARK */}
      <g transform="translate(10, 8)">
        <path fill="currentColor" d="M25 5 L10 48 H15 L18 38 H32 L35 48 H40 L25 5 Z M20 33 L25 15 L30 33 H20 Z"/>
        <circle cx="25" cy="28" r="4"   fill="none" stroke="currentColor" strokeWidth="0.5"/>
        <circle cx="25" cy="28" r="2"   fill="currentColor"/>
        <path fill="currentColor" d="M33 25 L38 48 H55 C58 48 60 46 60 43 L58 45 C58 46 55 46 53 46 H42 L37 25 Z"/>
        <circle cx="50" cy="42" r="3"   fill="none" stroke="currentColor" strokeWidth="0.5"/>
        <circle cx="50" cy="42" r="1.5" fill="currentColor"/>
        <rect x="23" y="1" width="4" height="4" rx={0.5} fill="currentColor"/>
        <circle cx="28" cy="3" r="0.5" fill="currentColor"/>
        <circle cx="31" cy="2" r="0.3" fill="currentColor"/>
        <circle cx="33" cy="4" r="0.2" fill="currentColor"/>
        <circle cx="30" cy="5" r="0.2" fill="currentColor"/>
        <path fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" d="M5 35 C5 5 45 5 45 35"/>
        <rect x="2"  y="28" width="5" height="12" rx={2} fill="currentColor"/>
        <rect x="43" y="28" width="5" height="12" rx={2} fill="currentColor"/>
      </g>

      {/* COLLECTION */}
      <text
        x="82" y="39"
        fill="currentColor"
        fontSize={18}
        fontFamily="'Segoe UI', Arial, sans-serif"
        fontWeight={300}
        letterSpacing={2}
      >
        COLLECTION
      </text>

      {/* ICONOS (escala 1.5×, separación 28px) */}
      <g transform="translate(232, 21)">

        {/* 1. Figura humana */}
        <g transform="scale(1.5)">
          <path fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"
                d="M5 15 L5 8 L3 8 L3 5 L5 3 L7 5 L7 8 L5 8"/>
          <path fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"
                d="M4 10 L2 14 M6 10 L8 14"/>
        </g>

        {/* 2. Cubo isométrico (LEGO) */}
        <g transform="translate(28,0) scale(1.5)">
          <path fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"
                d="M0 4 L6 1 L12 4 L12 10 L6 13 L0 10 Z"/>
          <path fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"
                d="M0 4 L6 7 L12 4 M6 7 L6 13"/>
        </g>

        {/* 3. Vinilo */}
        <g transform="translate(56,0) scale(1.5)">
          <circle cx="6" cy="6" r="6" fill="none" stroke="currentColor" strokeWidth="0.8"/>
          <circle cx="6" cy="6" r="2" fill="currentColor"/>
        </g>

        {/* 4. Frasco / perfume */}
        <g transform="translate(84,0) scale(1.5)">
          <rect x="2" y="4" width="8" height="8" rx={1} fill="none" stroke="currentColor" strokeWidth="0.8"/>
          <path fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"
                d="M4 4 L4 1 H8 L8 4"/>
        </g>

        {/* 5. Funko / audífonos frontal */}
        <g transform="translate(112,0) scale(1.5)">
          <rect x="0" y="2" width="12" height="10" rx={3} fill="none" stroke="currentColor" strokeWidth="0.8"/>
          <circle cx="3" cy="7" r="1.5" fill="currentColor"/>
          <circle cx="9" cy="7" r="1.5" fill="currentColor"/>
        </g>

        {/* 6. Audífonos (arco lateral) */}
        <g transform="translate(140,0) scale(1.5)">
          <path fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"
                d="M0 10 C0 0 10 0 10 10"/>
          <rect x="-1" y="8" width="2" height="4" fill="currentColor"/>
          <rect x="9"  y="8" width="2" height="4" fill="currentColor"/>
        </g>

      </g>
    </svg>
  )
}
