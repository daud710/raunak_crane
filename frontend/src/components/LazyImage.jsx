/**
 * Serves the lighter .webp version where the browser supports it, falls back
 * to .jpg, and lazy-loads everything except images explicitly marked eager
 * (the hero image, so it doesn't pop in late).
 */
export default function LazyImage({ src, webpSrc, alt, eager = false, className, ...rest }) {
  const derivedWebp = webpSrc || src.replace(/\.(jpg|jpeg|png)$/i, ".webp");
  return (
    <picture className={className}>
      <source srcSet={derivedWebp} type="image/webp" />
      <img
        src={src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        {...rest}
      />
    </picture>
  );
}
