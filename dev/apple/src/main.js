const Lenis = window.Lenis;
const gsap = window.gsap;
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector("#root");
  const scrollViewport = document.querySelector(".showcase");
  const scrollContent = document.querySelector(".showcase-content");
  const lockScreen = document.querySelector(".lock-screen");
  const lockTime = document.querySelector("[data-lock-time]");
  const unlockButton = document.querySelector("[data-unlock]");
  const dock = document.querySelector("[data-dock]");
  const dockHighlight = document.querySelector("[data-dock-highlight]");
  const dockButtons = Array.from(
    document.querySelectorAll("[data-page-target]"),
  );
  const rangeControls = Array.from(document.querySelectorAll("[data-range]"));
  const glassScene = document.querySelector("[data-glass-scene]");
  const opacityOutput = document.querySelector("[data-opacity-output]");
  if (!root || !scrollViewport || !scrollContent || !lockScreen) return;
  const lenis = new Lenis({
    wrapper: scrollViewport,
    content: scrollContent,
    eventsTarget: window,
    autoRaf: true,
    smoothWheel: true,
    syncTouch: true,
    wheelMultiplier: 0.82,
    touchMultiplier: 1.02,
    anchors: { duration: 0.9 },
  });
  const getViewportHeight = () =>
    scrollViewport.clientHeight || root.clientHeight || window.innerHeight;
  const setViewportHeight = () =>
    document.documentElement.style.setProperty(
      "--app-vh",
      `${getViewportHeight()}px`,
    );
  setViewportHeight();
  const getPagePoints = () => {
    const contentTop = scrollContent.getBoundingClientRect().top;
    return [
      { id: "lock", top: 0 },
      { id: "siri", top: getViewportHeight() },
      ...Array.from(document.querySelectorAll("[data-page]")).map(
        (element) => ({
          id: element.dataset.page ?? "",
          top: element.getBoundingClientRect().top - contentTop,
        }),
      ),
    ];
  };
  const nearestPageIndex = (scroll, points) => {
    let nearest = 0;
    let distance = Number.POSITIVE_INFINITY;
    points.forEach((point, index) => {
      const nextDistance = Math.abs(point.top - scroll);
      if (nextDistance < distance) {
        distance = nextDistance;
        nearest = index;
      }
    });
    return nearest;
  };
  let points = getPagePoints();
  let settledPageIndex = nearestPageIndex(scrollViewport.scrollTop, points);
  let previousScroll = scrollViewport.scrollTop;
  let transitionMode = settledPageIndex === 0 ? "forward" : "reverse";
  let snapTimer;
  let isSnapping = false;
  let activeDockId = "";
  let isDockDragging = false;
  let dockSelectionLocked = false;
  let dockPointerId = null;
  let dragStartClientX = 0;
  let dragOriginX = 0;
  let dragX = 0;
  let dragWidth = 0;
  let dragHeight = 0;
  let dragBaseScaleY = 1;
  let dragVelocityX = 0;
  let dragLastX = 0;
  let dragLastTime = 0;
  let dragDirection = 1;
  let physicsLeft = 0;
  let physicsRight = 0;
  let physicsLeftVelocity = 0;
  let physicsRightVelocity = 0;
  let dragMoved = false;
  let suppressDockClick = false;
  let dragTargetButton = null;
  const updateLockTime = () => {
    if (!lockTime) return;
    const now = new Date();
    const displayTime = new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(now);
    const machineTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    lockTime.textContent = displayTime;
    lockTime.dateTime = machineTime;
  };
  updateLockTime();
  const lockTimeTimer = window.setInterval(updateLockTime, 30000);
  const getDockButtonAt = (highlightX, width = dragWidth) => {
    const center = highlightX + width / 2;
    return dockButtons.reduce((nearest, button) => {
      if (!nearest) return button;
      const buttonCenter = button.offsetLeft + button.offsetWidth / 2;
      const nearestCenter = nearest.offsetLeft + nearest.offsetWidth / 2;
      return Math.abs(buttonCenter - center) < Math.abs(nearestCenter - center)
        ? button
        : nearest;
    }, null);
  };
  const previewDockButton = (button) => {
    if (dragTargetButton === button) return;
    dragTargetButton = button;
    dockButtons.forEach((item) =>
      item.classList.toggle("is-drag-target", item === button),
    );
  };
  const stepSpring = (
    value,
    velocity,
    target,
    stiffness,
    damping,
    deltaSeconds,
  ) => {
    const acceleration = (target - value) * stiffness;
    const nextVelocity =
      (velocity + acceleration * deltaSeconds) *
      Math.exp(-damping * deltaSeconds);
    return [value + nextVelocity * deltaSeconds, nextVelocity];
  };
  const updateDockPhysics = (_time, deltaTime) => {
    if (!isDockDragging || !dockHighlight) return;
    const deltaSeconds = Math.min(deltaTime / 1000, 1 / 30);
    const idleFor = performance.now() - dragLastTime;
    if (idleFor > 24) {
      dragVelocityX *= Math.exp(-14 * deltaSeconds);
      if (Math.abs(dragVelocityX) < 0.005) dragVelocityX = 0;
    }
    const isMoving = idleFor < 48 && Math.abs(dragVelocityX) > 0.01;
    const targetLeft = dragX;
    const targetRight = dragX + dragWidth;
    const leadingStiffness = 680;
    const leadingDamping = 42;
    const trailingStiffness = 150;
    const trailingDamping = 20;
    const restingStiffness = 390;
    const restingDamping = 32;
    const leftIsLeading = isMoving && dragDirection < 0;
    const rightIsLeading = isMoving && dragDirection > 0;
    const leftStiffness = isMoving
      ? leftIsLeading
        ? leadingStiffness
        : trailingStiffness
      : restingStiffness;
    const rightStiffness = isMoving
      ? rightIsLeading
        ? leadingStiffness
        : trailingStiffness
      : restingStiffness;
    const leftDamping = isMoving
      ? leftIsLeading
        ? leadingDamping
        : trailingDamping
      : restingDamping;
    const rightDamping = isMoving
      ? rightIsLeading
        ? leadingDamping
        : trailingDamping
      : restingDamping;
    [physicsLeft, physicsLeftVelocity] = stepSpring(
      physicsLeft,
      physicsLeftVelocity,
      targetLeft,
      leftStiffness,
      leftDamping,
      deltaSeconds,
    );
    [physicsRight, physicsRightVelocity] = stepSpring(
      physicsRight,
      physicsRightVelocity,
      targetRight,
      rightStiffness,
      rightDamping,
      deltaSeconds,
    );
    const minWidth = dragWidth * 0.92;
    const maxWidth = dragWidth * 1.72;
    let renderedWidth = physicsRight - physicsLeft;
    if (renderedWidth > maxWidth) {
      renderedWidth = maxWidth;
      if (dragDirection > 0) physicsLeft = physicsRight - renderedWidth;
      else physicsRight = physicsLeft + renderedWidth;
    } else if (renderedWidth < minWidth) {
      renderedWidth = minWidth;
      if (dragDirection > 0) physicsLeft = physicsRight - renderedWidth;
      else physicsRight = physicsLeft + renderedWidth;
    }
    // Treat the highlight like an incompressible piece of jelly: its grabbed
    // area stays constant, so width and height always move inversely.
    const areaPreservingScaleY =
      (dragWidth * dragBaseScaleY) / Math.max(renderedWidth, 1);
    gsap.set(dockHighlight, {
      x: physicsLeft,
      y: 0,
      width: renderedWidth,
      scaleX: dragBaseScaleY,
      scaleY: areaPreservingScaleY,
      backgroundColor: "rgba(0, 0, 0, 0)",
      rotation: 0,
      transformOrigin: "center center",
    });
    if (window.a2kama) {
      const options = window.a2kama.getOptions(dockHighlight);
      if (options) {
        gsap.to(options, { depth: 120, lightDirection: 45, lightIntensity: 0.6, duration: 0.1 });
      }
    }
  };
  const moveDockHighlight = (button, animate = true) => {
    if (!dock || !dockHighlight) return;
    const targetX = button.offsetLeft;
    const targetWidth = button.offsetWidth;
    const currentX = Number(gsap.getProperty(dockHighlight, "x")) || targetX;
    const direction = targetX >= currentX ? 1 : -1;
    const currentWidth =
      Number(gsap.getProperty(dockHighlight, "width")) ||
      dockHighlight.offsetWidth;
    const currentScaleY =
      Number(gsap.getProperty(dockHighlight, "scaleY")) || 1;
    const currentScaleX =
      Number(gsap.getProperty(dockHighlight, "scaleX")) || 1;
    const isAlreadyStretched =
      Math.abs(currentScaleX - 1) > 0.04 || Math.abs(currentScaleY - 1) > 0.04;
    gsap.killTweensOf(dockHighlight);
    if (!animate) {
      gsap.set(dockHighlight, {
        x: targetX,
        y: 0,
        width: targetWidth,
        border: "none",
        scaleX: 1,
        scaleY: 1,
        backgroundColor: "rgba(0, 0, 0, 0.1)",
        transformOrigin: "center center",
      });
      if (window.a2kama) {
        const options = window.a2kama.getOptions(dockHighlight);
        if (options) gsap.set(options, { depth: 0, lightDirection: 0, lightIntensity: 0 });
      }
      return;
    }

    if (isAlreadyStretched) {
      gsap.to(dockHighlight, {
        x: targetX,
        y: 0,
        width: targetWidth,
        scaleX: 1,
        scaleY: 1,
        backgroundColor: "rgba(0, 0, 0, 0.1)",
        border: "none",
        rotation: 0,
        transformOrigin: "center center",
        duration: 0.3,
        ease: "power3.out",
      });
      if (window.a2kama) {
        const options = window.a2kama.getOptions(dockHighlight);
        if (options) gsap.to(options, { depth: 0, lightDirection: 0, lightIntensity: 0, duration: 0.3, ease: "power3.out" });
      }
      return;
    }
    const edgeLag = clamp(
      Math.abs(targetX - currentX) * 0.34,
      10,
      targetWidth * 0.65,
    );
    const stretchedX = direction > 0 ? targetX - edgeLag : targetX;
    const stretchedWidth = targetWidth + edgeLag;
    const targetScale = ((dock.offsetHeight + 2) / Math.max(dockHighlight.offsetHeight, 1)) * 1.1;
    const timeline = gsap.timeline();
    timeline
      .to(dockHighlight, {
        scaleX: targetScale,
        scaleY: targetScale,
        backgroundColor: "rgba(0, 0, 0, 0)",
        duration: 0.12,
        ease: "power2.out",
        onStart: () => {
          if (window.a2kama) {
            const options = window.a2kama.getOptions(dockHighlight);
            if (options) gsap.to(options, { depth: 120, lightDirection: 45, lightIntensity: 0.6, duration: 0.12, ease: "power2.out" });
          }
        }
      })
      .to(dockHighlight, {
        x: stretchedX,
        width: stretchedWidth,
        scaleX: targetScale,
        scaleY: (targetWidth / stretchedWidth) * targetScale,
        y: 0,
        transformOrigin: "center center",
        duration: 0.28,
        ease: "power3.inOut",
      })
      .to(dockHighlight, {
        x: targetX,
        width: targetWidth,
        scaleX: 1,
        scaleY: 1,
        backgroundColor: "rgba(0, 0, 0, 0.1)",
        duration: 0.25,
        ease: "power3.out",
        onStart: () => {
          if (window.a2kama) {
            const options = window.a2kama.getOptions(dockHighlight);
            if (options) gsap.to(options, { depth: 0, lightDirection: 0, lightIntensity: 0, duration: 0.25, ease: "power3.out" });
          }
        }
      });
  };
  const activateDockButton = (pageId, animate = true, forceMove = false) => {
    const displayId = pageId === "lock" ? "siri" : pageId;
    dockButtons.forEach((button) => {
      const isActive = button.dataset.pageTarget === displayId;
      button.classList.toggle("is-active", isActive);
      button.classList.remove("is-drag-target");
      if (isActive) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
    if (displayId === activeDockId && !forceMove) return;
    const activeButton = dockButtons.find(
      (button) => button.dataset.pageTarget === displayId,
    );
    if (activeButton) {
      moveDockHighlight(
        activeButton,
        animate && (activeDockId !== "" || forceMove),
      );
    }
    activeDockId = displayId;
  };
  const setRangeValue = (control, nextValue) => {
    const min = Number(control.dataset.min ?? 0);
    const max = Number(control.dataset.max ?? 100);
    const value = clamp(nextValue, min, max);
    const progress = (value - min) / Math.max(max - min, 1);
    const roundedValue = Math.round(value);
    control.dataset.value = String(value);
    control.style.setProperty("--range-progress", `${progress * 100}%`);
    control.setAttribute("aria-valuenow", String(roundedValue));
    if (control.dataset.range === "glass-opacity") {
      glassScene?.style.setProperty("--glass-alpha", (value / 100).toFixed(3));
      if (opacityOutput) opacityOutput.textContent = `${roundedValue}%`;
    }
  };
  const rangeHandlers = rangeControls.map((control) => {
    const isLiquidSlider = control.dataset.range === "glass-opacity";
    const thumb = control.querySelector(".slider-thumb");
    let restingThumbWidth = 0;
    let restingThumbHeight = 0;
    let lastPointerX = 0;
    let lastPointerTime = 0;
    const setFromPointer = (event) => {
      const rect = control.getBoundingClientRect();
      const min = Number(control.dataset.min ?? 0);
      const max = Number(control.dataset.max ?? 100);
      const progress = clamp(
        (event.clientX - rect.left) / Math.max(rect.width, 1),
      );
      setRangeValue(control, min + (max - min) * progress);
    };
    const animateLiquidThumb = (event) => {
      if (!isLiquidSlider || !thumb) return;
      const now = performance.now();
      const elapsed = Math.max(now - lastPointerTime, 8);
      const velocity = Math.abs(event.clientX - lastPointerX) / elapsed;
      const stretch = clamp(velocity / 1.25);
      const heldWidth = restingThumbWidth + 8;
      const heldHeight = restingThumbHeight + 3;
      lastPointerX = event.clientX;
      lastPointerTime = now;
      gsap.killTweensOf(thumb);
      gsap
        .timeline()
        .to(thumb, {
          width: heldWidth + stretch * 20,
          height: heldHeight - stretch * 6,
          duration: 0.1,
          ease: "power2.out",
        })
        .to(
          thumb,
          {
            width: heldWidth,
            height: heldHeight,
            duration: 0.28,
            ease: "elastic.out(1, 0.65)",
          },
          ">+0.04",
        );
    };
    const pointerDown = (event) => {
      event.preventDefault();
      control.setPointerCapture(event.pointerId);
      if (isLiquidSlider && thumb) {
        const thumbStyle = getComputedStyle(thumb);
        restingThumbWidth = Number.parseFloat(thumbStyle.width);
        restingThumbHeight = Number.parseFloat(thumbStyle.height);
        lastPointerX = event.clientX;
        lastPointerTime = performance.now();
        control.classList.add("is-dragging");
        gsap.killTweensOf(thumb);
        gsap.to(thumb, {
          width: restingThumbWidth + 8,
          height: restingThumbHeight + 3,
          duration: 0.22,
          ease: "back.out(2)",
        });
      }
      setFromPointer(event);
    };
    const pointerMove = (event) => {
      if (!control.hasPointerCapture(event.pointerId)) return;
      setFromPointer(event);
      animateLiquidThumb(event);
    };
    const pointerUp = (event) => {
      if (control.hasPointerCapture(event.pointerId)) {
        control.releasePointerCapture(event.pointerId);
      }
      if (isLiquidSlider && thumb) {
        control.classList.remove("is-dragging");
        gsap.killTweensOf(thumb);
        gsap.to(thumb, {
          width: restingThumbWidth,
          height: restingThumbHeight,
          duration: 0.34,
          ease: "elastic.out(1, 0.6)",
        });
      }
    };
    const keyDown = (event) => {
      const min = Number(control.dataset.min ?? 0);
      const max = Number(control.dataset.max ?? 100);
      const step = Number(control.dataset.step ?? 1);
      const current = Number(control.dataset.value ?? min);
      let nextValue = current;
      if (event.key === "ArrowLeft" || event.key === "ArrowDown")
        nextValue -= step;
      else if (event.key === "ArrowRight" || event.key === "ArrowUp")
        nextValue += step;
      else if (event.key === "Home") nextValue = min;
      else if (event.key === "End") nextValue = max;
      else return;
      event.preventDefault();
      setRangeValue(control, nextValue);
    };
    control.addEventListener("pointerdown", pointerDown);
    control.addEventListener("pointermove", pointerMove);
    control.addEventListener("pointerup", pointerUp);
    control.addEventListener("pointercancel", pointerUp);
    control.addEventListener("keydown", keyDown);
    setRangeValue(
      control,
      Number(control.dataset.value ?? control.dataset.min ?? 0),
    );
    return { control, thumb, pointerDown, pointerMove, pointerUp, keyDown };
  });
  const updateDock = (scroll) => {
    if (!dock) return;
    const viewportHeight = getViewportHeight();
    const progress = clamp(scroll / Math.max(viewportHeight, 1));
    // Only show dock when fully scrolled past the lock screen (2nd page)
    const opacity = progress > 0.995 ? 1 : 0;
    dock.style.setProperty("--dock-opacity", opacity.toFixed(4));
    dock.classList.toggle("is-visible", opacity > 0.5);

    // Toggle mirage engine rendering dynamically
    dock.setAttribute(
      "data-mirage-select",
      opacity > 0.5 ? "include-tree" : "",
    );
    if (!isDockDragging && !dockSelectionLocked) {
      const activePoint = points[nearestPageIndex(scroll, points)];
      activateDockButton(activePoint?.id ?? "siri");
    }
  };
  const updateLockScreen = (scroll) => {
    const viewportHeight = getViewportHeight();
    const progress = clamp(scroll / Math.max(viewportHeight, 1));
    const forwardBackground = 1 - clamp((progress - 0.84) / 0.08);
    const reverseBackground = 1 - clamp(progress / 0.12);
    const forwardGlass =
      clamp((progress - 0.82) / 0.08) * (1 - clamp((progress - 0.97) / 0.03));
    const reverseGlass =
      clamp((progress - 0.06) / 0.08) * (1 - clamp((progress - 0.95) / 0.05));
    const backgroundOpacity =
      transitionMode === "forward" ? forwardBackground : reverseBackground;

    // front.png fades out at the very end (between 0.95 and 1.0)
    // and reappears as soon as the user scrolls back up (progress < 1.0)
    const frontOpacity = 1 - clamp((progress - 0.95) / 0.05);

    const glassOpacity =
      transitionMode === "forward" ? forwardGlass : reverseGlass;
    const lockInterface = document.querySelector(".lock-interface");
    const lockBackground = document.querySelector(".lock-background");
    const wallpaper = document.querySelector(".wallpaper");
    const wallpaperBack = document.querySelector(".wallpaper-back");
    const wallpaperFront = document.querySelector(".wallpaper-front");
    lockScreen.style.setProperty("--unlock", progress.toFixed(4));
    lockScreen.style.setProperty(
      "--system-opacity",
      (1 - clamp((progress - 0.88) / 0.1)).toFixed(4),
    );

    if (window.gsap && lockInterface && lockBackground) {
      gsap.set(lockInterface, { y: -(progress * viewportHeight * 1.02) });
      gsap.set(lockBackground, { opacity: backgroundOpacity });

      // Keep wallpaper wrapper opacity at 1 so children can have independent opacities
      if (wallpaper) gsap.set(wallpaper, { opacity: 1 });

      // Only fade out the back image early, and fade out the front image at the very end
      if (wallpaperBack)
        gsap.set(wallpaperBack, { opacity: backgroundOpacity });
      if (wallpaperFront) gsap.set(wallpaperFront, { opacity: frontOpacity });
    } else {
      lockScreen.style.setProperty(
        "--unlock-translate",
        `${-(progress * viewportHeight * 1.02)}px`,
      );
      lockScreen.style.setProperty(
        "--lock-background-opacity",
        backgroundOpacity.toFixed(4),
      );
    }
    const isPast = progress > 0.995;
    lockScreen.classList.toggle("is-past", isPast);
    lockScreen.setAttribute("aria-hidden", String(isPast));
    updateDock(scroll);
  };
  const goToPage = (targetIndex, duration = 0.82, onSettled) => {
    points = getPagePoints();
    const boundedIndex = clamp(targetIndex, 0, points.length - 1);
    const target = points[boundedIndex];
    if (!target) return;
    if (settledPageIndex === 0 && boundedIndex > 0) transitionMode = "forward";
    if (settledPageIndex === 1 && boundedIndex === 0)
      transitionMode = "reverse";
    window.clearTimeout(snapTimer);
    isSnapping = true;
    lenis.scrollTo(target.top, {
      duration,
      lock: true,
      userData: { initiator: "page-snap" },
      easing: (t) => 1 - Math.pow(1 - t, 4),
      onComplete: () => {
        isSnapping = false;
        settledPageIndex = boundedIndex;
        previousScroll = target.top;
        updateLockScreen(target.top);
        onSettled?.();
      },
    });
  };
  const settleToNearestPage = () => {
    if (isSnapping) return;
    points = getPagePoints();
    const origin = points[settledPageIndex];
    if (!origin) return;
    const scroll = lenis.scroll;
    let targetIndex = settledPageIndex;
    if (scroll > origin.top + 1 && settledPageIndex < points.length - 1) {
      const next = points[settledPageIndex + 1];
      const progress = (scroll - origin.top) / (next.top - origin.top);
      if (progress >= 0.5) targetIndex = settledPageIndex + 1;
    } else if (scroll < origin.top - 1 && settledPageIndex > 0) {
      const previous = points[settledPageIndex - 1];
      const progress = (origin.top - scroll) / (origin.top - previous.top);
      if (progress >= 0.5) targetIndex = settledPageIndex - 1;
    } else {
      return;
    }
    goToPage(targetIndex);
  };
  const handleScroll = (instance) => {
    const { scroll } = instance;
    if (!isSnapping) {
      if (settledPageIndex === 0 && scroll > previousScroll) {
        transitionMode = "forward";
      } else if (
        settledPageIndex === 1 &&
        scroll < previousScroll &&
        scroll < getViewportHeight()
      ) {
        transitionMode = "reverse";
      }
      window.clearTimeout(snapTimer);
      if (Math.abs(scroll - (points[settledPageIndex]?.top ?? scroll)) > 1) {
        snapTimer = window.setTimeout(settleToNearestPage, 130);
      }
    }
    updateLockScreen(scroll);
    previousScroll = scroll;
  };
  const handleResize = () => {
    setViewportHeight();
    lenis.resize();
    points = getPagePoints();
    settledPageIndex = nearestPageIndex(scrollViewport.scrollTop, points);
    updateLockScreen(scrollViewport.scrollTop);
    const activeButton = dockButtons.find((button) =>
      button.classList.contains("is-active"),
    );
    if (activeButton) moveDockHighlight(activeButton, false);
  };
  const handleUnlock = () => {
    transitionMode = "forward";
    goToPage(1, 1.05);
  };
  const navigateFromDock = (button, duration = 0.88, forceMove = true) => {
    const pageId = button.dataset.pageTarget;
    if (!pageId) return;
    points = getPagePoints();
    const targetIndex = points.findIndex((point) => point.id === pageId);
    if (targetIndex < 0) return;
    dockSelectionLocked = true;
    activateDockButton(pageId, true, forceMove);
    goToPage(targetIndex, duration, () => {
      dockSelectionLocked = false;
      activateDockButton(pageId, false, true);
    });
  };
  const handleDockPointerDown = (event) => {
    if (
      !dock ||
      !dockHighlight ||
      isSnapping ||
      dockPointerId !== null ||
      (event.pointerType === "mouse" && event.button !== 0)
    ) {
      return;
    }
    const highlightRect = dockHighlight.getBoundingClientRect();
    const hitPadding = 8;
    const startedOnHighlight =
      event.clientX >= highlightRect.left - hitPadding &&
      event.clientX <= highlightRect.right + hitPadding &&
      event.clientY >= highlightRect.top - hitPadding &&
      event.clientY <= highlightRect.bottom + hitPadding;
    if (!startedOnHighlight) return;
    event.preventDefault();
    dockPointerId = event.pointerId;
    dragStartClientX = event.clientX;
    dragOriginX = Number(gsap.getProperty(dockHighlight, "x")) || 0;
    dragX = dragOriginX;
    dragWidth = dockHighlight.offsetWidth;
    dragHeight = dockHighlight.offsetHeight;
    dragBaseScaleY = ((dock.offsetHeight + 2) / Math.max(dragHeight, 1)) * 1.1;
    dragVelocityX = 0;
    dragLastX = dragX;
    dragLastTime = performance.now();
    dragDirection = 1;
    physicsLeft = dragX;
    physicsRight = dragX + dragWidth;
    physicsLeftVelocity = 0;
    physicsRightVelocity = 0;
    dragMoved = false;
    isDockDragging = true;
    // console.log("--- Dock Highlight Selected ---");
    

    // const dockBtns = document.querySelectorAll(".dock-buttons-group button span");
    // const highlightStyle = { color: "blue" };
    // for(const dockBtn of dockBtns){
    //   dockBtn.dataset.mirageTravel = `native 3 ${JSON.stringify(highlightStyle)}`;
    // }
    
    
    gsap.killTweensOf(dockHighlight);
    gsap.ticker.remove(updateDockPhysics);
    gsap.ticker.add(updateDockPhysics);
    dock.classList.add("is-dragging");
    dock.setPointerCapture(event.pointerId);
    lenis.stop();
    previewDockButton(getDockButtonAt(dragX, dragWidth));
    gsap.set(dockHighlight, {
      x: dragX,
      width: dragWidth,
      scaleX: dragBaseScaleY,
      scaleY: dragBaseScaleY,
      y: 0,
      transformOrigin: "center center",
    });
  };
  const handleDockPointerMove = (event) => {
    if (
      !dock ||
      !dockHighlight ||
      dockPointerId === null ||
      event.pointerId !== dockPointerId
    ) {
      return;
    }
    event.preventDefault();
    const firstButton = dockButtons[0];
    const lastButton = dockButtons[dockButtons.length - 1];
    if (!firstButton || !lastButton) return;
    const deltaX = event.clientX - dragStartClientX;
    const minX = firstButton.offsetLeft;
    const maxX = lastButton.offsetLeft + lastButton.offsetWidth - dragWidth;
    const nextX = clamp(dragOriginX + deltaX, minX, maxX);
    const now = performance.now();
    const elapsed = Math.max(now - dragLastTime, 8);
    const instantVelocity = (nextX - dragLastX) / elapsed;
    dragVelocityX = dragVelocityX * 0.35 + instantVelocity * 0.65;
    if (Math.abs(instantVelocity) > 0.001) {
      dragDirection = Math.sign(instantVelocity);
    }
    dragX = nextX;
    dragLastX = nextX;
    dragLastTime = now;
    dragMoved ||= Math.abs(deltaX) > 5;
    previewDockButton(getDockButtonAt(nextX, dragWidth));
  };
  const finishDockDrag = (event, cancelled = false) => {
    if (
      !dock ||
      !dockHighlight ||
      dockPointerId === null ||
      event.pointerId !== dockPointerId
    ) {
      return;
    }
    event.preventDefault();
    const pointerId = dockPointerId;
    dockPointerId = null;
    isDockDragging = false;
    // console.log("--- Dock Highlight Released ---");
    gsap.ticker.remove(updateDockPhysics);
    dock.classList.remove("is-dragging");
    if (dock.hasPointerCapture(pointerId))
      dock.releasePointerCapture(pointerId);
    lenis.start();
    const firstButton = dockButtons[0];
    const lastButton = dockButtons[dockButtons.length - 1];
    const activeButton = dockButtons.find((button) =>
      button.classList.contains("is-active"),
    );
    let targetButton = activeButton ?? firstButton ?? null;
    if (!cancelled && firstButton && lastButton) {
      targetButton = getDockButtonAt(dragX, dragWidth);
    }
    previewDockButton(null);
    if (!targetButton) return;
    suppressDockClick = dragMoved;
    if (suppressDockClick) {
      window.setTimeout(() => {
        suppressDockClick = false;
      }, 280);
    }
    if (cancelled) {
      const pageId = targetButton.dataset.pageTarget ?? "siri";
      activateDockButton(pageId, true, true);
    } else {
      navigateFromDock(targetButton, 0.82, true);
    }
  };
  const handleDockPointerUp = (event) => finishDockDrag(event, false);
  const handleDockPointerCancel = (event) => finishDockDrag(event, true);
  const dockHandlers = dockButtons.map((button) => {
    const handler = () => {
      if (suppressDockClick) return;
      navigateFromDock(button, 0.88, false);
    };
    button.addEventListener("click", handler);
    return { button, handler };
  });
  lenis.on("scroll", handleScroll);
  unlockButton?.addEventListener("click", handleUnlock);
  window.addEventListener("resize", handleResize);
  dock?.addEventListener("pointerdown", handleDockPointerDown, true);
  dock?.addEventListener("pointermove", handleDockPointerMove);
  dock?.addEventListener("pointerup", handleDockPointerUp);
  dock?.addEventListener("pointercancel", handleDockPointerCancel);
  updateLockScreen(scrollViewport.scrollTop);
  return () => {
    window.clearTimeout(snapTimer);
    window.clearInterval(lockTimeTimer);
    window.removeEventListener("resize", handleResize);
    unlockButton?.removeEventListener("click", handleUnlock);
    dock?.removeEventListener("pointerdown", handleDockPointerDown, true);
    dock?.removeEventListener("pointermove", handleDockPointerMove);
    dock?.removeEventListener("pointerup", handleDockPointerUp);
    dock?.removeEventListener("pointercancel", handleDockPointerCancel);
    gsap.ticker.remove(updateDockPhysics);
    dockHandlers.forEach(({ button, handler }) =>
      button.removeEventListener("click", handler),
    );
    rangeHandlers.forEach(
      ({ control, thumb, pointerDown, pointerMove, pointerUp, keyDown }) => {
        control.removeEventListener("pointerdown", pointerDown);
        control.removeEventListener("pointermove", pointerMove);
        control.removeEventListener("pointerup", pointerUp);
        control.removeEventListener("pointercancel", pointerUp);
        control.removeEventListener("keydown", keyDown);
        if (thumb) gsap.killTweensOf(thumb);
      },
    );
    gsap.killTweensOf([dockHighlight, ...dockButtons].filter(Boolean));
    lenis.off("scroll", handleScroll);
    lenis.destroy();
  };
});
