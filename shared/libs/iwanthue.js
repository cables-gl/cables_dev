var IWantHue = (function () {
  'use strict';

  /**
   * Iwanthue RNG Utilities
   * =======================
   *
   * Simple & fast seedable RNG.
   *
   * [References]:
   * https://gist.github.com/blixt/f17b47c62508be59987b
   * http://www.firstpr.com.au/dsp/rand31/
   *
   */

  function randomInteger(a, b) {
    return a + Math.floor(Math.random() * (b - a + 1));
  }

  function Random$1(seed) {
    if (!seed)
      seed = randomInteger(0, Math.pow(2, 31) - 1);

    this.seed = seed % 2147483647;

    if (this.seed <= 0)
      this.seed += 2147483646;
  }

  Random$1.prototype.next = function() {
    this.seed = (this.seed * 16807) % 2147483647;

    return this.seed;
  };

  Random$1.prototype.nextFloat = function() {
    return (this.next() - 1) / 2147483646;
  };

  var rng = Random$1;

  var helpers$2 = {};

  /**
   * Iwanthue Library Helpers
   * =========================
   *
   * Collection of color-related helpers used throughout the library.
   */

  var LAB_CONSTANTS = {
    // Corresponds roughly to RGB brighter/darker
    Kn: 18,

    // D65 standard referent
    Xn: 0.95047,
    Yn: 1,
    Zn: 1.08883,

    t0: 0.137931034, // 4 / 29
    t1: 0.206896552, // 6 / 29
    t2: 0.12841855, // 3 * t1 * t1
    t3: 0.008856452 // t1 * t1 * t1
  };

  function xyzToRgb(r) {
    return Math.round(
      255 *
      (r <= 0.00304 ? 12.92 * r : 1.055 * Math.pow(r, 1 / 2.4) - 0.055)
    );
  }

  function rgbToXyzHelper(r) {
    if ((r /= 255) <= 0.04045)
      return r / 12.92;

    return Math.pow((r + 0.055) / 1.055, 2.4);
  }

  function xyzToLab(t) {
    if (t > LAB_CONSTANTS.t3)
      return Math.pow(t, 1 / 3);

      return t / LAB_CONSTANTS.t2 + LAB_CONSTANTS.t0;
  }

  function rgbToXyz(rgb) {
    var r = rgb[0],
        g = rgb[1],
        b = rgb[2];

    r = rgbToXyzHelper(r);
    g = rgbToXyzHelper(g);
    b = rgbToXyzHelper(b);

    var x = xyzToLab((0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / LAB_CONSTANTS.Xn),
        y = xyzToLab((0.2126729 * r + 0.7151522 * g + 0.0721750 * b) / LAB_CONSTANTS.Yn),
        z = xyzToLab((0.0193339 * r + 0.1191920 * g + 0.9503041 * b) / LAB_CONSTANTS.Zn);

    return [x, y, z];
  }

  function labToXyz(t) {
    return t > LAB_CONSTANTS.t1 ?
      t * t * t :
      LAB_CONSTANTS.t2 * (t - LAB_CONSTANTS.t0);
  }

  function labToRgb$1(lab) {
    var l = lab[0];
    var a = lab[1];
    var b = lab[2];

    var y = (l + 16) / 116;
    var x = isNaN(a) ? y : y + a / 500;
    var z = isNaN(b) ? y : y - b / 200;

    y = LAB_CONSTANTS.Yn * labToXyz(y);
    x = LAB_CONSTANTS.Xn * labToXyz(x);
    z = LAB_CONSTANTS.Zn * labToXyz(z);

    var r = xyzToRgb(3.2404542 * x - 1.5371385 * y - 0.4985314 * z); // D65 -> sRGB
    var g = xyzToRgb(-0.969266 * x + 1.8760108 * y + 0.041556 * z);
    b = xyzToRgb(0.0556434 * x - 0.2040259 * y + 1.0572252 * z);

    // r, g or b can be -0, beware...
    return [r, g, b];
  }

  function rgbToLab(rgb) {
    var xyz = rgbToXyz(rgb);

    var x = xyz[0],
        y = xyz[1],
        z = xyz[2];

    var l = 116 * y - 16;

    return [l < 0 ? 0 : l, 500 * (x - y), 200 * (y - z)];
  }

  function validateRgb$1(rgb) {
    var r = rgb[0];
    var g = rgb[1];
    var b = rgb[2];

    return r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255;
  }

  function hexPad(x) {
    return ('0' + x.toString(16)).slice(-2);
  }

  function labToRgbHex$1(lab) {
    var rgb = labToRgb$1(lab);

    return (
      '#' +
      hexPad(rgb[0]) +
      hexPad(rgb[1]) +
      hexPad(rgb[2])
    );
  }

  var RAD_TO_DEG = 180 / Math.PI;

  function labToHcl$1(lab) {
    var l = lab[0];
    var a = lab[1];
    var b = lab[2];

    var c = Math.sqrt(a * a + b * b);
    var h = (Math.atan2(b, a) * RAD_TO_DEG + 360) % 360;

    if (Math.round(c * 10000) === 0)
      h = NaN;

    return [h, c, l];
  }

  function diffSort$1(distance, colors) {
    colors = colors.slice();

    var diffColors = [colors.shift()];

    var index, maxDistance, candidateIndex;

    var A, B, d, i;

    while (colors.length > 0) {
      index = -1;
      maxDistance = -Infinity;

      for (candidateIndex = 0; candidateIndex < colors.length; candidateIndex++) {
        A = colors[candidateIndex];

        for (i = 0; i < diffColors.length; i++) {
          B = diffColors[i];
          d = distance(A, B);

          if (d > maxDistance) {
            maxDistance = d;
            index = candidateIndex;
          }
        }
      }

      diffColors.push(colors[index]);
      colors.splice(index, 1);
    }

    return diffColors;
  }

  function computeQualityMetrics(distance, colors) {
    var i, j, l;

    var min = Infinity, d;

    var S = 0, t = 0;

    for (i = 0, l = colors.length; i < l; i++) {
      for (j = i + 1; j < l; j++) {
        d = distance(colors[i], colors[j]);

        if (d < min)
          min = d;

        S += d;
        t++;
      }
    }

    return {min: min, mean: S / t};
  }

  helpers$2.validateRgb = validateRgb$1;
  helpers$2.labToRgb = labToRgb$1;
  helpers$2.labToRgbHex = labToRgbHex$1;
  helpers$2.rgbToLab = rgbToLab;
  helpers$2.labToHcl = labToHcl$1;
  helpers$2.diffSort = diffSort$1;
  helpers$2.computeQualityMetrics = computeQualityMetrics;

  /**
   * Iwanthue Distance Functions
   * ============================
   *
   * Bunch of color-related distance functions, some of which take daltonism
   * into account.
   */

  var helpers$1 = helpers$2;

  var CONFUSION_LINES = {
    protanope: {
      x: 0.7465,
      y: 0.2535,
      m: 1.273463,
      yint: -0.073894
    },
    deuteranope: {
      x: 1.4,
      y: -0.4,
      m: 0.968437,
      yint: 0.003331
    },
    tritanope: {
      x: 0.1748,
      y: 0.0,
      m: 0.062921,
      yint: 0.292119
    }
  };

  function euclidean(lab1, lab2) {
    return Math.sqrt(
      Math.pow(lab1[0] - lab2[0], 2) +
      Math.pow(lab1[1] - lab2[1], 2) +
      Math.pow(lab1[2] - lab2[2], 2)
    );
  }

  function cmc(l, c, lab1, lab2) {
    var L1 = lab1[0];
    var L2 = lab2[0];
    var a1 = lab1[1];
    var a2 = lab2[1];
    var b1 = lab1[2];
    var b2 = lab2[2];
    var C1 = Math.sqrt(Math.pow(a1, 2) + Math.pow(b1, 2));
    var C2 = Math.sqrt(Math.pow(a2, 2) + Math.pow(b2, 2));
    var deltaC = C1 - C2;
    var deltaL = L1 - L2;
    var deltaa = a1 - a2;
    var deltab = b1 - b2;
    var deltaH = Math.sqrt(
      Math.pow(deltaa, 2) + Math.pow(deltab, 2) + Math.pow(deltaC, 2)
    );
    var H1 = Math.atan2(b1, a1) * (180 / Math.PI);
    while (H1 < 0) {
      H1 += 360;
    }
    var F = Math.sqrt(Math.pow(C1, 4) / (Math.pow(C1, 4) + 1900));
    var T =
      H1 >= 164 && H1 <= 345
        ? 0.56 + Math.abs(0.2 * Math.cos(H1 + 168))
        : 0.36 + Math.abs(0.4 * Math.cos(H1 + 35));
    var S_L = lab1[0] < 16 ? 0.511 : (0.040975 * L1) / (1 + 0.01765 * L1);
    var S_C = (0.0638 * C1) / (1 + 0.0131 * C1) + 0.638;
    var S_H = S_C * (F * T + 1 - F);
    var result = Math.sqrt(
      Math.pow(deltaL / (l * S_L), 2) +
        Math.pow(deltaC / (c * S_C), 2) +
        Math.pow(deltaH / S_H, 2)
    );
    return result;
  }

  function CachedDistances$1() {
    this.cache = {};
  }

  CachedDistances$1.prototype.simulate = function(lab, type, amount) {
    amount = amount || 1;

    // Cache
    var key = lab.join('-') + '-' + type + '-' + amount;
    var cache = this.cache[key];
    if (cache)
      return cache;

    // Get data from type
    var confuseX = CONFUSION_LINES[type].x;
    var confuseY = CONFUSION_LINES[type].y;
    var confuseM = CONFUSION_LINES[type].m;
    var confuseYint = CONFUSION_LINES[type].yint;

    // Code adapted from http://galacticmilk.com/labs/Color-Vision/Javascript/Color.Vision.Simulate.js
    var color = helpers$1.labToRgb(lab);

    var sr = color[0];
    var sg = color[1];
    var sb = color[2];
    var dr = sr; // destination color
    var dg = sg;
    var db = sb;
    // Convert source color into XYZ color space
    var powR = Math.pow(sr, 2.2);
    var powG = Math.pow(sg, 2.2);
    var powB = Math.pow(sb, 2.2);
    var X = powR * 0.412424 + powG * 0.357579 + powB * 0.180464; // RGB->XYZ (sRGB:D65)
    var Y = powR * 0.212656 + powG * 0.715158 + powB * 0.0721856;
    var Z = powR * 0.0193324 + powG * 0.119193 + powB * 0.950444;
    // Convert XYZ into xyY Chromacity Coordinates (xy) and Luminance (Y)
    var chromaX = X / (X + Y + Z);
    var chromaY = Y / (X + Y + Z);
    // Generate the "Confusion Line" between the source color and the Confusion Point
    var m = (chromaY - confuseY) / (chromaX - confuseX); // slope of Confusion Line
    var yint = chromaY - chromaX * m; // y-intercept of confusion line (x-intercept = 0.0)
    // How far the xy coords deviate from the simulation
    var deviateX = (confuseYint - yint) / (m - confuseM);
    var deviateY = m * deviateX + yint;
    // Compute the simulated color's XYZ coords
    X = (deviateX * Y) / deviateY;
    Z = ((1.0 - (deviateX + deviateY)) * Y) / deviateY;
    // Neutral grey calculated from luminance (in D65)
    var neutralX = (0.312713 * Y) / 0.329016;
    var neutralZ = (0.358271 * Y) / 0.329016;
    // Difference between simulated color and neutral grey
    var diffX = neutralX - X;
    var diffZ = neutralZ - Z;
    var diffR = diffX * 3.24071 + diffZ * -0.498571; // XYZ->RGB (sRGB:D65)
    var diffG = diffX * -0.969258 + diffZ * 0.0415557;
    var diffB = diffX * 0.0556352 + diffZ * 1.05707;
    // Convert to RGB color space
    dr = X * 3.24071 + Y * -1.53726 + Z * -0.498571; // XYZ->RGB (sRGB:D65)
    dg = X * -0.969258 + Y * 1.87599 + Z * 0.0415557;
    db = X * 0.0556352 + Y * -0.203996 + Z * 1.05707;
    // Compensate simulated color towards a neutral fit in RGB space
    var fitR = ((dr < 0.0 ? 0.0 : 1.0) - dr) / diffR;
    var fitG = ((dg < 0.0 ? 0.0 : 1.0) - dg) / diffG;
    var fitB = ((db < 0.0 ? 0.0 : 1.0) - db) / diffB;
    var adjust = Math.max(
      // highest value
      fitR > 1.0 || fitR < 0.0 ? 0.0 : fitR,
      fitG > 1.0 || fitG < 0.0 ? 0.0 : fitG,
      fitB > 1.0 || fitB < 0.0 ? 0.0 : fitB
    );
    // Shift proportional to the greatest shift
    dr = dr + adjust * diffR;
    dg = dg + adjust * diffG;
    db = db + adjust * diffB;
    // Apply gamma correction
    dr = Math.pow(dr, 1.0 / 2.2);
    dg = Math.pow(dg, 1.0 / 2.2);
    db = Math.pow(db, 1.0 / 2.2);
    // Anomylize colors
    dr = sr * (1.0 - amount) + dr * amount;
    dg = sg * (1.0 - amount) + dg * amount;
    db = sb * (1.0 - amount) + db * amount;
    var dcolor = [dr, dg, db];
    var result = helpers$1.rgbToLab(dcolor);
    this.cache[key] = result;

    return result;
  };

  CachedDistances$1.prototype.euclidean = euclidean;
  CachedDistances$1.prototype.cmc = cmc.bind(null, 2, 1);

  CachedDistances$1.prototype.colorblind = function(type, lab1, lab2) {
    lab1 = this.simulate(lab1, type);
    lab2 = this.simulate(lab2, type);

    return this.cmc(lab1, lab2);
  };

  Object.keys(CONFUSION_LINES).forEach(function(type) {
    CachedDistances$1.prototype[type] = function(lab1, lab2) {
      return this.colorblind(type, lab1, lab2);
    };
  });

  var COMPROMISE_COUNT = 1000 + 100 + 500 + 1;

  CachedDistances$1.prototype.compromise = function(lab1, lab2) {
    var total = 0;

    var d = this.cmc(lab1, lab2);
    total += d * 1000;

    d = this.colorblind('protanope', lab1, lab2);
    if (!isNaN(d))
      total += d * 100;

    d = this.colorblind('deuteranope', lab1, lab2);
    if (!isNaN(d))
      total += d * 500;

    d = this.colorblind('tritanope', lab1, lab2);
    if (!isNaN(d))
      total += d * 1;

    return total / COMPROMISE_COUNT;
  };

  CachedDistances$1.prototype.get = function(name) {
    if (name in CONFUSION_LINES)
      return this.colorblind.bind(this, name);

    return this[name].bind(this);
  };

  var distances = CachedDistances$1;

  /**
   * Iwanthue Color Presets
   * =======================
   *
   * Website's collection of color space presets.
   */

  // Format is [hmin, hmax, cmin, cmax, lmin, lmax] to save up some space
  var presets$1 = {
    'all': [0, 360, 0, 100, 0, 100],
    'default': [0, 360, 30, 80, 35, 80],
    'sensible': [0, 360, 25.59, 55.59, 60.94, 90.94],
    'colorblind': [0, 360, 40, 70, 15, 85],
    'fancy-light': [0, 360, 15, 40, 70, 100],
    'fancy-dark': [0, 360, 8, 40, 7, 40],
    'shades': [0, 240, 0, 15, 0, 100],
    'tarnish': [0, 360, 0, 15, 30, 70],
    'pastel': [0, 360, 0, 30, 70, 100],
    'pimp': [0, 360, 30, 100, 25, 70],
    'intense': [0, 360, 20, 100, 15, 80],
    'fluo': [0, 300, 35, 100, 75, 100],
    'red-roses': [330, 20, 10, 100, 35, 100],
    'ochre-sand': [20, 60, 20, 50, 35, 100],
    'yellow-lime': [60, 90, 10, 100, 35, 100],
    'green-mint': [90, 150, 10, 100, 35, 100],
    'ice-cube': [150, 200, 0, 100, 35, 100],
    'blue-ocean': [220, 260, 8, 80, 0, 50],
    'indigo-night': [260, 290, 40, 100, 35, 100],
    'purple-wine': [290, 330, 0, 100, 0, 40]
  };

  var presets_1 = presets$1;

  /**
   * Iwanthue Library Endpoint
   * ==========================
   *
   * Exporting the main utilities of the library.
   */

  var Random = rng;
  var CachedDistances = distances;
  var helpers = helpers$2;
  var presets = presets_1;

  var validateRgb = helpers.validateRgb;
  var labToRgb = helpers.labToRgb;
  var labToRgbHex = helpers.labToRgbHex;
  var labToHcl = helpers.labToHcl;
  var diffSort = helpers.diffSort;

  /**
   * Constants.
   */
  var DEFAULT_SETTINGS = {
    attempts: 1,
    colorFilter: null,
    colorSpace: 'default',
    clustering: 'k-means',
    quality: 50,
    ultraPrecision: false,
    distance: 'euclidean',
    seed: null
  };

  var VALID_CLUSTERINGS = new Set(['force-vector', 'k-means']);

  var VALID_DISTANCES = new Set([
    'euclidean',
    'cmc',
    'compromise',
    'protanope',
    'deuteranope',
    'tritanope'
  ]);

  var VALID_PRESETS = new Set(Object.keys(presets));

  /**
   * Helpers.
   */
  function stringSum(string) {
    var sum = 0;

    for (var i = 0, l = string.length; i < l; i++)
      sum += string.charCodeAt(i);

    return sum;
  }

  function resolveAndValidateSettings(userSettings) {
    var settings = Object.assign({}, DEFAULT_SETTINGS, userSettings);

    if (typeof settings.attempts !== 'number' || settings.attempts <= 0)
      throw new Error('iwanthue: invalid `attempts` setting. Expecting a positive number.');

    if (settings.colorFilter && typeof settings.colorFilter !== 'function')
      throw new Error('iwanthue: invalid `colorFilter` setting. Expecting a function.');

    if (!VALID_CLUSTERINGS.has(settings.clustering))
      throw new Error('iwanthue: unknown `clustering` "' + settings.clustering + '".');

    if (typeof settings.quality !== 'number' || isNaN(settings.quality) || settings.quality < 1)
      throw new Error('iwanthue: invalid `quality`. Expecting a number > 0.');

    if (typeof settings.ultraPrecision !== 'boolean')
      throw new Error('iwanthue: invalid `ultraPrecision`. Expecting a boolean.');

    if (!VALID_DISTANCES.has(settings.distance))
      throw new Error('iwanthue: unknown `distance` "' + settings.distance + '".');

    if (typeof settings.seed === 'string')
      settings.seed = stringSum(settings.seed);

    if (settings.seed !== null && typeof settings.seed !== 'number')
      throw new Error('iwanthue: invalid `seed`. Expecting an integer or a string.');

    // Building color filter from preset?
    if (!settings.colorFilter) {
      if (
        settings.colorSpace &&
        settings.colorSpace !== 'all'
      ) {

        var preset;

        if (typeof settings.colorSpace === 'string') {
          if (!VALID_PRESETS.has(settings.colorSpace))
            throw new Error('iwanthue: unknown `colorSpace` "' + settings.colorSpace + '".');

          preset = presets[settings.colorSpace];
        }
        else if (Array.isArray(settings.colorSpace)) {

          if (settings.colorSpace.length !== 6)
            throw new Error('iwanthue: expecting a `colorSpace` array of length 6 ([hmin, hmax, cmin, cmax, lmin, lmax]).');

          preset = settings.colorSpace;
        }
        else {
          preset = [
            settings.colorSpace.hmin || 0,
            settings.colorSpace.hmax || 360,
            settings.colorSpace.cmin || 0,
            settings.colorSpace.cmax || 100,
            settings.colorSpace.lmin || 0,
            settings.colorSpace.lmax || 100
          ];
        }

        if (preset[0] < preset[1])
          settings.colorFilter = function(rgb, lab) {
            var hcl = labToHcl(lab);

            return (
              hcl[0] >= preset[0] && hcl[0] <= preset[1] &&
              hcl[1] >= preset[2] && hcl[1] <= preset[3] &&
              hcl[2] >= preset[4] && hcl[2] <= preset[5]
            );
          };
        else
        settings.colorFilter = function(rgb, lab) {
          var hcl = labToHcl(lab);

          return (
            (hcl[0] >= preset[0] || hcl[0] <= preset[1]) &&
            hcl[1] >= preset[2] && hcl[1] <= preset[3] &&
            hcl[2] >= preset[4] && hcl[2] <= preset[5]
          );
        };
      }
    }

    return settings;
  }

  // NOTE: this function has complexity O(∞).
  function sampleLabColors(rng, count, validColor) {
    var colors = new Array(count),
        lab,
        rgb;

    for (var i = 0; i < count; i++) {

      do {
        lab = [
          100 * rng(),
          100 * (2 * rng() - 1),
          100 * (2 * rng() - 1)
        ];

        rgb = labToRgb(lab);

      } while (!validColor(rgb, lab));

      colors[i] = lab;
    }

    return colors;
  }

  var REPULSION = 100;
  var SPEED = 100;

  function forceVector(rng, distance, validColor, colors, settings) {
    var vectors = new Array(colors.length);
    var steps = settings.quality * 20;

    var i, j, l = colors.length;

    var A, B;

    var d, dl, da, db, force, candidateLab, color, ratio, displacement, rgb;

    while (steps-- > 0) {

      // Initializing vectors
      for (i = 0; i < l; i++)
        vectors[i] = {dl: 0, da: 0, db: 0};

      // Computing force
      for (i = 0; i < l; i++) {
        A = colors[i];

        for (j = 0; j < i; j++) {
          B = colors[j];

          // Repulsion
          d = distance(A, B);

          if (d > 0) {
            dl = A[0] - B[0];
            da = A[1] - B[1];
            db = A[2] - B[2];

            force = REPULSION / Math.pow(d, 2);

            vectors[i].dl += (dl * force) / d;
            vectors[i].da += (da * force) / d;
            vectors[i].db += (db * force) / d;

            vectors[j].dl -= (dl * force) / d;
            vectors[j].da -= (da * force) / d;
            vectors[j].db -= (db * force) / d;
          }
          else {

            // Jitter
            vectors[j].dl += 2 - 4 * rng();
            vectors[j].da += 2 - 4 * rng();
            vectors[j].db += 2 - 4 * rng();
          }
        }
      }

      // Applying force
      for (i = 0; i < l; i++) {
        color = colors[i];
        displacement = SPEED * Math.sqrt(
          Math.pow(vectors[i].dl, 2) +
          Math.pow(vectors[i].da, 2) +
          Math.pow(vectors[i].db, 2)
        );

        if (displacement > 0) {
          ratio = (SPEED * Math.min(0.1, displacement)) / displacement;
          candidateLab = [
            color[0] + vectors[i].dl * ratio,
            color[1] + vectors[i].da * ratio,
            color[2] + vectors[i].db * ratio
          ];

          rgb = labToRgb(candidateLab);

          if (validColor(rgb, candidateLab))
            colors[i] = candidateLab;
        }
      }
    }
  }

  function kMeans(distance, validColor, colors, settings) {
    var colorSamples = [];
    var samplesClosest = [];

    var l, a, b;

    var lab, rgb;

    var linc = 5,
        ainc = 10,
        binc = 10;

    if (settings.ultraPrecision) {
      linc = 1;
      ainc = 5;
      binc = 5;
    }

    for (l = 0; l <= 100; l += linc) {
      for (a = -100; a <= 100; a += ainc) {
        for (b = -100; b <= 100; b += binc) {
          lab = [l, a, b];
          rgb = labToRgb(lab);

          if (!validColor(rgb, lab))
            continue;

          colorSamples.push(lab);
          samplesClosest.push(null);
        }
      }
    }

    // Steps
    var steps = settings.quality;

    var i, j;

    var A, B;

    var li = colorSamples.length,
        lj = colors.length;


    var d, minDistance, freeColorSamples, count, candidate, closest;

    while (steps-- > 0) {

      // Finding closest color
      for (i = 0; i < li; i++) {
        B = colorSamples[i];
        minDistance = Infinity;

        for (j = 0; j < lj; j++) {
          A = colors[j];

          d = distance(A, B);

          if (d < minDistance) {
            minDistance = d;
            samplesClosest[i] = j;
          }
        }
      }

      freeColorSamples = colorSamples.slice();

      for (j = 0; j < lj; j++) {
        count = 0;
        candidate = [0, 0, 0];

        for (i = 0; i < li; i++) {
          if (samplesClosest[i] === j) {
            count++;
            candidate[0] += colorSamples[i][0];
            candidate[1] += colorSamples[i][1];
            candidate[2] += colorSamples[i][2];
          }
        }

        if (count !== 0) {
          candidate[0] /= count;
          candidate[1] /= count;
          candidate[2] /= count;

          rgb = labToRgb(candidate);

          if (validColor(rgb, candidate)) {
            colors[j] = candidate;
          }
          else {
            // The candidate is out of the boundaries of our color space or unfound

            if (freeColorSamples.length > 0) {

              // We just search for the closest free color
              minDistance = Infinity;
              closest = -1;

              for (i = 0; i < freeColorSamples.length; i++) {
                d = distance(freeColorSamples[i], candidate);

                if (d < minDistance) {
                  minDistance = d;
                  closest = i;
                }
              }

              colors[j] = colorSamples[closest];
            }
            else {

              // Then we just search for the closest color
              minDistance = Infinity;
              closest = -1;

              for (i = 0; i < colorSamples.length; i++) {
                d = distance(colorSamples[i], candidate);

                if (d < minDistance) {
                  minDistance = d;
                  closest = i;
                }
              }

              colors[j] = colorSamples[closest];
            }

            // Cleaning up free samples
            /* eslint-disable */
            freeColorSamples = freeColorSamples.filter(function(color) {
              return (
                color[0] !== colors[j][0] ||
                color[1] !== colors[j][1] ||
                color[2] !== colors[j][2]
              )
            });
            /* eslint-enable */
          }
        }
      }
    }

    return colors;
  }

  /**
   * Function generating a iwanthue palette.
   *
   * @param  {number}   count            - Number of colors in the palette.
   * @param  {object}   settings         - Optional settings:
   * @param  {function}   colorFilter      - Function filtering unwanted colors.
   * @param  {string}     clustering       - Clustering method to use. Either 'force-vector' or 'k-means'.
   * @param  {number}     quality          - Quality of the clustering, i.e. number of steps/iterations.
   * @param  {boolean}    ultraPrecision   - Whether to use ultra precision or not.
   * @param  {string}     distance         - Name of the color distance function to use. Defaults to 'colorblind'.
   * @param  {number}     seed             - Seed for random number generation.
   * @return {Array}                     - The computed palette as an array of hexadecimal colors.
   */
  var iwanthue = function generatePalette(count, settings) {
    if (typeof count !== 'number' || count < 1)
      throw new Error('iwanthue: expecting a color count > 1.');

    settings = resolveAndValidateSettings(settings);

    var random = new Random(settings.seed);

    var rng = function() {
      return random.nextFloat();
    };

    var distances = new CachedDistances();
    var distance = distances.get(settings.distance);

    var validColor = function(rgb, lab) {
      // if (arguments.length < 2)
      //   throw new Error('validColor takes both rgb and lab!');

      if (!validateRgb(rgb))
        return false;

      if (!settings.colorFilter)
        return true;

      if (!settings.colorFilter(rgb, lab))
        return false;

      return true;
    };

    var colors;

    // In this case, we only sample a single color
    if (count === 1) {
      colors = sampleLabColors(rng, count, validColor);

      return [labToRgbHex(colors[0])];
    }

    var attempts = settings.attempts;

    var metrics;

    var bestMetric = -Infinity,
        best;

    while (attempts > 0) {
      colors = sampleLabColors(rng, count, validColor);

      if (settings.clustering === 'force-vector')
        forceVector(rng, distance, validColor, colors, settings);
      else
        kMeans(distance, validColor, colors, settings);

      metrics = helpers.computeQualityMetrics(distance, colors);

      if (metrics.min > bestMetric) {
        bestMetric = metrics.min;
        best = colors;
      }

      attempts--;
    }

    colors = best;
    colors = diffSort(distance, colors);

    return colors.map(labToRgbHex);
  };

  return iwanthue;

})();
