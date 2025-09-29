const chalk = require("chalk");
const figlet = require("figlet");

const WIDTH = 120, HEIGHT = 35;

// Lirik dengan timestamp dan efek
const lyrics = [
  { time: 0, text: "TEMANKU SEMUA", effect: "explosion" },
  { time: 2, text: "PADA JAHAT", effect: "explosion" },
  { time: 3, text: "TANTE....", effect: "fire" },
  { time: 5, text: "AKU LAGI SUSAH", effect: "wave" },
  { time: 6, text: "MEREKA GAK ADA", effect: "wave" },
  { time: 8, text: "COBA KALAU", effect: "wave" },
  { time: 9, text: "LAGI JAYA", effect: "wave" },
  { time: 11, text: "AKU DIPUJA PUJA", effect: "matrix" },
  { time: 12, text: "TANTEE.....", effect: "fire" }
];

// Multiple 3D objects
const cubeVertices = [
  [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
  [-1, -1,  1], [1, -1,  1], [1, 1,  1], [-1, 1,  1]
];

const pyramidVertices = [
  [0, 1, 0], [-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1]
];

const cubeEdges = [
  [0,1],[1,2],[2,3],[3,0],
  [4,5],[5,6],[6,7],[7,4],
  [0,4],[1,5],[2,6],[3,7]
];

const pyramidEdges = [
  [0,1],[0,2],[0,3],[0,4],
  [1,2],[2,3],[3,4],[4,1]
];

// Particle system
let particles = [];

class Particle {
  constructor(x, y, vx, vy, char, colorName) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.char = char;
    this.colorName = colorName;
    this.life = 1.0;
    this.decay = 0.02;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.1; // gravity
    this.vx *= 0.98; // friction
    this.life -= this.decay;
    return this.life > 0;
  }
}

function clear() {
  process.stdout.write("\x1b[2J");
  process.stdout.write("\x1b[0f");
}

function rotatePoint(x, y, z, ax, ay, az) {
  let cosa = Math.cos(ax), sina = Math.sin(ax);
  let y1 = y * cosa - z * sina;
  let z1 = y * sina + z * cosa;
  y = y1; z = z1;

  let cosb = Math.cos(ay), sinb = Math.sin(ay);
  let x1 = x * cosb + z * sinb;
  z1 = -x * sinb + z * cosb;
  x = x1; z = z1;

  let cosc = Math.cos(az), sinc = Math.sin(az);
  x1 = x * cosc - y * sinc;
  y1 = x * sinc + y * cosc;
  return [x1, y1, z];
}

function project(x, y, z, fov, dist) {
  const factor = fov / (dist + z);
  const xp = Math.floor(WIDTH / 2 + x * factor);
  const yp = Math.floor(HEIGHT / 2 - y * factor);
  return [xp, yp, factor];
}

