import * as THREE from "three";

/**
 * Procedural product geometry with analytic normals. Highlights on machined
 * aluminium and polished glass live almost entirely on small edge radii, so
 * every rounded edge here is a real swept arc with exact per-vertex normals
 * (no faceting, no averaged seams), at a few thousand vertices per part.
 */

/** A point of a cross-section: inset from the outline, height, and normal. */
export type ProfilePoint = {
  /** Distance inwards from the plan outline. */
  inset: number;
  y: number;
  /** Normal in the (outward, up) plane. */
  nOut: number;
  nUp: number;
};

/**
 * Vertical profile of a slab of height `height` with a rounded bottom edge
 * (radius `bottom`) and a rounded top edge (radius `top`); flat vertical wall
 * in between. Runs from the bottom face to the top face.
 */
export function slabProfile(
  height: number,
  bottom: number,
  top: number,
  segments = 8,
): ProfilePoint[] {
  const points: ProfilePoint[] = [];
  for (let index = 0; index <= segments; index++) {
    const a = -Math.PI / 2 + (index / segments) * (Math.PI / 2);
    points.push({
      inset: bottom - bottom * Math.cos(a),
      y: bottom + bottom * Math.sin(a),
      nOut: Math.cos(a),
      nUp: Math.sin(a),
    });
  }
  for (let index = 0; index <= segments; index++) {
    const a = (index / segments) * (Math.PI / 2);
    points.push({
      inset: top - top * Math.cos(a),
      y: height - top + top * Math.sin(a),
      nOut: Math.cos(a),
      nUp: Math.sin(a),
    });
  }
  return points;
}

/** Plan outline of a rounded rectangle, with outward normals per point. */
export function roundedRectOutline(
  width: number,
  depth: number,
  radius: number,
  segments = 14,
) {
  const a = width / 2 - radius;
  const b = depth / 2 - radius;
  const points: { x: number; z: number; nx: number; nz: number }[] = [];
  // Quadrants in order of increasing angle: +x+z, -x+z, -x-z, +x-z.
  const centers = [
    [a, b],
    [-a, b],
    [-a, -b],
    [a, -b],
  ];
  for (let q = 0; q < 4; q++) {
    for (let index = 0; index <= segments; index++) {
      const angle = (q + index / segments) * (Math.PI / 2);
      const nx = Math.cos(angle);
      const nz = Math.sin(angle);
      points.push({
        x: centers[q][0] + radius * nx,
        z: centers[q][1] + radius * nz,
        nx,
        nz,
      });
    }
  }
  return points;
}

export type Outline = ReturnType<typeof roundedRectOutline>;

/** The same outline moved to (x, z) in plan. */
export function moveOutline(outline: Outline, x: number, z: number): Outline {
  return outline.map((point) => ({ ...point, x: point.x + x, z: point.z + z }));
}

/** The outline as a THREE.Path in plan (x, -z) coordinates, inset by `inset`. */
function outlinePath(outline: Outline, inset: number, path: THREE.Path) {
  outline.forEach((point, index) => {
    const x = point.x - point.nx * inset;
    // Shapes are built in the xy plane and rotated to lie flat (y → -z).
    const y = -(point.z - point.nz * inset);
    if (index === 0) path.moveTo(x, y);
    else path.lineTo(x, y);
  });
  path.closePath();
  return path;
}

/**
 * A rounded-rectangle slab swept along a vertical profile, with flat caps.
 * `holes` are cut out of the top cap (keyboard well, trackpad), each given
 * as the outline of the opening.
 */
