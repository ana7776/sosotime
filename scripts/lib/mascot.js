let uid = 0;

export function buildMascot(cx, cy, r, { cheer = false } = {}) {
  uid += 1;
  const clipId = `mouthClip-${uid}`;
  const sw = Math.max(6, r * 0.07);
  const eyeSw = Math.max(5, r * 0.09);
  const eyeSpan = r * 0.56;
  const eyeDrop = r * 0.36;

  const eye = (dir) => {
    const ex = cx + dir * r * 0.42;
    return `<path d="M ${ex - eyeSpan / 2} ${cy - eyeDrop * 0.46} L ${ex} ${cy - eyeDrop} L ${ex + eyeSpan / 2} ${cy - eyeDrop * 0.46}" stroke="#1a1a1a" stroke-width="${eyeSw}" fill="none" stroke-linecap="round" stroke-linejoin="round" />`;
  };

  const mouthRx = r * 0.5;
  const mouthRy = r * 0.34;
  const mouthCy = cy + r * 0.38;

  return `<g>
    ${cheer ? buildArms(cx, cy, r) : ""}
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="#ffffff" stroke="#1a1a1a" stroke-width="${sw}" />
    ${eye(-1)}
    ${eye(1)}
    <ellipse cx="${cx}" cy="${mouthCy + r * 0.02}" rx="${mouthRx * 1.16}" ry="${mouthRy * 1.16}" fill="#141414" />
    <ellipse cx="${cx}" cy="${mouthCy}" rx="${mouthRx}" ry="${mouthRy}" fill="#e6273f" />
    <clipPath id="${clipId}"><ellipse cx="${cx}" cy="${mouthCy}" rx="${mouthRx}" ry="${mouthRy}" /></clipPath>
    <g clip-path="url(#${clipId})">
      <rect x="${cx - mouthRx * 1.05}" y="${mouthCy - mouthRy * 0.72}" width="${mouthRx * 2.1}" height="${mouthRy * 0.5}" fill="#ffffff" />
      <ellipse cx="${cx}" cy="${mouthCy + mouthRy * 0.78}" rx="${mouthRx * 0.58}" ry="${mouthRy * 0.5}" fill="#ff8fa3" />
    </g>
  </g>`;
}

function buildArms(cx, cy, r) {
  const arm = (dir) => {
    const shoulderX = cx + dir * r * 0.62;
    const shoulderY = cy + r * 0.88;
    const elbowX = cx + dir * r * 1.18;
    const elbowY = cy + r * 0.18;
    const fistX = cx + dir * r * 1.32;
    const fistY = cy - r * 0.78;
    const armWidth = r * 0.3;
    return `<path d="M ${shoulderX.toFixed(1)} ${shoulderY.toFixed(1)} Q ${elbowX.toFixed(1)} ${elbowY.toFixed(1)} ${fistX.toFixed(1)} ${fistY.toFixed(1)}" stroke="#1a1a1a" stroke-width="${armWidth.toFixed(1)}" fill="none" stroke-linecap="round" />
    <circle cx="${fistX.toFixed(1)}" cy="${fistY.toFixed(1)}" r="${(r * 0.27).toFixed(1)}" fill="#ffffff" stroke="#1a1a1a" stroke-width="${(r * 0.09).toFixed(1)}" />`;
  };
  return `${arm(-1)}${arm(1)}`;
}
