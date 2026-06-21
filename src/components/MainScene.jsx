export default function MainScene() {
  return (
    <div className="main-scene" aria-hidden="true">
      <div className="orb orb-large" />
      <div className="orb orb-small" />
      <div className="stars">
        {Array.from({ length: 18 }).map((_, index) => (
          <span key={index} style={{ '--i': index }} />
        ))}
      </div>
      <div className="mosque-silhouette">
        <span className="dome" />
        <span className="minaret minaret-left" />
        <span className="minaret minaret-right" />
      </div>
    </div>
  );
}
