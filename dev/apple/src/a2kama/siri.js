import a2kama from "a2kama";
import { a2kGlass } from "a2kama/presets";
import { THREE } from "a2kama";

const siriGlassRecipe = a2kGlass.normal({
  lightDirection: 45,
  lightIntensity: 1.0,
  lightSymmetry: 1,
  refraction: 150,
  depth: 40,
  dispersion: 120,
  frost: 0,
  bevelWidth: 15,
  bevelCurve: 3.0,
  zoom: 1.0,
  splay: 100,
});

// --- Rive 텍스처를 글래스 쉐이더에 합치기 위한 커스텀 쉐이더 인젝션 ---
siriGlassRecipe.shader.uniforms.uRiveTexture = {
  value: null,
  type: "sampler2D",
};
siriGlassRecipe.shader.uniforms.uRiveOpacity = {
  value: 0.8,
  type: "float",
};

siriGlassRecipe.shader.colorModifier =
  siriGlassRecipe.shader.colorModifier.replace(
    "finalColor = blendSrcOver(glassyMain, shadowLayer);",
    `
  // 글래스 쉐이더에서 계산된 왜곡값(distortDir, pushDist, refStrength)을
  // 메시의 로컬 UV(vUv) 스케일에 맞게 변환하여 동일한 굴절 왜곡을 적용합니다.
  vec2 localPixelToUv = 1.0 / uSize;
  vec2 localDistortOffset = distortDir * pushDist * refStrength * localPixelToUv;
  
  // UV 기준점을 중앙(0.5)으로 맞추고 80% 사이즈(1.0 / 0.8 = 1.25)로 축소합니다.
  vec2 finalUv = (vUv + localDistortOffset - 0.5) * 1.4 + 0.5;
  
  // 세로 위치 조절 (값을 더하면 텍스처는 아래로 내려갑니다)
  finalUv.y += 0.05; // 5% 아래로 이동

  // --- Rive 애니메이션 전체 투명도 (구슬 + 그림자) ---
  float riveOpacity = uRiveOpacity; // 유니폼으로 받아 상태에 따라 동적으로 투명도 애니메이션 처리

  // 1. Rive 텍스처 뒤에 깔릴 넓고 뿌연 그림자 생성 (계단 현상 방지를 위해 49-tap(7x7)으로 촘촘하게 샘플링)
  float shadowBlurStep = 10.0; // 간격을 줄여 계단 현상(Banding) 제거
  vec2 sOff = shadowBlurStep * localPixelToUv;
  float shadowAlpha = 0.0;
  for(float x = -3.0; x <= 3.0; x += 1.0) {
      for(float y = -3.0; y <= 3.0; y += 1.0) {
          shadowAlpha += texture2D(uRiveTexture, finalUv + vec2(x, y) * sOff).a;
      }
  }
  shadowAlpha /= 49.0;

  // 2. 글래스 베이스에 그림자 먼저 합성 (까맣게 어두워짐)
  vec4 glassyWithRive = glassyMain;
  float shadowIntensity = 1.0; // 그림자의 진하기
  // 그림자 전체에 riveOpacity 적용
  glassyWithRive.rgb = mix(glassyWithRive.rgb, vec3(0.0), shadowAlpha * shadowIntensity * bgMask * riveOpacity);

  // 3. 원래 구슬 그리기 (약간의 Frosted 효과 유지)
  float blurAmount = 2.0;
  vec2 bOff = blurAmount * localPixelToUv;
  vec4 riveColor = vec4(0.0);
  for(float x = -1.0; x <= 1.0; x += 1.0) {
      for(float y = -1.0; y <= 1.0; y += 1.0) {
          riveColor += texture2D(uRiveTexture, finalUv + vec2(x, y) * bOff);
      }
  }
  riveColor /= 9.0;
  riveColor.a *= bgMask;
  
  // 4. 그림자가 깔린 글래스 위에 구슬을 Additive Blending으로 발광시키기
  // 구슬 전체에 riveOpacity 적용
  glassyWithRive.rgb += riveColor.rgb * riveColor.a * riveOpacity;
  
  // 최종적으로 그림자와 블렌딩
  finalColor = blendSrcOver(glassyWithRive, shadowLayer);
  `,
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
    window.gsap.set(siriCircle, { width: "280px", height: 0, opacity: 0 });
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
// Rive 투명도 애니메이션을 위한 프록시 객체
const siriUniforms = { riveOpacity: 0.8 };
const siriThinkCanvasDOM = document.getElementById("siri-think-canvas");

if (siriBtns.length > 0 && siriCircle) {
  siriBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // 1. Manage button active states
      siriBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // 2. Animate Siri Circle based on state
      const state = btn.innerText.toLowerCase();

      if (state === "off") {
        window.updateSiriCircleAnimation(2.0); // 1.0 보다 큰 값으로 거리를 주어 사라지게 함
      } else {
        if (!siriCircle.classList.contains("is-visible")) {
          window.updateSiriCircleAnimation(1.0); // Show it
        }

        window.gsap.killTweensOf(siriCircle);
        window.gsap.killTweensOf(siriUniforms); // 이전 투명도 애니메이션 정지

        // 상태가 'default'일 때만 Rive 텍스처를 0.8로 보이고, 나머지는 0으로 숨깁니다.
        window.gsap.to(siriUniforms, {
          riveOpacity: state === "default" ? 0.8 : 0.0,
          duration: 0.4,
          onUpdate: () => {
            if (a2kama.engine) {
              a2kama.engine.updateUniforms(siriCircle, {
                uRiveOpacity: siriUniforms.riveOpacity,
              });
            }
          },
        });

        // DOM 캔버스(Think) 투명도 조절
        if (siriThinkCanvasDOM) {
          window.gsap.to(siriThinkCanvasDOM, {
            opacity: state === "thinking" ? 1.0 : 0.0,
            duration: 0.4
          });
        }

        let targetProps = {
          duration: 0.6,
          ease: "power3.out",
          scale: 1.0, // 다른 상태로 전환될 때 scale을 다시 1로 리셋
        };

        const defaultGradient =
          "linear-gradient(rgba(0, 0, 0, 1) 40%, rgba(0, 0, 0, 0) 100%)";
        const fullGradient =
          "linear-gradient(rgba(0, 0, 0, 1) 80%, rgba(0, 0, 0, 0) 100%)";

        switch (state) {
          case "default":
            targetProps.width = 280;
            targetProps.height = 200;
            targetProps.opacity = 1;
            targetProps.borderRadius = 100;
            targetProps.backgroundImage = defaultGradient;
            targetProps.ease = "elastic.out(1, 0.65)";
            targetProps.duration = 1.0;
            // default 애니메이션 완료 후 숨쉬기(breathe) 무한 루프 시작
            targetProps.onComplete = () => {
              if (window.gsap && siriCircle) {
                window.gsap.to(siriCircle, {
                  scale: 1.05, // width/height 대신 scale로 커졌다 작아지게 처리
                  duration: 2.0,
                  ease: "sine.inOut",
                  yoyo: true, // 커졌다 작아졌다 반복
                  repeat: -1, // 무한 루프
                  transformOrigin: "center center", // 커질 때 중심축을 중앙으로 변경
                });
              }
            };
            break;
          case "thinking":
            targetProps.width = 400;
            targetProps.height = 100;
            targetProps.borderRadius = 100;
            targetProps.backgroundImage = fullGradient;
            targetProps.opacity = 1;
            break;
          case "text":
            targetProps.width = "90% ";
            targetProps.height = 200;
            targetProps.borderRadius = 40;
            targetProps.backgroundImage = fullGradient;
            targetProps.opacity = 1;
            break;
          case "contents":
            targetProps.width = "90% ";
            targetProps.height = "80%";
            targetProps.borderRadius = 40;
            targetProps.backgroundImage = fullGradient;
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
      a2kama.engine.updateUniforms(siriCircle, {
        uRiveTexture: riveTexture,
      });

      // Update the texture on every frame since Rive is animating
      const updateTexture = () => {
        if (riveTexture) riveTexture.needsUpdate = true;
        requestAnimationFrame(updateTexture);
      };
      updateTexture();
    };
    injectRiveToMirage();
  }
}

// 두 번째 캔버스(Think) Rive 초기화 (HTML 요소 그대로 유지)
const siriThinkCanvas = document.getElementById("siri-think-canvas");
if (siriThinkCanvas && window.rive) {
  // HTML 캔버스 해상도는 선명도를 위해 512x512 고정 (CSS에서 80x80으로 줄여 보여짐)
  siriThinkCanvas.width = 512;
  siriThinkCanvas.height = 512;
  new window.rive.Rive({
    src: "./src/siri_think.riv",
    canvas: siriThinkCanvas,
    autoplay: true,
    stateMachines: "State Machine 1", // 기본 상태 머신 이름
    useDevicePixelRatio: false,
    layout: new window.rive.Layout({
      fit: window.rive.Fit.Contain,
      alignment: window.rive.Alignment.Center,
    }),
  });
}

// --- 처음 로드 시에도 기본(default) 숨쉬기 애니메이션 시작 ---
if (window.gsap && siriCircle) {
  // 약간의 딜레이 후 숨쉬기 시작 (초기 렌더링 안정화)
  setTimeout(() => {
    window.gsap.to(siriCircle, {
      scale: 1.05,
      duration: 2.0,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      transformOrigin: "center center",
    });
  }, 1000);
}
