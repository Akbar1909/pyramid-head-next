type Props = {
  className?: string;
};

export function PyramidLogo({ className = "h-10 w-10" }: Props) {
  return (
    // biome-ignore lint/performance/noImgElement: square brand SVG from /public
    <img
      src="/pyramid-logo.svg"
      alt="Pyramid College"
      className={className}
      width={800}
      height={800}
    />
  );
}
