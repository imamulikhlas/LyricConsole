const chalk = require("chalk");
const figlet = require("figlet");

const WIDTH = 120, HEIGHT = 35;

// Lirik Anda
const lyrics = [
  { time: 0, text: "But then out of the blue", effect: "fadeIn" },
  { time: 3, text: "a spark or two", effect: "fadeIn" },
  { time: 4, text: "Seems to generate", effect: "glow" },
  { time: 7, text: "Now I'm bothering you", effect: "chorus", isChorus: true },
  { time: 10, text: "it's bothering me", effect: "chorus", isChorus: true },
  { time: 12, text: "What can I do?", effect: "chorusQuestion" },
  { time: 14, text: "What should I do?", effect: "chorusQuestion" },
  { time: 16, text: "We're not too far", effect: "chorus", isChorus: true },
  { time: 18, text: "look where we are", effect: "glow" },
  { time: 19, text: "Bothering me", effect: "chorus", isChorus: true },
  { time: 20, text: "bothering you", effect: "chorus", isChorus: true },
  { time: 22, text: "We fill our days", effect: "fadeIn" },
  { time: 24, text: "with hypotheticals", effect: "glow" }
];

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
    this.decay = 0.01;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.05;
    this.vx *= 0.99;
    this.life -= this.decay;
    return this.life > 0;
  }
}

function clear() {
  process.stdout.write("\x1b[2J\x1b[0f");
}

function applyColor(colorName, char) {
  switch(colorName) {
    case "cyanBright": return chalk.cyanBright(char);
    case "cyan": return chalk.cyan(char);
    case "blueBright": return chalk.blueBright(char);
    case "blue": return chalk.blue(char);
    case "whiteBright": return chalk.whiteBright(char);
    case "white": return chalk.white(char);
    case "gray": return chalk.gray(char);
    case "magentaBright": return chalk.magentaBright(char);
    case "magenta": return chalk.magenta(char);
    case "yellowBright": return chalk.yellowBright(char);
    case "redBright": return chalk.redBright(char);
    default: return chalk.white(char);
  }
}

function createSparks(x, y, count = 3) {
  const chars = ["·", "•", "*"];
  const colors = ["cyanBright", "blueBright", "whiteBright"];
  
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.5 + Math.random() * 1.5;
    particles.push(new Particle(
      x, y,
      Math.cos(angle) * speed,
      Math.sin(angle) * speed - 1,
      chars[Math.floor(Math.random() * chars.length)],
      colors[Math.floor(Math.random() * colors.length)]
    ));
  }
}

function createChorusExplosion(x, y, count = 8) {
  const chars = ["★", "✦", "✧", "*", "•", "○"];
  const colors = ["magentaBright", "cyanBright", "whiteBright", "blueBright"];
  
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    const speed = 2 + Math.random() * 2;
    particles.push(new Particle(
      x, y,
      Math.cos(angle) * speed,
      Math.sin(angle) * speed - 1.5,
      chars[Math.floor(Math.random() * chars.length)],
      colors[Math.floor(Math.random() * colors.length)]
    ));
  }
}

