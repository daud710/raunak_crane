import { useEffect, useState } from "react";
import LazyImage from "./LazyImage.jsx";

export default function VehicleCard({ vehicle }) {
  const photos = vehicle.photos && vehicle.photos.length > 0
    ? vehicle.photos
    : [{ url: vehicle.image_url, thumb: vehicle.thumb_url || vehicle.image_url }];

  const [index, setIndex] = useState(0);

  // Auto-rotate through this vehicle's photos when it has more than one.
  useEffect(() => {
    if (photos.length < 2) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % photos.length);
    }, 3000);
    return () => clearInterval(id);
  }, [photos.length]);

  // Render every photo up front (stacked, only the active one visible) so
  // each image is fetched once and cached by the browser. Rotating just
  // toggles which one is visible instead of swapping `src`, which used to
  // restart the download every 3s and meant slow mobile connections often
  // never finished loading a photo before the next rotation cancelled it.
  return (
    <article className="vehicle-card">
      <div className="vehicle-photo">
        {photos.map((photo, i) => {
          const isLocal = photo.url?.startsWith("/images/");
          const isActive = i === index;
          return isLocal ? (
            <LazyImage
              key={photo.url || i}
              src={photo.url}
              webpSrc={photo.url.replace(/\.jpg$/, ".webp")}
              alt={vehicle.name}
              eager={i === 0}
              className={isActive ? "active-photo" : ""}
            />
          ) : (
            <img
              key={photo.url || i}
              src={photo.thumb || photo.url}
              alt={vehicle.name}
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
              className={isActive ? "active-photo" : ""}
            />
          );
        })}
        {photos.length > 1 && (
          <div className="vehicle-photo-dots">
            {photos.map((_, i) => (
              <button
                key={i}
                type="button"
                className={i === index ? "active" : ""}
                aria-label={`Show photo ${i + 1}`}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        )}
      </div>
      <div className="vehicle-body">
        <span className="vehicle-category">{vehicle.category}</span>
        <h3>{vehicle.name}</h3>
        <p>{vehicle.description}</p>
      </div>
    </article>
  );
}
