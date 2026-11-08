// Digital clock
setInterval(() => {
  let time = document.getElementById("current-time");
  let d = new Date();
  time.innerHTML = d.toLocaleTimeString() + " " + d.toLocaleDateString();
  document.getElementById("loader").style.display = 'none';
}, 1000);

// ---- Background distorted lines ----
function makeNoise() {
  let perm = new Uint8Array(512);
  for (let i = 0; i < 256; i++) perm[i] = i;
  for (let i = 255; i > 0; i--) {
    let j = Math.floor(Math.random() * (i+1));
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  for (let i = 0; i < 256; i++) perm[i+256] = perm[i];

  function fade(t){return t*t*t*(t*(t*6-15)+10);}
  function lerp(a,b,t){return a+(b-a)*t;}
  function grad(hash, x, y) {
    let h = hash & 3;
    return ((h&1) ? -x : x) + ((h&2) ? -y : y);
  }
  return function(x, y) {
    let X = Math.floor(x)&255, Y = Math.floor(y)&255;
    x -= Math.floor(x); y -= Math.floor(y);
    let u = fade(x), v = fade(y);
    let aa = perm[X+perm[Y]], ab = perm[X+perm[Y+1]];
    let ba = perm[X+1+perm[Y]], bb = perm[X+1+perm[Y+1]];
    return lerp(
      lerp(grad(aa,x,y), grad(ba,x-1,y), u),
      lerp(grad(ab,x,y-1), grad(bb,x-1,y-1), u),
      v
    );
  }
}

const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");
const noise = makeNoise();

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  draw();
}
window.addEventListener("resize", resize);

function draw() {
  const styles = getComputedStyle(document.documentElement);
  const bgColor = styles.getPropertyValue('--background-color').trim() || "#75989a";
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let step = 16; // vertical spacing
  for (let y = -100; y < canvas.height+100; y += step) {
    let lineNoise = noise(0, y*0.01);
    let thickness = 1 + (lineNoise+1) * 2.5;
    ctx.lineWidth = thickness;

    let shade = Math.floor(30 + (lineNoise+1)*20);
    ctx.strokeStyle = `rgb(${shade},${shade},${shade})`;

    ctx.beginPath();
    for (let x = -50; x < canvas.width+50; x += 6) {
      let n = noise(x*0.004, y*0.004) * 60;
      let offsetX = noise(x*0.004, y*0.002) * 40;
      let yy = y + n;
      if (x === -50) ctx.moveTo(x + offsetX, yy);
      else ctx.lineTo(x + offsetX, yy);
    }
    ctx.stroke();
  }

  // subtle grain
  const grainCount = Math.floor(canvas.width * canvas.height * 0.001);
  for (let i = 0; i < grainCount; i++) {
    let rx = Math.random() * canvas.width;
    let ry = Math.random() * canvas.height;
    let shade = Math.floor(50 + Math.random() * 20);
    ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
    ctx.fillRect(rx, ry, 1, 1);
  }
}

resize();