function createFireworks(x, y) {
  const chars = ["*", ".", "+", "o", "O", "@"];
  const colors = ["redBright", "yellowBright", "whiteBright"];
  
  for (let i = 0; i < 15; i++) {
    const angle = (Math.PI * 2 * i) / 15;
    const speed = 2 + Math.random() * 3;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed - Math.random() * 2;
    const char = chars[Math.floor(Math.random() * chars.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    particles.push(new Particle(x, y, vx, vy, char, color));
  }
}

function applyColor(colorName, char) {
  switch(colorName) {
    case "redBright": return chalk.redBright(char);
    case "yellowBright": return chalk.yellowBright(char);
    case "whiteBright": return chalk.whiteBright(char);
    case "greenBright": return chalk.greenBright(char);
    case "blueBright": return chalk.blueBright(char);
    case "cyanBright": return chalk.cyanBright(char);
    case "magentaBright": return chalk.magentaBright(char);
    case "red": return chalk.red(char);
    case "yellow": return chalk.yellow(char);
    case "green": return chalk.green(char);
    case "blue": return chalk.blue(char);
    case "cyan": return chalk.cyan(char);
    case "magenta": return chalk.magenta(char);
    case "white": return chalk.white(char);
    case "gray": return chalk.gray(char);
    case "grey": return chalk.grey(char);
    case "black": return chalk.black(char);
    default: return chalk.white(char);
  }
}

function drawBigText(text, screen, y, effect, elapsed) {
  try {
    figlet.textSync(text, { font: 'Small' }).split('\n').forEach((line, i) => {
      if (y + i >= 0 && y + i < HEIGHT) {
        const startX = Math.floor((WIDTH - line.length) / 2);
        
        for (let j = 0; j < line.length; j++) {
          if (startX + j >= 0 && startX + j < WIDTH && line[j] !== ' ') {
            let char = line[j];
            let coloredChar;
            
            switch(effect) {
              case 'explosion':
                const expIndex = Math.floor(elapsed * 10) % 3;
                if (Math.random() < 0.3) char = ['*', '#', '@'][Math.floor(Math.random() * 3)];
                switch(expIndex) {
                  case 0: coloredChar = chalk.redBright(char); break;
                  case 1: coloredChar = chalk.yellowBright(char); break;
                  case 2: coloredChar = chalk.red(char); break;
                  default: coloredChar = chalk.redBright(char);
                }
                break;
              case 'wave':
                const wave = Math.sin(elapsed * 3 + j * 0.1) * 0.5 + 0.5;
                if (wave > 0.7) {
                  coloredChar = chalk.cyanBright(char);
                } else if (wave > 0.3) {
                  coloredChar = chalk.blueBright(char);
                } else {
                  coloredChar = chalk.blue(char);
                }
                break;
              case 'matrix':
                if (Math.random() < 0.05) char = String.fromCharCode(33 + Math.floor(Math.random() * 94));
                coloredChar = Math.random() < 0.1 ? chalk.whiteBright(char) : chalk.greenBright(char);
                break;
              case 'fire':
                const fireIndex = Math.floor(Math.random() * 4);
                switch(fireIndex) {
                  case 0: coloredChar = chalk.redBright(char); break;
                  case 1: coloredChar = chalk.yellowBright(char); break;
                  case 2: coloredChar = chalk.red(char); break;
                  case 3: coloredChar = chalk.yellow(char); break;
                  default: coloredChar = chalk.redBright(char);
                }
                break;
              case 'fade':
                const fade = Math.sin(elapsed * 2) * 0.5 + 0.5;
                coloredChar = fade > 0.5 ? chalk.whiteBright(char) : chalk.gray(char);
                break;
              default:
                coloredChar = chalk.whiteBright(char);
            }
            
            screen[y + i][startX + j] = coloredChar;
          }
        }
      }
    });
  } catch (e) {
    const startX = Math.floor((WIDTH - text.length) / 2);
    for (let i = 0; i < text.length; i++) {
      if (startX + i >= 0 && startX + i < WIDTH && y >= 0 && y < HEIGHT) {
        screen[y][startX + i] = chalk.whiteBright(text[i]);
      }
    }
  }
}

function drawTunnel(screen, elapsed) {
  const centerX = WIDTH / 2;
  const centerY = HEIGHT / 2;
  
  for (let r = 1; r < 15; r++) {
    const radius = r + Math.sin(elapsed * 2) * 2;
    const numPoints = Math.floor(radius * 6);
    
    for (let i = 0; i < numPoints; i++) {
      const angle = (Math.PI * 2 * i) / numPoints + elapsed;
      const x = Math.floor(centerX + Math.cos(angle) * radius);
      const y = Math.floor(centerY + Math.sin(angle) * radius * 0.5);
      
      if (x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT) {
        const chars = [".", ":", "|", "#"];
        const char = chars[r % chars.length];
        const colorIndex = Math.floor(elapsed + r) % 4;
        
        let coloredChar;
        switch(colorIndex) {
          case 0: coloredChar = chalk.magenta(char); break;
          case 1: coloredChar = chalk.cyan(char); break;
          case 2: coloredChar = chalk.blue(char); break;
          case 3: coloredChar = chalk.magentaBright(char); break;
          default: coloredChar = chalk.white(char);
        }
        
        screen[y][x] = coloredChar;
      }
    }
  }
}

function drawLightning(screen, elapsed) {
  if (Math.random() < 0.1) { // 10% chance setiap frame
    const x = Math.floor(Math.random() * WIDTH);
    let y = 0;
    
    while (y < HEIGHT - 1) {
      if (x >= 0 && x < WIDTH) {
        screen[y][x] = chalk.whiteBright("|");
      }
      
      // Lightning zigzag
      const nextX = x + (Math.random() - 0.5) * 4;
      y += 1 + Math.floor(Math.random() * 2);
      
      if (nextX >= 0 && nextX < WIDTH && y < HEIGHT) {
        screen[y][Math.floor(nextX)] = chalk.cyanBright("/");
      }
    }
  }
}

function randomSymbol() {
  const symbols = ["#", "*", "+", "@", "%", "▓", "▒", "░", "█"];
  return symbols[Math.floor(Math.random() * symbols.length)];
}

function main() {
  let start = Date.now();
  let angleX = 0, angleY = 0, angleZ = 0;
  let lyricIndex = 0;
  let colorNames = [
    "cyanBright", "magentaBright", "greenBright", 
    "yellowBright", "blueBright", "redBright", "whiteBright"
  ];

  setInterval(() => {
    clear();
    let elapsed = (Date.now() - start) / 1000;
    let screen = Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(" "));

    // --- Background Effects ---
    drawTunnel(screen, elapsed);
    drawLightning(screen, elapsed);
    
    // Random glitch background
    for (let i = 0; i < WIDTH / 3; i++) {
      let x = Math.floor(Math.random() * WIDTH);
      let y = Math.floor(Math.random() * HEIGHT);
      screen[y][x] = chalk.gray(randomSymbol());
    }

    // --- Render Multiple 3D Objects ---
    const objects = [
      { vertices: cubeVertices, edges: cubeEdges, offset: [-30, 0, 0], scale: 1.5 },
      { vertices: pyramidVertices, edges: pyramidEdges, offset: [30, 0, 0], scale: 1.2 }
    ];

    objects.forEach((obj, objIndex) => {
      const points = obj.vertices.map(v => {
        const [x, y, z] = rotatePoint(
          v[0] * obj.scale, v[1] * obj.scale, v[2] * obj.scale, 
          angleX * (objIndex + 1), angleY * (objIndex + 1), angleZ
        );
        return project(x + obj.offset[0], y + obj.offset[1], z + obj.offset[2], 50, 4);
      });

      for (let [a, b] of obj.edges) {
        const [x1, y1, z1] = points[a];
        const [x2, y2, z2] = points[b];
        const steps = Math.floor(Math.abs(x2 - x1) + Math.abs(y2 - y1)) || 1;
        
        for (let t = 0; t < steps; t++) {
          const xt = Math.floor(x1 + (x2 - x1) * t / steps);
          const yt = Math.floor(y1 + (y2 - y1) * t / steps);
          
          if (xt >= 0 && xt < WIDTH && yt >= 0 && yt < HEIGHT) {
            const colorName = colorNames[(a + b + t + Math.floor(elapsed * 10)) % colorNames.length];
            const intensity = (z1 + z2) / 2;
            const char = intensity > 0.5 ? "█" : intensity > 0 ? "▓" : "░";
            screen[yt][xt] = applyColor(colorName, char);
          }
        }
      }
    });

    // --- Update Particles ---
    particles = particles.filter(p => {
      if (p.update()) {
        const x = Math.floor(p.x);
        const y = Math.floor(p.y);
        if (x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT) {
          screen[y][x] = applyColor(p.colorName, p.char);
        }
        return true;
      }
      return false;
    });

    // --- Render Lyrics with Big Fonts ---
    if (lyricIndex < lyrics.length && elapsed >= lyrics[lyricIndex].time) {
      lyricIndex++;
    }

    const currentLyric = lyrics[lyricIndex - 1];
    if (currentLyric) {
      // Create fireworks effect for explosion
      if (currentLyric.effect === 'explosion' && Math.random() < 0.1) {
        createFireworks(
          Math.floor(Math.random() * WIDTH), 
          Math.floor(Math.random() * HEIGHT / 2)
        );
      }
      
      drawBigText(currentLyric.text, screen, Math.floor(HEIGHT * 0.7), currentLyric.effect, elapsed);
    }

    // --- Border Effect ---
    for (let x = 0; x < WIDTH; x++) {
      const char = Math.sin(elapsed * 3 + x * 0.1) > 0 ? "▄" : "▀";
      const colorName = colorNames[Math.floor(elapsed * 5 + x) % colorNames.length];
      screen[0][x] = applyColor(colorName, char);
      screen[HEIGHT-1][x] = applyColor(colorName, char);
    }

    console.log(screen.map(row => row.join("")).join("\n"));

    angleX += 0.08 + Math.sin(elapsed) * 0.02;
    angleY += 0.05 + Math.cos(elapsed * 1.3) * 0.03;
    angleZ += 0.03 + Math.sin(elapsed * 0.7) * 0.02;
  }, 50);
}


main();