function drawModernText(text, screen, effect, elapsed, timeSinceStart) {
  try {
    // Chorus menggunakan font yang lebih besar!
    const font = (effect === 'chorus' || effect === 'chorusQuestion') ? 'Big' : 'Standard';
    
    const art = figlet.textSync(text, { 
      font: font,
      horizontalLayout: 'fitted'
    });
    
    const lines = art.split('\n').filter(line => line.trim());
    const startY = Math.floor((HEIGHT - lines.length) / 2);
    
    // Smooth fade in animation
    const fadeProgress = Math.min(1, timeSinceStart * 1.2);
    
    lines.forEach((line, i) => {
      const y = startY + i;
      if (y < 0 || y >= HEIGHT) return;
      
      const startX = Math.floor((WIDTH - line.length) / 2);
      
      for (let j = 0; j < line.length; j++) {
        const x = startX + j;
        if (x < 0 || x >= WIDTH || line[j] === ' ') continue;
        
        let char = line[j];
        let coloredChar;
        
        switch(effect) {
          case 'chorus':
            // Rainbow pulse untuk chorus!
            const chorusPulse = Math.sin(elapsed * 4 + j * 0.15 + i * 0.3) * 0.5 + 0.5;
            const colorPhase = Math.floor((elapsed * 2 + j * 0.1) % 4);
            
            if (chorusPulse > 0.8) {
              const colors = ["magentaBright", "cyanBright", "blueBright", "whiteBright"];
              coloredChar = applyColor(colors[colorPhase], char);
            } else if (chorusPulse > 0.5) {
              const colors = ["magenta", "cyan", "blue", "white"];
              coloredChar = applyColor(colors[colorPhase], char);
            } else {
              coloredChar = chalk.cyan(char);
            }
            
            // Heavy particles untuk chorus
            if (Math.random() < 0.015) {
              createChorusExplosion(x, y, 6);
            }
            break;
            
          case 'chorusQuestion':
            // Efek berkedip untuk question
            const questionPulse = Math.sin(elapsed * 5) * 0.5 + 0.5;
            
            if (questionPulse > 0.8) {
              coloredChar = chalk.yellowBright(char);
            } else if (questionPulse > 0.5) {
              coloredChar = chalk.magentaBright(char);
            } else if (questionPulse > 0.3) {
              coloredChar = chalk.cyanBright(char);
            } else {
              coloredChar = chalk.cyan(char);
            }
            
            if (Math.random() < 0.01) {
              createChorusExplosion(x, y, 4);
            }
            break;
          
          case 'fadeIn':
            if (fadeProgress > 0.8) {
              coloredChar = chalk.whiteBright(char);
            } else if (fadeProgress > 0.5) {
              coloredChar = chalk.white(char);
            } else if (fadeProgress > 0.3) {
              coloredChar = chalk.cyan(char);
            } else {
              coloredChar = chalk.blue(char);
            }
            break;
            
          case 'glow':
            const glow = Math.sin(elapsed * 2 + j * 0.1) * 0.3 + 0.7;
            if (glow > 0.85) {
              coloredChar = chalk.cyanBright(char);
            } else if (glow > 0.6) {
              coloredChar = chalk.cyan(char);
            } else {
              coloredChar = chalk.blueBright(char);
            }
            
            // Occasional sparks
            if (Math.random() < 0.005 && glow > 0.8) {
              createSparks(x, y, 2);
            }
            break;
            
          case 'pulse':
            const pulse = Math.sin(elapsed * 3) * 0.5 + 0.5;
            if (pulse > 0.7) {
              coloredChar = chalk.magentaBright(char);
            } else if (pulse > 0.4) {
              coloredChar = chalk.magenta(char);
            } else {
              coloredChar = chalk.cyan(char);
            }
            break;
            
          default:
            coloredChar = chalk.white(char);
        }
        
        screen[y][x] = coloredChar;
      }
    });
  } catch (e) {
    // Fallback
    const y = Math.floor(HEIGHT / 2);
    const startX = Math.floor((WIDTH - text.length) / 2);
    for (let i = 0; i < text.length; i++) {
      if (startX + i >= 0 && startX + i < WIDTH) {
        screen[y][startX + i] = chalk.whiteBright(text[i]);
      }
    }
  }
}

function drawMinimalBackground(screen, elapsed) {
  // Subtle flowing lines
  const wave1Y = Math.floor(HEIGHT * 0.2 + Math.sin(elapsed * 0.5) * 3);
  const wave2Y = Math.floor(HEIGHT * 0.8 + Math.cos(elapsed * 0.7) * 3);
  
  for (let x = 0; x < WIDTH; x++) {
    const offset = Math.sin(x * 0.1 + elapsed) * 2;
    const y1 = Math.floor(wave1Y + offset);
    const y2 = Math.floor(wave2Y + offset);
    
    if (y1 >= 0 && y1 < HEIGHT) {
      const alpha = Math.sin(x * 0.05 + elapsed * 2) * 0.5 + 0.5;
      screen[y1][x] = alpha > 0.6 ? chalk.cyan("─") : chalk.blue("·");
    }
    
    if (y2 >= 0 && y2 < HEIGHT) {
      const alpha = Math.sin(x * 0.05 - elapsed * 2) * 0.5 + 0.5;
      screen[y2][x] = alpha > 0.6 ? chalk.cyan("─") : chalk.blue("·");
    }
  }
  
  // Ambient dots - lebih banyak saat chorus
  const dotCount = 15;
  for (let i = 0; i < dotCount; i++) {
    const x = Math.floor((Math.sin(elapsed * 0.3 + i) * 0.5 + 0.5) * WIDTH);
    const y = Math.floor((Math.cos(elapsed * 0.4 + i * 0.5) * 0.5 + 0.5) * HEIGHT);
    
    if (x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT) {
      const brightness = Math.sin(elapsed * 2 + i) * 0.5 + 0.5;
      screen[y][x] = brightness > 0.7 ? chalk.cyanBright("•") : 
                     brightness > 0.4 ? chalk.cyan("·") : chalk.blue("·");
    }
  }
}

