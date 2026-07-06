// =====================================================
// BOYLE'S LAW INTERACTIVE
// P1 × V1 = P2 × V2
// Temperature remains constant.
// =====================================================


// =====================================================
// DOM ELEMENTS
// =====================================================

const slider = document.getElementById("volumeSlider");
const volumeText = document.getElementById("volumeText");
const pressureText = document.getElementById("pressureText");
const mathBox = document.getElementById("mathBox");
const pistonImage = document.getElementById("pistonImage");
const gaugeNeedle = document.getElementById("gaugeNeedle");
const gasCanvas = document.getElementById("gasCanvas");
const ctx = gasCanvas.getContext("2d");


// =====================================================
// BOYLE'S LAW SETTINGS
// =====================================================

const START_VOLUME = 2.0;      // liters
const MIN_VOLUME = 0.6;        // liters
const MAX_VOLUME = 2.0;        // liters
const START_PRESSURE = 100;    // psi

// At 2.00 L, pressure = 100 psi.
// At 0.60 L, pressure = 333 psi.
function calculatePressure(volume) {
  return (START_PRESSURE * START_VOLUME) / volume;
}


// =====================================================
// MOTION CALIBRATION
// Adjust these if your images need fine tuning.
// =====================================================

// Piston vertical movement in pixels.
const PISTON_MIN_Y = 0;
const PISTON_MAX_Y = 165;

// Gauge needle rotation.
// These angles may need calibration based on your needle image.
const NEEDLE_ANGLE_AT_100_PSI = 180;
const NEEDLE_ANGLE_AT_500_PSI = 405;


// =====================================================
// GAS CANVAS SETTINGS
// =====================================================

const GAS_LEFT = 32;
const GAS_RIGHT = 328;
const GAS_BOTTOM = 500;

// When max volume, the gas area is taller.
// When min volume, the top of the gas area moves downward.
const GAS_TOP_MAX_VOLUME = 90;
const GAS_TOP_MIN_VOLUME = 255;

const molecules = [];
const MOLECULE_COUNT = 52;

function createMolecules() {
  molecules.length = 0;

  for (let i = 0; i < MOLECULE_COUNT; i++) {
    molecules.push({
      x: GAS_LEFT + Math.random() * (GAS_RIGHT - GAS_LEFT),
      y: GAS_TOP_MAX_VOLUME + Math.random() * (GAS_BOTTOM - GAS_TOP_MAX_VOLUME),
      vx: (Math.random() < 0.5 ? -1 : 1) * (0.85 + Math.random() * 0.9),
      vy: (Math.random() < 0.5 ? -1 : 1) * (0.85 + Math.random() * 0.9),
      r: 4 + Math.random() * 2
    });
  }
}

createMolecules();


// =====================================================
// FORMATTERS
// =====================================================

function formatVolume(volume) {
  return `${volume.toFixed(2)}L`;
}

function formatPressure(pressure) {
  return `${Math.round(pressure)}psi`;
}


// =====================================================
// NORMALIZE SLIDER
// 0 = max volume
// 1 = min volume
// =====================================================

function getCompressionPercent(volume) {
  return (MAX_VOLUME - volume) / (MAX_VOLUME - MIN_VOLUME);
}


// =====================================================
// UPDATE VISUALS
// =====================================================

