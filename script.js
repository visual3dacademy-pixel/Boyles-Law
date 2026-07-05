const slider = document.getElementById("volume-slider");
const volumeText = document.getElementById("volume-text");
const pressureText = document.getElementById("pressure-text");
const mathString = document.getElementById("math-string");
const pistonAssembly = document.querySelector(".piston-assembly");
const gaugeNeedle = document.getElementById("gauge-needle");
const canvas = document.getElementById("gas-canvas");
const ctx = canvas.getContext("2d");

const START_VOLUME = 2.0;
const START_PRESSURE = 100;
const MIN_VOLUME = 0.6;
const MAX_VOLUME = 2.0;

const PISTON_TOP = 35;
const PISTON_BOTTOM = 210;

const NEEDLE_START_ANGLE = -90;
const NEEDLE_END_ANGLE = 35;

let molecules = [];

for (let i = 0; i < 45; i++) {
    molecules.push({
        x: Math.random() * canvas.width,
        y: 120 + Math.random() * 190,
        vx: (Math.random() - 0.5) * 2.2,
        vy: (Math.random() - 0.5) * 2.2,
        r: 4 + Math.random() * 2
    });
}

function getPressure(volume) {
    return (START_PRESSURE * START_VOLUME) / volume;
}

function updateSimulation() {
    const volume = parseFloat(slider.value);
    const pressure = getPressure(volume);

    const percentCompressed = (MAX_VOLUME - volume) / (MAX_VOLUME - MIN_VOLUME);

    const pistonY = PISTON_TOP + percentCompressed * (PISTON_BOTTOM - PISTON_TOP);
    const needleAngle = NEEDLE_START_ANGLE + percentCompressed * (NEEDLE_END_ANGLE - NEEDLE_START_ANGLE);

    volumeText.textContent = `${volume.toFixed(2)}L`;
    pressureText.textContent = `${Math.round(pressure)}psi`;

    mathString.textContent = `100 psi × 2.00 L = ${Math.round(pressure)} psi × ${volume.toFixed(2)} L`;

    pistonAssembly.style.transform = `translateY(${pistonY}px)`;
    gaugeNeedle.style.transform = `rotate(${needleAngle}deg)`;

    return pistonY;
}

function drawMolecules() {
    const pistonY = updateSimulation();

    const gasTop = pistonY + 85;
    const gasBottom = canvas.height - 20;
    const gasLeft = 15;
    const gasRight = canvas.width - 15;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    molecules.forEach(m => {
        m.x += m.vx;
        m.y += m.vy;

        if (m.x < gasLeft || m.x > gasRight) m.vx *= -1;
        if (m.y < gasTop || m.y > gasBottom) m.vy *= -1;

        m.x = Math.max(gasLeft, Math.min(gasRight, m.x));
        m.y = Math.max(gasTop, Math.min(gasBottom, m.y));

        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fillStyle = "#2da9df";
        ctx.fill();
        ctx.strokeStyle = "#0878a8";
        ctx.lineWidth = 1;
        ctx.stroke();
    });

    requestAnimationFrame(drawMolecules);
}

slider.addEventListener("input", updateSimulation);

updateSimulation();
drawMolecules();
