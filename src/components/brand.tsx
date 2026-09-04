export const brandColors = {
  navy: "#172b3a",
  orange: "#ff9b54",
  background: "#f5f5f0",
};

/** Jeden geometryczny znak dla interfejsu i ikon instalowanej aplikacji. */
export function BrandMark({ size = 44 }: { size?: number }) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: "flex",
        position: "relative",
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: size * 0.27,
        background: brandColors.navy,
      }}
    >
      <span
        style={{
          position: "absolute",
          display: "flex",
          left: size * 0.28,
          top: size * 0.24,
          width: size * 0.15,
          height: size * 0.53,
          transform: "skewX(-10deg)",
          background: brandColors.orange,
        }}
      />
      <span
        style={{
          position: "absolute",
          display: "flex",
          left: size * 0.33,
          top: size * 0.24,
          width: size * 0.42,
          height: size * 0.14,
          background: brandColors.orange,
        }}
      />
      <span
        style={{
          position: "absolute",
          display: "flex",
          left: size * 0.31,
          top: size * 0.46,
          width: size * 0.32,
          height: size * 0.13,
          background: brandColors.orange,
        }}
      />
      <span
        style={{
          position: "absolute",
          display: "flex",
          left: size * 0.64,
          top: size * 0.65,
          width: size * 0.12,
          height: size * 0.12,
          borderRadius: size * 0.025,
          background: "#ffffff",
        }}
      />
    </span>
  );
}
