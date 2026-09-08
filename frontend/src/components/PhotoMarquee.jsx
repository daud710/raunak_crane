/**
 * A continuously auto-scrolling strip of every vehicle photo, shown right
 * under the hero so visitors see the whole fleet the moment the site loads.
 * The photo list is duplicated once so the loop has no visible seam.
 */
export default function PhotoMarquee({ vehicles }) {
  const photos = vehicles.flatMap((v) =>
    v.photos && v.photos.length > 0
      ? v.photos.map((p) => p.url)
      : [v.image_url]
  ).filter(Boolean);

  if (photos.length === 0) return null;

  const loop = [...photos, ...photos];

  return (
    <div className="photo-marquee" aria-hidden="true">
      <div className="photo-marquee-track">
        {loop.map((url, i) => (
          <img key={i} src={url} alt="" loading={i === 0 ? "eager" : "lazy"} decoding="async" />
        ))}
      </div>
    </div>
  );
}
