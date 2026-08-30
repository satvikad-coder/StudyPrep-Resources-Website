// all pages
function runWhenReady(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback, { once: true });
  } else {
    callback();
  }
}
function setFooterYear() {
  const footerYear = document.querySelector("#footer-year");
  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }
}
// mission
function initializeMissionPage() {
  const page = document.querySelector(".spotlight-page");
  const missionSection = document.querySelector(".mission-section");
  if (!page || !missionSection) {
    return;
  }

  const boxes = document.querySelectorAll(".fact-box");
  const cardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        entry.target.classList.add("visible");
        cardObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -8% 0px",
    }
  );
  boxes.forEach((box, index) => {
    box.style.setProperty("--card-index", index);
    cardObserver.observe(box);
  });

  let targetX = 0.82;
  let targetY = 0.05;
  let currentX = targetX;
  let currentY = targetY;
  let targetStrength = 0;
  let currentStrength = 0;

  window.addEventListener(
    "pointermove",
    (event) => {
      targetX = event.clientX / window.innerWidth;
      targetY = event.clientY / window.innerHeight;
      targetStrength = 1;
    },
    { passive: true }
  );

  document.addEventListener("pointerleave", () => {
    targetX = 0.82;
    targetY = 0.05;
    targetStrength = 0;
  });

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  function animateMissionBackground() {
    const speed = reduceMotion ? 1 : 0.055;
    currentX += (targetX - currentX) * speed;
    currentY += (targetY - currentY) * speed;
    currentStrength += (targetStrength - currentStrength) * 0.06;
    page.style.setProperty("--pointer-x", `${currentX * 100}%`);
    page.style.setProperty("--pointer-y", `${currentY * 100}%`);
    page.style.setProperty("--light-strength", currentStrength.toFixed(3));
    requestAnimationFrame(animateMissionBackground);
  }
  animateMissionBackground();
}
// main page
function initializeHomepage() {
  const canvas = document.querySelector("#bends");
  if (!canvas) {
    return;
  }
  const gl = canvas.getContext("webgl", {
    antialias: false,
    powerPreference: "high-performance",
  });
  if (!gl) {
    console.warn("Homepage WebGL background is unavailable.");
    return;
  }
  const vertexShaderSource = `
    attribute vec2 position;
    void main() {
      gl_Position = vec4(
        position,
        0.0,
        1.0
      );
    }
  `;
  const fragmentShaderSource = `
    precision highp float;
    uniform vec2 resolution;
    uniform vec2 mouse;
    uniform float time;
    float random(vec2 point) {
      return fract(
        sin(
          dot(
            point,
            vec2(127.1, 311.7)
          )
        ) * 43758.5453
      );
    }
    float beam(
      float distanceFromBeam,
      float width
    ) {
      float brightCenter = exp(
        -pow(
          abs(distanceFromBeam) / width,
          2.5
        ) * 4.0
      );
      float largeGlow = exp(
        -pow(
          abs(distanceFromBeam) /
          (width * 3.2),
          1.7
        ) * 2.7
      );
      return brightCenter +
        largeGlow * 0.48;
    }
    void main() {
      vec2 uv = (
        gl_FragCoord.xy * 2.0 -
        resolution.xy
      ) / resolution.y;
      float aspect =
        resolution.x / resolution.y;
      vec2 cursor =
        mouse * 2.0 - 1.0;
      cursor.x *= aspect;
      cursor.y *= -1.0;
      float cursorDistance = dot(
        uv - cursor,
        uv - cursor
      );
      float cursorInfluence = exp(
        -cursorDistance * 1.4
      );
      uv.y += sin(
        (uv.x - cursor.x) * 2.5
      ) * cursorInfluence * 0.07;
      uv +=
        (uv - cursor) *
        cursorInfluence *
        0.045;
      float movement =
        time * 0.11;
      float upperBeamPath =
        uv.y -
        0.64 -
        sin(
          uv.x * 0.72 +
          movement * 0.55
        ) * 0.22;
      upperBeamPath += sin(
        uv.x * 1.65 -
        movement
      ) * 0.025;
      float lowerBeamPath =
        uv.y +
        0.61 -
        sin(
          uv.x * 0.68 -
          0.65 -
          movement * 0.45
        ) * 0.30;
      lowerBeamPath += sin(
        uv.x * 1.4 +
        movement * 0.8
      ) * 0.035;
      float upperWidth = 0.205;
      float lowerWidth = 0.225;
      float upperLight = beam(
        upperBeamPath,
        upperWidth
      );
      float lowerLight = beam(
        lowerBeamPath,
        lowerWidth
      );
      float upperCore = exp(
        -pow(
          abs(upperBeamPath) /
          (upperWidth * 0.42),
          2.0
        ) * 4.0
      );
      float lowerCore = exp(
        -pow(
          abs(lowerBeamPath) /
          (lowerWidth * 0.42),
          2.0
        ) * 4.0
      );
      vec3 background = vec3(
        0.006,
        0.007,
        0.009
      );
      vec3 lightGreen = vec3(
        0.62,
        1.00,
        0.80
      );
      vec3 softMint = vec3(
        0.78,
        1.00,
        0.90
      );
      vec3 lightPink = vec3(
        1.00,
        0.55,
        0.75
      );
      vec3 palePink = vec3(
        1.00,
        0.84,
        0.91
      );
      vec3 warmWhite = vec3(
        1.00,
        0.97,
        0.96
      );
      vec3 color = background;
      color +=
        lightGreen *
        upperLight *
        0.48;
      color +=
        softMint *
        lowerLight *
        0.46;
      color +=
        warmWhite *
        upperCore *
        1.05;
      color +=
        warmWhite *
        lowerCore *
        1.02;
      float upperPink = exp(
        -pow(
          abs(
            upperBeamPath +
            upperWidth * 0.72
          ) /
          (upperWidth * 0.95),
          2.0
        ) * 3.0
      );
      float lowerPink = exp(
        -pow(
          abs(
            lowerBeamPath -
            lowerWidth * 0.68
          ) /
          (lowerWidth * 0.95),
          2.0
        ) * 3.0
      );
      color +=
        lightPink *
        upperPink *
        0.34;
      color +=
        palePink *
        lowerPink *
        0.31;
      color +=
        lightGreen *
        exp(
          -abs(upperBeamPath) * 2.3
        ) *
        0.075;
      color +=
        lightPink *
        exp(
          -abs(lowerBeamPath) * 2.2
        ) *
        0.065;
      float grain = random(
        gl_FragCoord.xy +
        fract(time) * 937.0
      ) - 0.5;
      color += grain * 0.085;
      color *=
        0.96 +
        0.04 *
        sin(gl_FragCoord.y * 1.8);
      color = pow(
        max(color, 0.0),
        vec3(0.87)
      );
      gl_FragColor = vec4(
        color,
        1.0
      );
    }
  `;

  function createShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }
  const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
  if (!vertexShader || !fragmentShader) {
    return;
  }
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    return;
  }

  gl.useProgram(program);
  const vertices = new Float32Array([
    -1, -1, 1, -1, -1, 1,

    -1, 1, 1, -1, 1, 1,
  ]);
  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  const positionLocation = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  const resolutionLocation = gl.getUniformLocation(program, "resolution");
  const mouseLocation = gl.getUniformLocation(program, "mouse");
  const timeLocation = gl.getUniformLocation(program, "time");
  let targetMouseX = 0.5;
  let targetMouseY = 0.5;
  let mouseX = 0.5;
  let mouseY = 0.5;
  function resizeCanvas() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(window.innerWidth * pixelRatio);
    canvas.height = Math.round(window.innerHeight * pixelRatio);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  window.addEventListener("resize", resizeCanvas);
  document.addEventListener("mouseleave", () => {
    targetMouseX = 0.5;
    targetMouseY = 0.5;
  });
  resizeCanvas();
  const startTime = performance.now();
  function animateBackground(currentTime) {
    mouseX += (targetMouseX - mouseX) * 0.055;
    mouseY += (targetMouseY - mouseY) * 0.055;
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    gl.uniform2f(mouseLocation, mouseX, mouseY);
    gl.uniform1f(timeLocation, (currentTime - startTime) / 1000);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(animateBackground);
  }
  requestAnimationFrame(animateBackground);
  const heading = document.querySelector(".fold-heading");
  if (heading) {
    heading.addEventListener("click", () => {
      const letters = heading.querySelectorAll("span");
      letters.forEach((letter) => {
        letter.style.animation = "none";
      });
      void heading.offsetWidth;
      letters.forEach((letter, index) => {
        letter.style.animation =
          "unfold-letter 1.15s cubic-bezier(0.16, 1, 0.3, 1) forwards";
        letter.style.animationDelay = `${0.1 + index * 0.09}s`;
      });
    });
  }
  const root = document.documentElement;
  const scene = document.querySelector(".scroll-scene");
  const chromeBackground = document.querySelector(".chrome-background");
  const contentOne = document.querySelector(".content-one");
  const contentTwo = document.querySelector(".content-two");
  if (!scene || !chromeBackground || !contentOne || !contentTwo) {
    console.warn("Homepage scroll scene markup is incomplete.");
    return;
  }
  function clamp(value, minimum = 0, maximum = 1) {
    return Math.min(Math.max(value, minimum), maximum);
  }
  function map(value, start, end) {
    return clamp((value - start) / (end - start));
  }
  function ease(value) {
    value = clamp(value);
    return value < 0.5
      ? 4 * value * value * value
      : 1 - Math.pow(-2 * value + 2, 3) / 2;
  }
  function setPanelProgress(panel, progress) {
    const visible = ease(progress);
    panel.style.opacity = visible;
    panel.style.transform = `
      translateY(-50%)
      perspective(900px)
      translateX(
        ${(-15 + visible * 15).toFixed(2)}vw
      )
      rotateY(
        ${(65 - visible * 65).toFixed(2)}deg
      )
    `;
  }
  function foldPanelAway(panel, progress) {
    const folded = ease(progress);
    panel.style.opacity = 1 - folded;
    panel.style.transform = `
      translateY(-50%)
      perspective(900px)
      translateX(
        ${(-folded * 16).toFixed(2)}vw
      )
      rotateY(
        ${(-folded * 72).toFixed(2)}deg
      )
    `;
  }
  function foldLettersAway(selector, progress) {
    const letters = [...document.querySelectorAll(`${selector} span`)];
    letters.forEach((letter, index) => {
      const reverseIndex = letters.length - 1 - index;
      const delay = reverseIndex * 0.055;
      const letterProgress = ease(map(progress, delay, delay + 0.55));
      if (progress > 0.001) {
        letter.style.animation = "none";
      }
      letter.style.opacity = 1 - letterProgress;
      letter.style.filter = `blur(${letterProgress * 10}px)`;
      letter.style.transform = `
          perspective(700px)
          rotateY(
            ${-95 * letterProgress}deg
          )
          rotateX(
            ${18 * letterProgress}deg
          )
          scaleX(
            ${1 - letterProgress * 0.94}
          )
          translateX(
            ${-0.35 * letterProgress}em
          )
        `;
    });
  }
  function updateScrollScene() {
    const bounds = scene.getBoundingClientRect();
    const scrollableDistance = Math.max(
      scene.offsetHeight - window.innerHeight,
      1
    );
    const progress = clamp(-bounds.top / scrollableDistance);
    const introExit = map(progress, 0.04, 0.25);
    foldLettersAway(".fold-heading", introExit);
    foldLettersAway(".resources-heading", map(progress, 0.07, 0.28));
    const beamExit = ease(map(progress, 0.09, 0.36));
    const chromeEnter = ease(map(progress, 0.12, 0.43));
    root.style.setProperty("--beam-opacity", 1 - beamExit);
    root.style.setProperty("--beam-scale", 1 + beamExit * 0.18);
    root.style.setProperty("--chrome-opacity", chromeEnter);
    root.style.setProperty("--chrome-blur", `${18 - chromeEnter * 14}px`);
    const visualEnter = ease(map(progress, 0.22, 0.43));
    root.style.setProperty("--visual-opacity", visualEnter);
    root.style.setProperty("--visual-x", `${(1 - visualEnter) * 42}vw`);
    root.style.setProperty("--visual-scale", 0.78 + visualEnter * 0.22);
    root.style.setProperty("--visual-rotate-y", `${-22 + visualEnter * 18}deg`);
    const imageSwap = ease(map(progress, 0.57, 0.74));
    root.style.setProperty("--laptop-image-opacity", 1 - imageSwap);
    root.style.setProperty("--replacement-image-opacity", imageSwap);
    root.style.setProperty(
      "--replacement-image-blur",
      `${(1 - imageSwap) * 12}px`
    );
    root.style.setProperty(
      "--replacement-image-scale",
      0.94 + imageSwap * 0.06
    );
    const firstEnter = map(progress, 0.28, 0.46);
    const firstExit = map(progress, 0.56, 0.69);
    if (firstExit > 0) {
      foldPanelAway(contentOne, firstExit);
    } else {
      setPanelProgress(contentOne, firstEnter);
    }
    const secondEnter = map(progress, 0.66, 0.82);
    setPanelProgress(contentTwo, secondEnter);
  }
  let chromeTargetX = 0.5;
  let chromeTargetY = 0.5;
  let chromeMouseX = 0.5;
  let chromeMouseY = 0.5;
  window.addEventListener(
    "pointermove",
    (event) => {
      const x = event.clientX / window.innerWidth;
      const y = event.clientY / window.innerHeight;
      targetMouseX = x;
      targetMouseY = y;
      chromeTargetX = x;
      chromeTargetY = y;
    },
    { passive: true }
  );
  function animateChromeBackground() {
    chromeMouseX += (chromeTargetX - chromeMouseX) * 0.045;
    chromeMouseY += (chromeTargetY - chromeMouseY) * 0.045;
    chromeBackground.style.setProperty("--mouse-x", `${chromeMouseX * 100}%`);
    chromeBackground.style.setProperty("--mouse-y", `${chromeMouseY * 100}%`);
    chromeBackground.style.backgroundPosition = `
      center,
      ${50 + (chromeMouseX - 0.5) * 7}%
      ${50 + (chromeMouseY - 0.5) * 7}%,
      ${50 - (chromeMouseX - 0.5) * 5}%
      ${50 - (chromeMouseY - 0.5) * 5}%,
      ${50 + (chromeMouseX - 0.5) * 10}%
      ${50 + (chromeMouseY - 0.5) * 10}%
    `;
    requestAnimationFrame(animateChromeBackground);
  }
  window.addEventListener("scroll", updateScrollScene, { passive: true });
  window.addEventListener("resize", updateScrollScene);
  updateScrollScene();
  animateChromeBackground();
}
function initializeCornerTextLoops() {
  const topText = document.querySelector("#top-loop-text");
  const bottomText = document.querySelector("#bottom-loop-text");
  if (!topText || !bottomText) {
    return;
  }
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  if (reduceMotion) {
    topText.setAttribute("startOffset", "0%");
    bottomText.setAttribute("startOffset", "-50%");
    return;
  }
  let topOffset = 0;
  let bottomOffset = -50;
  let previousTime = performance.now();
  function animateLoops(currentTime) {
    const elapsed = Math.min((currentTime - previousTime) / 1000, 0.05);
    previousTime = currentTime;
    topOffset -= elapsed * 6;
    bottomOffset += elapsed * 5;
    if (topOffset <= -50) {
      topOffset += 50;
    }
    if (bottomOffset >= 0) {
      bottomOffset -= 50;
    }
    topText.setAttribute("startOffset", `${topOffset}%`);
    bottomText.setAttribute("startOffset", `${bottomOffset}%`);
    requestAnimationFrame(animateLoops);
  }
  requestAnimationFrame(animateLoops);
}
// resources page
function initializeResourcesPage() {
  const page = document.querySelector(".resources-page");
  if (!page) {
    return;
  }
  let targetX = 0.7;
  let targetY = 0.2;
  let currentX = targetX;
  let currentY = targetY;
  let targetStrength = 0;
  let currentStrength = 0;
  window.addEventListener(
    "pointermove",
    (event) => {
      targetX = event.clientX / window.innerWidth;
      targetY = event.clientY / window.innerHeight;
      targetStrength = 1;
    },
    { passive: true }
  );
  document.addEventListener("pointerleave", () => {
    targetX = 0.7;
    targetY = 0.2;
    targetStrength = 0;
  });
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  function animateResourceBackground() {
    const speed = reduceMotion ? 1 : 0.05;
    currentX += (targetX - currentX) * speed;
    currentY += (targetY - currentY) * speed;
    currentStrength += (targetStrength - currentStrength) * 0.06;
    page.style.setProperty("--pointer-x", `${currentX * 100}%`);
    page.style.setProperty("--pointer-y", `${currentY * 100}%`);
    page.style.setProperty("--pointer-strength", currentStrength.toFixed(3));
    requestAnimationFrame(animateResourceBackground);
  }
  animateResourceBackground();
}
// about us page
function initializeTeamPage() {
  const canvas = document.querySelector("#team-silk");
  const teamPage = document.querySelector(".team-page");
  if (!canvas || !teamPage) {
    return;
  }
  const gl = canvas.getContext("webgl", {
    antialias: false,
    alpha: false,
    powerPreference: "high-performance",
  });
  if (!gl) {
    console.warn("Team-page WebGL background is unavailable.");
    return;
  }
  const vertexSource = `
    attribute vec2 position;
    void main() {
      gl_Position = vec4(
        position,
        0.0,
        1.0
      );
    }
  `;
  const fragmentSource = `
    precision highp float;
    uniform vec2 resolution;
    uniform vec2 mouse;
    uniform float hover;
    uniform float time;
    float hash(vec2 point) {
      return fract(
        sin(
          dot(
            point,
            vec2(127.1, 311.7)
          )
        ) * 43758.5453
      );
    }
    float noise(vec2 point) {
      vec2 cell = floor(point);
      vec2 local = fract(point);
      local =
        local *
        local *
        (3.0 - 2.0 * local);
      float bottomLeft =
        hash(cell);
      float bottomRight =
        hash(
          cell +
          vec2(1.0, 0.0)
        );
      float topLeft =
        hash(
          cell +
          vec2(0.0, 1.0)
        );
      float topRight =
        hash(
          cell +
          vec2(1.0, 1.0)
        );
      return mix(
        mix(
          bottomLeft,
          bottomRight,
          local.x
        ),
        mix(
          topLeft,
          topRight,
          local.x
        ),
        local.y
      );
    }
    float fbm(vec2 point) {
      float value = 0.0;
      float amplitude = 0.5;
      for (int i = 0; i < 4; i++) {
        value +=
          amplitude *
          noise(point);
        point = mat2(
           0.8, 0.6,
          -0.6, 0.8
        ) * point * 2.03;
        amplitude *= 0.5;
      }
      return value;
    }
    void main() {
      vec2 uv = (
        gl_FragCoord.xy * 2.0 -
        resolution.xy
      ) / resolution.y;
      float aspect =
        resolution.x /
        resolution.y;
      vec2 pointer =
        mouse * 2.0 - 1.0;
      pointer.x *= aspect;
      pointer.y *= -1.0;
      vec2 difference =
        uv - pointer;
      float influence = exp(
        -dot(
          difference,
          difference
        ) * 1.8
      ) * hover;
      /*
        Cursor bends the silk.
      */
      uv.y += sin(
        difference.x * 4.0
      ) * influence * 0.16;
      uv.x += sin(
        difference.y * 3.2
      ) * influence * 0.07;
      float drift =
        time * 0.065;
      float warp = fbm(
        uv * 1.1 +
        vec2(
          drift,
          -drift * 0.7
        )
      );
      float folds = sin(
        uv.x * 4.4 -
        uv.y * 2.4 +
        warp * 7.5 +
        drift
      );
      float fineFolds = sin(
        uv.x * 8.2 -
        uv.y * 4.3 +
        warp * 5.0
      );
      float light = smoothstep(
        -0.35,
        0.95,
        folds
      );
      float detail = pow(
        smoothstep(
          0.2,
          1.0,
          fineFolds
        ),
        2.2
      );
      vec3 black = vec3(
        0.006,
        0.006,
        0.012
      );
     vec3 graphite = vec3(
        0.055,
        0.062,
        0.065
      );
      vec3 green = vec3(
        0.58,
        1.0,
        0.75
      );
      vec3 pink = vec3(
        1.0,
        0.67,
        0.79
      );
      vec3 white = vec3(
        0.95,
        1.0,
        0.97
      );
      vec3 color = mix(
        black,
        graphite,
        light * 0.66
      );
      color +=
        green *
        light *
        0.25;
      color +=
        white *
        detail *
        0.19;
      color +=
        pink *
        detail *
        0.055;
      color +=
        green *
        influence *
        0.055;
      float vignette =
        1.0 -
        smoothstep(
          0.45,
          1.8,
          length(
            uv *
            vec2(0.65, 0.82)
          )
        );
      color *=
        0.72 +
        vignette * 0.28;
      float grain =
        hash(
          gl_FragCoord.xy +
          fract(time) * 800.0
        ) - 0.5;
      color += grain * 0.017;
      gl_FragColor = vec4(
        color,
        1.0
      );
    }
  `;
  function createShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }
  const vertexShader = createShader(gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentSource);
  if (!vertexShader || !fragmentShader) {
    return;
  }
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    return;
  }
  gl.useProgram(program);
  const vertices = new Float32Array([
    -1, -1, 1, -1, -1, 1,

    -1, 1, 1, -1, 1, 1,
  ]);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const uniforms = {
    resolution: gl.getUniformLocation(program, "resolution"),
    mouse: gl.getUniformLocation(program, "mouse"),
    hover: gl.getUniformLocation(program, "hover"),
    time: gl.getUniformLocation(program, "time"),
  };

  let targetX = 0.72;
  let targetY = 0.2;

  let currentX = targetX;
  let currentY = targetY;

  let targetHover = 0;
  let currentHover = 0;

  function resizeTeamCanvas() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);

    canvas.width = Math.round(window.innerWidth * pixelRatio);

    canvas.height = Math.round(window.innerHeight * pixelRatio);

    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  window.addEventListener("resize", resizeTeamCanvas);
  window.addEventListener(
    "pointermove",
    (event) => {
      targetX = event.clientX / window.innerWidth;
      targetY = event.clientY / window.innerHeight;
      targetHover = 1;
    },
    { passive: true }
  );
  document.addEventListener("pointerleave", () => {
    targetX = 0.72;
    targetY = 0.2;
    targetHover = 0;
  });

  resizeTeamCanvas();
  const startTime = performance.now();
  function renderTeamSilk(currentTime) {
    currentX += (targetX - currentX) * 0.05;
    currentY += (targetY - currentY) * 0.05;
    currentHover += (targetHover - currentHover) * 0.055;
    gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
    gl.uniform2f(uniforms.mouse, currentX, currentY);
    gl.uniform1f(uniforms.hover, currentHover);
    gl.uniform1f(uniforms.time, (currentTime - startTime) / 1000);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(renderTeamSilk);
  }
  requestAnimationFrame(renderTeamSilk);
  const members = document.querySelectorAll(".team-member");
  if ("IntersectionObserver" in window) {
    teamPage.classList.add("team-animation-ready");
    const memberObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }
          entry.target.classList.add("visible");
          memberObserver.unobserve(entry.target);
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -5% 0px",
      }
    );
    members.forEach((member) => {
      memberObserver.observe(member);
    });
  } else {
    members.forEach((member) => {
      member.classList.add("visible");
    });
  }
}
runWhenReady(() => {
  setFooterYear();
  initializeMissionPage();
  initializeHomepage();
  initializeCornerTextLoops();
  initializeResourcesPage();
  initializeTeamPage();
});
