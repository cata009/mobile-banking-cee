/** Original Figma Standard paint935:48083; generated CSS32.305% stops are not its source geometry. */
export const STANDARD_SOURCE_IMAGE_HASH = '6f8736f05a24b87b9ef5508cfd9021e9a466bf48';
export const STANDARD_SOURCE_PAINTS = [
  {
    "type": "GRADIENT_LINEAR",
    "opacity": 1,
    "blendMode": "NORMAL",
    "gradientTransform": [
      [
        -0.184892937541008,
        0.7900813817977905,
        0.5998585820198059
      ],
      [
        -0.636967122554779,
        0.22977197170257568,
        0.6744512319564819
      ]
    ],
    "gradientStops": [
      {
        "position": 0.10000000149011612,
        "color": {
          "r": 0.7019608020782471,
          "g": 0.843137264251709,
          "b": 0.8117647171020508,
          "a": 1
        }
      },
      {
        "position": 1,
        "color": {
          "r": 0.14901961386203766,
          "g": 0.14901961386203766,
          "b": 0.14901961386203766,
          "a": 1
        }
      }
    ]
  },
  {
    "type": "GRADIENT_RADIAL",
    "opacity": 0.20000000298023224,
    "blendMode": "SOFT_LIGHT",
    "gradientTransform": [
      [
        -0.00047987280413508415,
        1.0011299848556519,
        -0.0008900041575543582
      ],
      [
        -0.8084027767181396,
        -0.002158178947865963,
        0.9063596129417419
      ]
    ],
    "gradientStops": [
      {
        "position": 0.5192307829856873,
        "color": {
          "r": 0.929411768913269,
          "g": 1,
          "b": 0.8745098114013672,
          "a": 1
        }
      },
      {
        "position": 1,
        "color": {
          "r": 0.14901961386203766,
          "g": 0.14901961386203766,
          "b": 0.14901961386203766,
          "a": 1
        }
      }
    ]
  },
  {
    "type": "GRADIENT_RADIAL",
    "opacity": 0.20000000298023224,
    "blendMode": "NORMAL",
    "gradientTransform": [
      [
        -0.03510032966732979,
        0.694172203540802,
        0.32337793707847595
      ],
      [
        -1.3275645971298218,
        -0.37387263774871826,
        1.5376551151275635
      ]
    ],
    "gradientStops": [
      {
        "position": 0,
        "color": {
          "r": 0.08906252682209015,
          "g": 0.078125,
          "b": 0.125,
          "a": 0
        }
      },
      {
        "position": 1,
        "color": {
          "r": 0,
          "g": 0,
          "b": 0,
          "a": 1
        }
      }
    ]
  }
] as const;

type StandardPaint = (typeof STANDARD_SOURCE_PAINTS)[number];
type PaintTransform = readonly [readonly [number, number, number], readonly [number, number, number]];

function inverseSvgMatrix(transform: PaintTransform) {
  const [[a,c,e],[b,d,f]] = transform;
  const determinant = a*d-b*c;
  return [d/determinant,-b/determinant,-c/determinant,a/determinant,(c*f-d*e)/determinant,(b*e-a*f)/determinant].join(' ');
}

function svgPaint(paint: StandardPaint, index: number) {
  const id = 'standard-fill-' + index;
  const stops = paint.gradientStops.map(({position,color}) => `<stop offset='${position}' stop-color='rgb(${Math.round(color.r*255)},${Math.round(color.g*255)},${Math.round(color.b*255)})' stop-opacity='${color.a}'/>`).join('');
  const common = `id='${id}' gradientUnits='userSpaceOnUse' gradientTransform='matrix(${inverseSvgMatrix(paint.gradientTransform)})'`;
  const gradient = paint.type === 'GRADIENT_LINEAR' ? `<linearGradient ${common} x1='0' y1='0.5' x2='1' y2='0.5'>${stops}</linearGradient>` : `<radialGradient ${common} cx='0.5' cy='0.5' r='0.5'>${stops}</radialGradient>`;
  return `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1' preserveAspectRatio='none'><defs>${gradient}</defs><rect width='1' height='1' opacity='${paint.opacity}' fill='url(#${id})'/></svg>`;
}

export const STANDARD_FILL_SVGS = [svgPaint(STANDARD_SOURCE_PAINTS[0],0),svgPaint(STANDARD_SOURCE_PAINTS[1],1),svgPaint(STANDARD_SOURCE_PAINTS[2],2)] as const;
export const STANDARD_BACKGROUND_LAYERS = STANDARD_FILL_SVGS.map(svg => `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`);

