type Rect = { x: number; y: number; width: number; height: number };
/** Keep nearby labels tappable. Stored coordinates and map bounds never change. */
export function mapLabelLayout(labels: Rect[], bounds: Rect) {
  const placed: Rect[] = [];
  return labels.map((rect) => {
    const label = {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    };
    if (
      label.x + label.width < bounds.x ||
      label.x > bounds.x + bounds.width ||
      label.y + label.height < bounds.y ||
      label.y > bounds.y + bounds.height
    )
      return { x: 0, y: 0 };
    const candidates = [[0, 0]];
    for (let ring = 1; ring <= 6; ring++) {
      for (let x = -ring; x <= ring; x++)
        for (let y = -ring; y <= ring; y++)
          if (Math.abs(x) === ring || Math.abs(y) === ring)
            candidates.push([x * 52, y * 52]);
    }
    candidates.sort((a, b) => a[0] ** 2 + a[1] ** 2 - b[0] ** 2 - b[1] ** 2);
    const position =
      candidates
        .map(([dx, dy]) => ({
          ...label,
          x: Math.max(
            bounds.x + 8,
            Math.min(bounds.x + bounds.width - label.width - 8, label.x + dx),
          ),
          y: Math.max(
            bounds.y + 8,
            Math.min(
              bounds.y + bounds.height - label.height - 48,
              label.y + dy,
            ),
          ),
        }))
        .find((next) =>
          placed.every(
            (p) =>
              next.x >= p.x + p.width + 6 ||
              next.x + next.width + 6 <= p.x ||
              next.y >= p.y + p.height + 6 ||
              next.y + next.height + 6 <= p.y,
          ),
        ) || label;
    placed.push(position);
    return { x: position.x - label.x, y: position.y - label.y };
  });
}