function updateSimulation() {
  const volume = Number(slider.value);
  const pressure = calculatePressure(volume);
  const compression = getCompressionPercent(volume);

  // -----------------------------
  // Text readouts
  // -----------------------------
  volumeText.textContent = formatVolume(volume);
  pressureText.textContent = formatPressure(pressure);

  mathBox.textContent =
    `100 psi × 2.00 L = ${Math.round(pressure)} psi × ${volume.toFixed(2)} L`;

  // -----------------------------
  // Piston movement
  // -----------------------------
  const pistonY =
    PISTON_MIN_Y + compression * (PISTON_MAX_Y - PISTON_MIN_Y);

  pistonImage.style.transform = `translateY(${pistonY}px)`;

  // -----------------------------
  // Gauge needle movement
  // -----------------------------
  const clampedPressure = Math.max(100, Math.min(500, pressure));
  const pressurePercent = (clampedPressure - 100) / 400;

  const needleAngle =
    NEEDLE_ANGLE_AT_100_PSI +
    pressurePercent * (NEEDLE_ANGLE_AT_500_PSI - NEEDLE_ANGLE_AT_100_PSI);

  gaugeNeedle.style.transform = `rotate(${needleAngle}deg)`;

  // -----------------------------
  // Gas boundary
  // -----------------------------
  const gasTop =
    GAS_TOP_MAX_VOLUME +
    compression * (GAS_TOP_MIN_VOLUME - GAS_TOP_MAX_VOLUME);

  return {
    volume,
    pressure,
    compression,
    gasTop
  };
}


// =====================================================
// DRAW MOLECULES
// =====================================================

function drawGas() {
  const state = updateSimulation();

  ctx.clearRect(0, 0, gasCanvas.width, gasCanvas.height);

  // Clip the molecules inside the gas chamber.
  ctx.save();
  ctx.beginPath();
  ctx.rect(
    GAS_LEFT,
    state.gasTop,
    GAS_RIGHT - GAS_LEFT,
    GAS_BOTTOM - state.gasTop
  );
  ctx.clip();

  // Slight gas fill.
  const gasGradient = ctx.createLinearGradient(0, state.gasTop, 0, GAS_BOTTOM);
  gasGradient.addColorStop(0, "rgba(255, 255, 255, 0.05)");
  gasGradient.addColorStop(1, "rgba(190, 220, 240, 0.14)");

  ctx.fillStyle = gasGradient;
  ctx.fillRect(
    GAS_LEFT,
    state.gasTop,
    GAS_RIGHT - GAS_LEFT,
    GAS_BOTTOM - state.gasTop
  );

  // Molecules move faster as pressure increases.
  const speedBoost = 1 + state.compression * 0.65;

  for (const molecule of molecules) {
    molecule.x += molecule.vx * speedBoost;
    molecule.y += molecule.vy * speedBoost;

    if (molecule.x - molecule.r < GAS_LEFT) {
      molecule.x = GAS_LEFT + molecule.r;
      molecule.vx *= -1;
    }

    if (molecule.x + molecule.r > GAS_RIGHT) {
      molecule.x = GAS_RIGHT - molecule.r;
      molecule.vx *= -1;
    }

    if (molecule.y - molecule.r < state.gasTop) {
      molecule.y = state.gasTop + molecule.r;
      molecule.vy *= -1;
    }

    if (molecule.y + molecule.r > GAS_BOTTOM) {
      molecule.y = GAS_BOTTOM - molecule.r;
      molecule.vy *= -1;
    }

    ctx.beginPath();
    ctx.arc(molecule.x, molecule.y, molecule.r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(44, 166, 213, 0.88)";
    ctx.fill();

    ctx.lineWidth = 1.25;
    ctx.strokeStyle = "rgba(8, 113, 153, 0.95)";
    ctx.stroke();

    // Highlight
    ctx.beginPath();
    ctx.arc(
      molecule.x - molecule.r * 0.35,
      molecule.y - molecule.r * 0.35,
      molecule.r * 0.28,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
    ctx.fill();
  }

  ctx.restore();

  requestAnimationFrame(drawGas);
}


// =====================================================
// RESPONSIVE STAGE SCALING
// =====================================================

function scaleStageToWindow() {
  const stage = document.getElementById("stage");

  const baseWidth = 1600;
  const baseHeight = 900;

  const scale = Math.min(
    window.innerWidth / baseWidth,
    window.innerHeight / baseHeight
  );

  stage.style.transform = `scale(${scale})`;
  stage.style.width = `${baseWidth}px`;
  stage.style.height = `${baseHeight}px`;
}


// =====================================================
// INIT
// =====================================================

slider.addEventListener("input", updateSimulation);
window.addEventListener("resize", scaleStageToWindow);

scaleStageToWindow();
updateSimulation();
drawGas();