export function profiledSlab(
  width: number,
  depth: number,
  radius: number,
  profile: ProfilePoint[],
  {
    segments = 14,
    capTop = true,
    capBottom = true,
    holes = [] as Outline[],
  } = {},
) {
  const outline = roundedRectOutline(width, depth, radius, segments);
  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];
  const count = outline.length;
  for (const p of profile) {
    for (const point of outline) {
      positions.push(
        point.x - point.nx * p.inset,
        p.y,
        point.z - point.nz * p.inset,
      );
      normals.push(point.nx * p.nOut, p.nUp, point.nz * p.nOut);
    }
  }
  for (let ring = 0; ring < profile.length - 1; ring++) {
    for (let j = 0; j < count; j++) {
      const k = (j + 1) % count;
      const a = ring * count + j;
      const b = ring * count + k;
      const c = (ring + 1) * count + k;
      const d = (ring + 1) * count + j;
      indices.push(a, c, b, a, d, c);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setIndex(indices);
  const parts: THREE.BufferGeometry[] = [geometry];

  const cap = (p: ProfilePoint, up: boolean, cut: Outline[]) => {
    const shape = new THREE.Shape();
    outlinePath(outline, p.inset, shape);
    for (const hole of cut)
      shape.holes.push(outlinePath(hole, 0, new THREE.Path()));
    const capGeometry = new THREE.ShapeGeometry(shape, 1);
    capGeometry.deleteAttribute("uv");
    capGeometry.rotateX(-Math.PI / 2);
    if (!up) {
      // Face down: mirror the winding.
      const index = capGeometry.getIndex()!;
      for (let i = 0; i < index.count; i += 3) {
        const second = index.getX(i + 1);
        index.setX(i + 1, index.getX(i + 2));
        index.setX(i + 2, second);
      }
      const normal = capGeometry.getAttribute("normal");
      for (let i = 0; i < normal.count; i++) normal.setY(i, -1);
    }
    capGeometry.translate(0, p.y, 0);
    parts.push(capGeometry);
  };
  if (capBottom) cap(profile[0], false, []);
  if (capTop) cap(profile[profile.length - 1], true, holes);
  return mergeIndexed(parts);
}

/** Merge indexed geometries that share position + normal attributes. */
export function mergeIndexed(parts: THREE.BufferGeometry[]) {
  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];
  let offset = 0;
  for (const part of parts) {
    const position = part.getAttribute("position");
    const normal = part.getAttribute("normal");
    for (let i = 0; i < position.count; i++) {
      positions.push(position.getX(i), position.getY(i), position.getZ(i));
      normals.push(normal.getX(i), normal.getY(i), normal.getZ(i));
    }
    const index = part.getIndex();
    if (index)
      for (let i = 0; i < index.count; i++)
        indices.push(index.getX(i) + offset);
    else for (let i = 0; i < position.count; i++) indices.push(i + offset);
    offset += position.count;
    part.dispose();
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setIndex(indices);
  return geometry;
}

/**
 * The machined lip of an opening in a flat deck: a 45° chamfer from the deck
 * down into the opening, then a short vertical wall. Built from the opening's
 * outline, facing inwards (towards the opening's centre).
 */
export function openingLip(
  width: number,
  depth: number,
  radius: number,
  chamfer: number,
  wall: number,
  segments = 14,
) {
  const outline = roundedRectOutline(width, depth, radius, segments);
  // Rings from the bottom of the wall up to the deck; normals face inwards
  // (towards the opening's centre), so the "outward" component is negative.
  const s = Math.SQRT1_2;
  const rings: ProfilePoint[] = [
    { inset: chamfer, y: -chamfer - wall, nOut: -1, nUp: 0 },
    { inset: chamfer, y: -chamfer, nOut: -1, nUp: 0 },
    { inset: chamfer, y: -chamfer, nOut: -s, nUp: s },
    { inset: 0, y: 0, nOut: -s, nUp: s },
  ];
  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];
  for (const p of rings)
    for (const point of outline) {
      positions.push(
        point.x - point.nx * p.inset,
        p.y,
        point.z - point.nz * p.inset,
      );
      normals.push(point.nx * p.nOut, p.nUp, point.nz * p.nOut);
    }
  const count = outline.length;
  for (let ring = 0; ring < rings.length - 1; ring++) {
    if (ring === 1) continue; // the crease between wall and chamfer
    for (let j = 0; j < count; j++) {
      const k = (j + 1) % count;
      const a = ring * count + j;
      const b = ring * count + k;
      const c = (ring + 1) * count + k;
      const d = (ring + 1) * count + j;
      // Facing inwards: opposite winding to an outward slab wall.
      indices.push(a, b, c, a, c, d);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setIndex(indices);
  return { geometry, outline };
}

/** Flat rounded rectangle lying in the XZ plane, facing +y. */
export function flatRoundedRect(width: number, depth: number, radius: number) {
  const shape = new THREE.Shape();
  outlinePath(roundedRectOutline(width, depth, radius, 12), 0, shape);
  const geometry = new THREE.ShapeGeometry(shape, 1);
  geometry.rotateX(-Math.PI / 2);
  // Planar UVs over the rectangle (0–1 both ways, v = 1 at the back edge).
  const position = geometry.getAttribute("position");
  const uv = new Float32Array(position.count * 2);
  for (let i = 0; i < position.count; i++) {
    uv[i * 2] = position.getX(i) / width + 0.5;
    uv[i * 2 + 1] = 0.5 - position.getZ(i) / depth;
  }
  geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return geometry;
}

/** Rounded-rectangle frame (outer minus inner), flat in XZ, facing +y. */
export function flatFrame(
  width: number,
  depth: number,
  radius: number,
  border: number,
) {
  const shape = new THREE.Shape();
  outlinePath(roundedRectOutline(width, depth, radius, 12), 0, shape);
  shape.holes.push(
    outlinePath(
      roundedRectOutline(
        width - border * 2,
        depth - border * 2,
        Math.max(0.0005, radius - border),
        12,
      ),
      0,
      new THREE.Path(),
    ),
  );
  const geometry = new THREE.ShapeGeometry(shape, 1);
  geometry.deleteAttribute("uv");
  geometry.rotateX(-Math.PI / 2);
  return geometry;
}

type Run = { x: number; y: number; nx: number; ny: number }[];

/**
 * A waterfall table in one bent sheet of glass: a flat top whose two ends
 * curve down into legs, seen front-on as a thick "∩". The cross-section is
 * swept from back to front with rounded front and back edges, so every
 * polished arris catches the light. `aEdge` is 0 on the faces of the sheet
 * and 1 on its front/back edge faces (where light crosses the full depth).
 */
export function waterfallSlab({
  left,
  right,
  thickness,
  radius,
  height,
  depth,
  edge,
  arcSegments = 28,
  edgeSegments = 6,
}: {
  left: number;
  right: number;
  thickness: number;
  /** Outer radius of each bend. */
  radius: number;
  height: number;
  depth: number;
  /** Radius of the rounded front and back edges. */
  edge: number;
  arcSegments?: number;
  edgeSegments?: number;
}) {
  const inner = radius - thickness;
  const arc = (
    cx: number,
    r: number,
    from: number,
    to: number,
    sign: 1 | -1,
  ): Run =>
    Array.from({ length: arcSegments + 1 }, (_, index) => {
      const a = from + ((to - from) * index) / arcSegments;
      return {
        x: cx + r * Math.cos(a),
        y: -radius + r * Math.sin(a),
        nx: sign * Math.cos(a),
        ny: sign * Math.sin(a),
      };
    });
  const line = (
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    nx: number,
    ny: number,
  ): Run => [
    { x: x0, y: y0, nx, ny },
    { x: x1, y: y1, nx, ny },
  ];
  const h = Math.PI / 2;
  // Clockwise seen from the front, starting at the top's left end.
  const runs: Run[] = [
    line(left, 0, right, 0, 0, 1),
    arc(right, radius, h, 0, 1),
    line(right + radius, -radius, right + radius, -height, 1, 0),
    line(right + radius, -height, right + inner, -height, 0, -1),
    line(right + inner, -height, right + inner, -radius, -1, 0),
    arc(right, inner, 0, h, -1),
    line(right, -thickness, left, -thickness, 0, -1),
    arc(left, inner, h, Math.PI, -1),
    line(left - inner, -radius, left - inner, -height, 1, 0),
    line(left - inner, -height, left - radius, -height, 0, -1),
    line(left - radius, -height, left - radius, -radius, -1, 0),
    arc(left, radius, Math.PI, h, 1),
  ];

  // Along z: back edge (rounded), the straight run, front edge (rounded).
  const rings: { z: number; inset: number; side: number; nz: number }[] = [];
  for (let index = edgeSegments; index >= 0; index--) {
    const b = (index / edgeSegments) * h;
    rings.push({
      z: -depth / 2 + edge - edge * Math.sin(b),
      inset: edge - edge * Math.cos(b),
      side: Math.cos(b),
      nz: -Math.sin(b),
    });
  }
  for (let index = 0; index <= edgeSegments; index++) {
    const b = (index / edgeSegments) * h;
    rings.push({
      z: depth / 2 - edge + edge * Math.sin(b),
      inset: edge - edge * Math.cos(b),
      side: Math.cos(b),
      nz: Math.sin(b),
    });
  }

  const positions: number[] = [];
  const normals: number[] = [];
  const edges: number[] = [];
  const indices: number[] = [];
  const vertex = (
    x: number,
    y: number,
    z: number,
    nx: number,
    ny: number,
    nz: number,
    e: number,
  ) => {
    positions.push(x, y, z);
    normals.push(nx, ny, nz);
    edges.push(e);
    return positions.length / 3 - 1;
  };
  for (const run of runs) {
    const start = positions.length / 3;
    for (const ring of rings)
      for (const p of run) {
        const length = Math.hypot(p.nx * ring.side, p.ny * ring.side, ring.nz);
        vertex(
          p.x - p.nx * ring.inset,
          p.y - p.ny * ring.inset,
          ring.z,
          (p.nx * ring.side) / length,
          (p.ny * ring.side) / length,
          ring.nz / length,
          Math.abs(ring.nz),
        );
      }
    const count = run.length;
    for (let r = 0; r < rings.length - 1; r++)
      for (let i = 0; i < count - 1; i++) {
        const a = start + r * count + i;
        const b = a + 1;
        const c = a + count + 1;
        const d = a + count;
        indices.push(a, c, b, a, d, c);
      }
  }

  // Front and back faces: the outline inset by the edge radius.
  const contour: THREE.Vector2[] = [];
  for (const run of runs)
    for (const [index, p] of run.entries()) {
      const point = new THREE.Vector2(p.x - p.nx * edge, p.y - p.ny * edge);
      // Square corners at the feet of the legs: meet the inset lines there.
      if (Math.abs(p.y + height) < 1e-9) {
        point.y = -height + edge;
        if (p.ny < -0.5) {
          const other = run[index === 0 ? 1 : 0];
          point.x += Math.sign(other.x - p.x) * edge;
        }
      }
      const last = contour[contour.length - 1];
      if (!last || last.distanceToSquared(point) > 1e-10) contour.push(point);
    }
  if (contour[0].distanceToSquared(contour[contour.length - 1]) < 1e-10)
    contour.pop();
  const faces = THREE.ShapeUtils.triangulateShape(contour, []);
  for (const side of [-1, 1]) {
    const start = positions.length / 3;
    for (const point of contour)
      vertex(point.x, point.y, (side * depth) / 2, 0, 0, side, 1);
    for (const [a, b, c] of faces) {
      const pa = contour[a];
      const pb = contour[b];
      const pc = contour[c];
      const area =
        (pb.x - pa.x) * (pc.y - pa.y) - (pc.x - pa.x) * (pb.y - pa.y);
      // Counter-clockwise (seen from outside) faces the viewer.
      if (area * side > 0) indices.push(start + a, start + b, start + c);
      else indices.push(start + a, start + c, start + b);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("aEdge", new THREE.Float32BufferAttribute(edges, 1));
  geometry.setIndex(indices);
  return geometry;
}
