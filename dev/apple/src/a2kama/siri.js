import a2kama from "a2kama";
import { a2kGlass } from "a2kama/presets";
import { THREE } from "a2kama";

const siriGlassRecipe = a2kGlass.normal({
  lightDirection: 45,
  lightIntensity: 1.0,
  lightSymmetry: 1,
  refraction: 120,
  depth: 40,
  dispersion: 120,
  frost: 0,
  bevelWidth: 10,
  bevelCurve: 3.0,
  zoom: 1.0,
  splay: 50,
});

// --- Rive 텍스처를 글래스 쉐이더에 합치기 위한 커스텀 쉐이더 인젝션 ---
siriGlassRecipe.shader.uniforms.uRiveTexture = { value: null, type: "sampler2D" };

siriGlassRecipe.shader.colorModifier = siriGlassRecipe.shader.colorModifier.replace(
  "finalColor = blendSrcOver(glassyMain, shadowLayer);",
  `
  // 글래스 쉐이더에서 계산된 왜곡값(distortDir, pushDist, refStrength)을
  // 메시의 로컬 UV(vUv) 스케일에 맞게 변환하여 동일한 굴절 왜곡을 적용합니다.
  vec2 localPixelToUv = 1.0 / uSize;
  vec2 localDistortOffset = distortDir * pushDist * refStrength * localPixelToUv;
  
  // 왜곡이 적용된 UV로 Rive 캔버스 샘플링
  vec4 riveColor = texture2D(uRiveTexture, vUv + localDistortOffset);
  
  // 글래스 표면 위에 Rive 컬러를 블렌딩
  vec4 glassyWithRive = blendSrcOver(riveColor, glassyMain);
  
  // 최종적으로 그림자와 블렌딩
  finalColor = blendSrcOver(glassyWithRive, shadowLayer);
  `
);

a2kama.register("siriGlass", siriGlassRecipe);

const siriCircle = document.querySelector(".siri-circle");

siriCircle.dataset.mirageTravel = `traveler 4`;
siriCircle.dataset.a2kama = "siriGlass";
siriCircle.dataset.mirageSelect = "include-self";

window.updateSiriCircleAnimation = function (progress) {
  if (!siriCircle || !window.gsap) return;
  const siriDist = Math.abs(progress - 1.0);
  const shouldBeVisible = siriDist < 0.2; // Show within 20% distance

  if (shouldBeVisible && !siriCircle.classList.contains("is-visible")) {
    siriCircle.classList.add("is-visible");
    window.gsap.killTweensOf(siriCircle);
    // Set initial hidden state then animate in with delay
    window.gsap.set(siriCircle, { width: "300px", height: 0, opacity: 0 });
    window.gsap.to(siriCircle, {
      height: 200,
      opacity: 1,
      duration: 1.0,
      delay: 0.35, // 살짝 기다렸다가
      ease: "elastic.out(1, 0.65)", // 좀 더 다이나믹하게
    });
  } else if (!shouldBeVisible && siriCircle.classList.contains("is-visible")) {
    siriCircle.classList.remove("is-visible");
    window.gsap.killTweensOf(siriCircle);
    // Animate out quickly
    window.gsap.to(siriCircle, {
      height: 0,
      opacity: 0,
      duration: 0.35,
      ease: "power2.in",
    });
  }
};

// --- Add interaction logic for Siri buttons ---
const siriBtns = document.querySelectorAll(".siri-btn");
if (siriBtns.length > 0 && siriCircle) {
  siriBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // 1. Update active class
      siriBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // 2. Animate Siri Circle based on button text
      const state = btn.textContent.trim().toLowerCase();

      if (window.gsap) {
        window.gsap.killTweensOf(siriCircle);

        let targetProps = {
          duration: 0.6,
          ease: "power3.out",
        };

        const fullGradient =
          "linear-gradient(rgba(0, 0, 0, 1) 80%, rgba(0, 0, 0, 0) 100%)";

        switch (state) {
          case "default":
            targetProps.width = 300;
            targetProps.height = 200;
            targetProps.opacity = 1;
            targetProps.borderRadius = 100;
            targetProps.ease = "elastic.out(1, 0.65)";
            targetProps.duration = 1.0;
            break;
          case "thinking":
            targetProps.width = 400;
            targetProps.height = 100;
            targetProps.borderRadius = 100;
            // targetProps.background = fullGradient;
            targetProps.opacity = 1;
            break;
          case "text":
            targetProps.width = "90% ";
            targetProps.height = 200;
            targetProps.borderRadius = 40;
            targetProps.opacity = 1;
            break;
          case "contents":
            targetProps.width = "90% ";
            targetProps.height = "80%";
            targetProps.borderRadius = 40;
            targetProps.opacity = 1;
            targetProps.duration = 0.8;
            break;
          case "off":
            targetProps.height = 0;
            targetProps.opacity = 0;
            targetProps.duration = 0.35;
            targetProps.ease = "power2.in";
            break;
        }

        window.gsap.to(siriCircle, targetProps);
      }
    });
  });
}

// --- Initialize Rive Animation on top of Siri ---
const siriCanvas = document.getElementById("siri-canvas");
let siriRiveInstance = null;

if (siriCanvas && window.rive) {
  // WebGL 텍스처 업로드 시 사이즈 변경으로 인한 크래시를 막기 위해 해상도 고정
  siriCanvas.width = 512;
  siriCanvas.height = 512;

  siriRiveInstance = new window.rive.Rive({
    src: "./src/siri.riv",
    canvas: siriCanvas,
    autoplay: true,
    stateMachines: "State Machine 1",
    useDevicePixelRatio: false, // 고정 해상도 사용을 위해 false
    layout: new window.rive.Layout({
      fit: window.rive.Fit.Contain,
      alignment: window.rive.Alignment.Center,
    }),
    onLoad: () => {
      // 고정 해상도를 유지하기 위해 resizeDrawingSurfaceToCanvas 호출을 제거합니다.
      // 이렇게 하면 Rive는 항상 우리가 설정한 512x512 버퍼에만 렌더링하며 WebGL 크래시가 발생하지 않습니다.
    },
  });

  if (siriCircle) {
    // --- Inject Rive Canvas directly into Mirage Engine as a WebGL Texture ---
    const injectRiveToMirage = () => {
      // Wait until Mirage Engine is fully initialized in main.js
      if (!a2kama.engine) {
        requestAnimationFrame(injectRiveToMirage);
        return;
      }

      // Create a Three.js CanvasTexture from the Rive canvas
      const riveTexture = new THREE.CanvasTexture(siriCanvas);
      riveTexture.colorSpace = THREE.SRGBColorSpace;
      riveTexture.minFilter = THREE.LinearFilter;
      riveTexture.magFilter = THREE.LinearFilter;
      riveTexture.flipY = false; // Y축 방향이 WebGL과 일치하도록 플립 방지

      // Inject the texture uniform directly into the glass mesh!
      a2kama.engine.updateUniforms(siriCircle, { uRiveTexture: riveTexture });

      // Update the texture on every frame since Rive is animating
      const updateTexture = () => {
        if (riveTexture) {
          riveTexture.needsUpdate = true;
        }
        requestAnimationFrame(updateTexture);
      };
      updateTexture();
    };
    injectRiveToMirage();
  }
}