function drawCleanBorder(screen, elapsed) {
  // Top & bottom minimalist border
  for (let x = 0; x < WIDTH; x++) {
    const pulse = Math.sin(elapsed * 2 + x * 0.05) * 0.5 + 0.5;
    const char = "─";
    
    if (pulse > 0.6) {
      screen[0][x] = chalk.cyanBright(char);
      screen[HEIGHT-1][x] = chalk.cyanBright(char);
    } else if (pulse > 0.3) {
      screen[0][x] = chalk.cyan(char);
      screen[HEIGHT-1][x] = chalk.cyan(char);
    } else {
      screen[0][x] = chalk.blue(char);
      screen[HEIGHT-1][x] = chalk.blue(char);
    }
  }
  
  // Corner accents
  screen[0][0] = chalk.cyanBright("╭");
  screen[0][WIDTH-1] = chalk.cyanBright("╮");
  screen[HEIGHT-1][0] = chalk.cyanBright("╰");
  screen[HEIGHT-1][WIDTH-1] = chalk.cyanBright("╯");
}

function drawProgressBar(screen, elapsed, totalTime) {
  const barWidth = 40;
  const barY = HEIGHT - 2;
  const barX = Math.floor((WIDTH - barWidth) / 2);
  
  const progress = Math.min(1, elapsed / totalTime);
  const filled = Math.floor(progress * barWidth);
  
  for (let i = 0; i < barWidth; i++) {
    const x = barX + i;
    if (x >= 0 && x < WIDTH) {
      if (i < filled) {
        screen[barY][x] = chalk.cyanBright("━");
      } else {
        screen[barY][x] = chalk.gray("─");
      }
    }
  }
  
  // Time indicator
  const timeText = `${Math.floor(elapsed)}s`;
  const timeX = barX + barWidth + 2;
  for (let i = 0; i < timeText.length; i++) {
    if (timeX + i < WIDTH) {
      screen[barY][timeX + i] = chalk.cyan(timeText[i]);
    }
  }
}

function main() {
  let start = Date.now();
  let lyricIndex = 0;
  let lyricStartTime = 0;

  setInterval(() => {
    clear();
    const elapsed = (Date.now() - start) / 1000;
    const screen = Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(" "));

    // Clean background
    drawMinimalBackground(screen, elapsed);

    // Particles
    particles = particles.filter(p => {
      if (p.update()) {
        const x = Math.floor(p.x);
        const y = Math.floor(p.y);
        if (x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT) {
          const alpha = p.life;
          const color = alpha > 0.7 ? p.colorName : alpha > 0.4 ? "cyan" : "blue";
          screen[y][x] = applyColor(color, p.char);
        }
        return true;
      }
      return false;
    });

    // Lyrics system
    if (lyricIndex < lyrics.length && elapsed >= lyrics[lyricIndex].time) {
      lyricStartTime = elapsed;
      lyricIndex++;
    }

    const currentLyric = lyrics[lyricIndex - 1];
    if (currentLyric) {
      const timeSinceStart = elapsed - lyricStartTime;
      drawModernText(currentLyric.text, screen, currentLyric.effect, elapsed, timeSinceStart);
    }

    // Clean border
    drawCleanBorder(screen, elapsed);
    
    // Progress bar
    const totalTime = lyrics.length > 0 ? lyrics[lyrics.length - 1].time + 5 : 30;
    drawProgressBar(screen, elapsed, totalTime);

    console.log(screen.map(row => row.join("")).join("\n"));
  }, 50);
}

main();