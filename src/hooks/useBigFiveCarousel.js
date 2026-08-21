import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';

export const BIG_FIVE_DATA = [
  {
    id: 'lion',
    name: 'The Lion',
    latin: 'Panthera leo',
    tagline: 'Apex Monarch of the Mara',
    habitat: 'Maasai Mara National Reserve',
    description: 'Reigning across the vast golden grasslands of the Maasai Mara, the African lion embodies the apex social predator. United in formidable family prides, their synchronized hunting strategies and thunderous dusk roars reverberate across the savannah, cementing their eternal status as the undisputed sovereign of Kenya’s wildlife kingdom.',
    image: `${import.meta.env.BASE_URL}images/lion.jpg`,
    stat: '15–20 Member Prides • 50km/h Burst Speed',
    ecosystem: 'Maasai Mara Serengeti Corridor',
    accentColor: '#f59e0b',
  },
  {
    id: 'leopard',
    name: 'The Leopard',
    latin: 'Panthera pardus',
    tagline: 'Silent Master of the Shadows',
    habitat: 'Samburu & Tsavo Riverine Woodlands',
    description: 'Solitary, elusive, and blessed with peerless muscular stealth, the African leopard rules the riverine acacia canopies of Samburu and Tsavo. Masters of nocturnal ambush, these enigmatic felines possess the extraordinary strength to haul heavy prey high into thorny branches, safely out of reach of rival savannah scavengers.',
    image: `${import.meta.env.BASE_URL}images/leopard.jpg`,
    stat: 'Nocturnal Solitary Hunter • 3x Bodyweight Hoist',
    ecosystem: 'Samburu Ewaso Nyiro River Basin',
    accentColor: '#fbbf24',
  },
  {
    id: 'elephant',
    name: 'The African Elephant',
    latin: 'Loxodonta africana',
    tagline: 'Ancient Giants of Amboseli',
    habitat: 'Amboseli National Park & Tsavo Red Earth',
    description: 'Traversing ancient ancestral corridors beneath the snow-capped majesty of Mount Kilimanjaro, African elephants serve as vital ecological architects of Kenya. Guided by wise matriarchs, their profound memory and communal wisdom carve life-giving waterholes and clear dense brush, sustaining countless species across the dry savannah.',
    image: `${import.meta.env.BASE_URL}images/elephant.jpg`,
    stat: '6-Tonne Keystone Giant • 70-Year Lifespan',
    ecosystem: 'Amboseli Basin & Tsavo Plains',
    accentColor: '#10b981',
  },
  {
    id: 'buffalo',
    name: 'The Cape Buffalo',
    latin: 'Syncerus caffer',
    tagline: 'Unyielding Armor of the Mara',
    habitat: 'Aberdare Highlands & Lake Nakuru',
    description: 'Uncompromising, fiercely loyal, and armored with fused horn bosses known as helmets, the Cape buffalo traverses Kenya’s misty highlands and open plains in thundering herds. Renowned for their collective defensive phalanx that repels even the hungriest prides of lions, they remain one of the most respected and unpredictable forces in African lore.',
    image: `${import.meta.env.BASE_URL}images/buffalo.jpg`,
    stat: '1,000+ Strong Defensive Herds • Impenetrable Boss',
    ecosystem: 'Aberdare Mist Ridges & Great Rift Valley',
    accentColor: '#d97706',
  },
  {
    id: 'rhino',
    name: 'The Black Rhino',
    latin: 'Diceros bicornis',
    tagline: 'Prehistoric Guardian of Laikipia',
    habitat: 'Ol Pejeta Conservancy & Lewa Wildlife Sanctuary',
    description: 'A living relic of the prehistoric epoch, the critically endangered black rhino navigates the dense thorny acacia scrub of Laikipia with solitary resilience. Armed with a hooked prehensile lip adapted for browsing rough vegetation and formidable twin horns, their survival stands as the crowning achievement of Kenya’s world-class conservation rangers.',
    image: `${import.meta.env.BASE_URL}images/rhino.jpg`,
    stat: 'Prehensile Browser • 24/7 Dedicated Ranger Protection',
    ecosystem: 'Laikipia Plateau & Lewa Wildlife Corridor',
    accentColor: '#06b6d4',
  },
];

export const HOLD_DURATION_MS = 1200;

export function useBigFiveCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [scrubPreviewIndex, setScrubPreviewIndex] = useState(null);
  const [isScrubbing, setIsScrubbing] = useState(false);

  // References for GSAP timeline elements
  const containerRef = useRef(null);
  const textGroupRef = useRef(null);
  const fullBleedBgRef = useRef(null);

  // 3-Card Carousel References (Prev, Center/Active, Next)
  const morphStageRef = useRef(null);
  const cardLeftRef = useRef(null);
  const cardCenterRef = useRef(null);
  const cardRightRef = useRef(null);

  // Tracking refs
  const holdStartRef = useRef(null);
  const holdAnimRef = useRef(null);
  const timelineRef = useRef(null);
  const touchStartXRef = useRef(null);
  const touchStartYRef = useRef(null);
  const scrubTrackRef = useRef(null);
  const pendingTextEntranceRef = useRef(false);

  // Preload and pre-decode all 5 animal images into memory
  useEffect(() => {
    BIG_FIVE_DATA.forEach((animal) => {
      const img = new Image();
      img.src = animal.image;
      if (img.decode) {
        img.decode().catch(() => {});
      }
    });
  }, []);

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handleChange = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Synchronized text reveal: triggered strictly after React state re-renders with new slide
  useLayoutEffect(() => {
    if (!pendingTextEntranceRef.current) return;
    pendingTextEntranceRef.current = false;

    const textGroup = textGroupRef.current;
    if (!textGroup) {
      setIsTransitioning(false);
      return;
    }

    const kineticItems = textGroup.querySelectorAll('.kinetic-item');
    if (kineticItems.length === 0) {
      setIsTransitioning(false);
      return;
    }

    // Set initial position behind overflow masks
    gsap.set(kineticItems, { yPercent: 115, opacity: 0 });

    // Smooth cascading entrance
    gsap.to(kineticItems, {
      yPercent: 0,
      opacity: 1,
      stagger: 0.08,
      duration: 0.75,
      ease: 'power3.out',
      onComplete: () => {
        setIsTransitioning(false);
      },
    });
  }, [currentIndex]);

  /**
   * Deterministic 4-Stage Cinematic Transition:
   *
   * Step 1: Shrink & Old Text Exit
   *   - Active text drops smoothly behind masks (yPercent: 115, opacity: 0).
   *   - Center Card (Current Animal) contracts from full viewport (100vw x 100vh) into card dimensions (320px x 460px, borderRadius: 24px).
   *   - Left Card & Right Card fade into place beside it on the flanks.
   *
   * Step 2: 3-Card Track Horizontal Slide
   *   - 3-card track shifts horizontally, sliding Target Card into center (x: 0).
   *   - Settle pause gives the viewer a moment to register the centered target card.
   *
   * Step 3: Target Card FLIP Expansion
   *   - Center Target Card (holding target animal image) expands outward to full bleed (100vw x 100vh, borderRadius: 0px).
   *   - Flanking cards fade out.
   *
   * Step 4: Atomic State Hand-Off & Masked Text Reveal
   *   - Background image synchronously set to nextIdx image.
   *   - Morph stage hidden & cards reset.
   *   - React currentIndex updated to nextIdx.
   *   - New slide typography cascades upward from behind masks.
   */
  const goToSlide = useCallback((targetIndex) => {
    if (isTransitioning || targetIndex === currentIndex) return;

    const total = BIG_FIVE_DATA.length;
    const nextIdx = ((targetIndex % total) + total) % total;

    // Calculate wrap direction
    let direction = 1;
    if (currentIndex === 0 && nextIdx === total - 1) {
      direction = -1;
    } else if (currentIndex === total - 1 && nextIdx === 0) {
      direction = 1;
    } else {
      direction = nextIdx > currentIndex ? 1 : -1;
    }

    setIsTransitioning(true);
    setIsScrubbing(false);
    setScrubPreviewIndex(null);

    // =========================================================================
    // FULL 4-STAGE GSAP 3-CARD CAROUSEL TIMELINE (CINEMATIC SMOOTH TIMING)
    // =========================================================================
    if (timelineRef.current) timelineRef.current.kill();

    const stage = morphStageRef.current;
    const cLeft = cardLeftRef.current;
    const cCenter = cardCenterRef.current;
    const cRight = cardRightRef.current;
    const textGroup = textGroupRef.current;
    const fullBg = fullBleedBgRef.current;
    const fullImg = fullBg ? fullBg.querySelector('img') : null;
    const kineticItems = textGroup ? textGroup.querySelectorAll('.kinetic-item') : [];

    if (!stage || !cLeft || !cCenter || !cRight) {
      pendingTextEntranceRef.current = true;
      setCurrentIndex(nextIdx);
      return;
    }

    // Responsive dimensions
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cardWidth = Math.min(360, Math.max(260, vw * 0.28));
    const cardHeight = Math.min(520, Math.max(380, vh * 0.52));
    const cardGap = 24;
    const step = cardWidth + cardGap;

    // Set precise image sources on all cards BEFORE showing stage
    const prevIdx = (currentIndex - 1 + total) % total;
    const forwardNextIdx = (currentIndex + 1) % total;

    const imgL = cLeft.querySelector('img');
    const imgC = cCenter.querySelector('img');
    const imgR = cRight.querySelector('img');

    if (direction > 0) {
      // Forward: Left is previous, Center is active, Right is target (nextIdx)
      if (imgL) imgL.src = BIG_FIVE_DATA[prevIdx].image;
      if (imgC) imgC.src = BIG_FIVE_DATA[currentIndex].image;
      if (imgR) imgR.src = BIG_FIVE_DATA[nextIdx].image;
    } else {
      // Backward: Left is target (nextIdx), Center is active, Right is forward next
      if (imgL) imgL.src = BIG_FIVE_DATA[nextIdx].image;
      if (imgC) imgC.src = BIG_FIVE_DATA[currentIndex].image;
      if (imgR) imgR.src = BIG_FIVE_DATA[forwardNextIdx].image;
    }

    // Target card that slides to center and expands
    const targetCardEl = direction > 0 ? cRight : cLeft;
    const oppositeCardEl = direction > 0 ? cLeft : cRight;

    // Initial Layout Setup
    gsap.set(cCenter, {
      width: vw,
      height: vh,
      maxWidth: 'none',
      maxHeight: 'none',
      borderRadius: '0px',
      borderWidth: '0px',
      borderColor: 'transparent',
      boxShadow: 'none',
      outline: 'none',
      x: 0,
      y: 0,
      scale: 1.0,
      opacity: 1.0,
      zIndex: 30,
    });

    gsap.set(cLeft, {
      width: cardWidth,
      height: cardHeight,
      maxWidth: 'none',
      maxHeight: 'none',
      borderRadius: '24px',
      borderWidth: '1px',
      borderColor: 'rgba(255, 255, 255, 0.15)',
      boxShadow: 'none',
      outline: 'none',
      x: -step,
      y: 0,
      scale: 0.88,
      opacity: 0,
      zIndex: 10,
    });

    gsap.set(cRight, {
      width: cardWidth,
      height: cardHeight,
      maxWidth: 'none',
      maxHeight: 'none',
      borderRadius: '24px',
      borderWidth: '1px',
      borderColor: 'rgba(255, 255, 255, 0.15)',
      boxShadow: 'none',
      outline: 'none',
      x: step,
      y: 0,
      scale: 0.88,
      opacity: 0,
      zIndex: 10,
    });

    // Make morph stage visible and hide background layer
    gsap.set(stage, { display: 'flex', opacity: 1 });
    if (fullBg) gsap.set(fullBg, { opacity: 0 });

    const mainTl = gsap.timeline({
      defaults: { ease: 'power2.inOut' }
    });
    timelineRef.current = mainTl;

    // =========================================================================
    // STAGE 1: SHRINK & OLD TEXT EXIT (Slower, organic contraction)
    // =========================================================================
    if (kineticItems.length > 0) {
      mainTl.to(kineticItems, {
        yPercent: 115,
        opacity: 0,
        stagger: 0.04,
        duration: 0.38,
        ease: 'power2.in',
      }, 0);
    }

    // Center card smoothly contracts into center card dimensions
    mainTl.to(cCenter, {
      width: cardWidth,
      height: cardHeight,
      borderRadius: '24px',
      borderWidth: '1px',
      borderColor: 'rgba(255, 255, 255, 0.25)',
      duration: 0.70,
      ease: 'power2.inOut',
    }, 0);

    // Flanking cards fade in at their positions
    mainTl.to([cLeft, cRight], {
      opacity: 0.5,
      duration: 0.55,
      ease: 'power2.out',
    }, 0.08);

    // =========================================================================
    // STAGE 2: 3-CARD CAROUSEL TRACK SLIDE (Smooth, slow horizontal glide)
    // =========================================================================
    if (direction > 0) {
      mainTl.to(cCenter, {
        x: -step,
        scale: 0.88,
        opacity: 0.5,
        zIndex: 10,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        borderWidth: '1px',
        duration: 0.75,
        ease: 'power2.inOut',
      }, 'slideTrack');

      mainTl.to(cRight, {
        x: 0,
        scale: 1.0,
        opacity: 1.0,
        zIndex: 30,
        borderColor: 'rgba(251, 191, 36, 0.9)',
        borderWidth: '2px',
        duration: 0.75,
        ease: 'power2.inOut',
      }, 'slideTrack');

      mainTl.to(cLeft, {
        x: -step * 1.8,
        opacity: 0,
        scale: 0.75,
        duration: 0.65,
        ease: 'power2.in',
      }, 'slideTrack');
    } else {
      mainTl.to(cCenter, {
        x: step,
        scale: 0.88,
        opacity: 0.5,
        zIndex: 10,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        borderWidth: '1px',
        duration: 0.75,
        ease: 'power2.inOut',
      }, 'slideTrack');

      mainTl.to(cLeft, {
        x: 0,
        scale: 1.0,
        opacity: 1.0,
        zIndex: 30,
        borderColor: 'rgba(251, 191, 36, 0.9)',
        borderWidth: '2px',
        duration: 0.75,
        ease: 'power2.inOut',
      }, 'slideTrack');

      mainTl.to(cRight, {
        x: step * 1.8,
        opacity: 0,
        scale: 0.75,
        duration: 0.65,
        ease: 'power2.in',
      }, 'slideTrack');
    }

    // Focal pause for visual balance and comprehension
    mainTl.to({}, { duration: 0.10 });

    // =========================================================================
    // STAGE 3: TARGET CARD FULL EXPANSION (Cinematic, slow-bloom full expand)
    // =========================================================================
    // Pre-activate target animal index in React so the background layer switches behind expanding card
    mainTl.call(() => {
      setCurrentIndex(nextIdx);
    }, null, 'expandHero+=0.1');

    mainTl.to(targetCardEl, {
      width: vw,
      height: vh,
      borderRadius: '0px',
      borderWidth: '0px',
      borderColor: 'transparent',
      boxShadow: 'none',
      outline: 'none',
      x: 0,
      zIndex: 40,
      duration: 0.85,
      ease: 'power2.inOut',
    }, 'expandHero');

    // Flanking cards fade out cleanly
    mainTl.to([cCenter, oppositeCardEl], {
      opacity: 0,
      scale: 0.75,
      duration: 0.50,
      ease: 'power2.in',
    }, 'expandHero');

    // =========================================================================
    // STAGE 4: ATOMIC HAND-OFF & STRICTLY SEQUENTIAL TEXT ENTRANCE
    // =========================================================================
    mainTl.call(() => {
      // 1. Ensure background layer is visible (target image is already active and rendered)
      if (fullBg) {
        gsap.set(fullBg, {
          opacity: 1,
          scale: 1,
          borderRadius: '0px',
          border: 'none',
          boxShadow: 'none',
        });
      }

      // 2. Hide morph stage and reset card elements
      gsap.set(stage, { display: 'none', opacity: 0 });

      gsap.set(cCenter, {
        x: 0,
        y: 0,
        scale: 1.0,
        opacity: 1.0,
        width: cardWidth,
        height: cardHeight,
        borderRadius: '24px',
        borderWidth: '1px',
        borderColor: 'rgba(251, 191, 36, 0.9)',
        boxShadow: 'none',
        outline: 'none',
        zIndex: 30,
      });

      gsap.set(cLeft, {
        x: -step,
        y: 0,
        scale: 0.88,
        opacity: 0.5,
        width: cardWidth,
        height: cardHeight,
        borderRadius: '24px',
        borderWidth: '1px',
        borderColor: 'rgba(255, 255, 255, 0.15)',
        boxShadow: 'none',
        outline: 'none',
        zIndex: 10,
      });

      gsap.set(cRight, {
        x: step,
        y: 0,
        scale: 0.88,
        opacity: 0.5,
        width: cardWidth,
        height: cardHeight,
        borderRadius: '24px',
        borderWidth: '1px',
        borderColor: 'rgba(255, 255, 255, 0.15)',
        boxShadow: 'none',
        outline: 'none',
        zIndex: 10,
      });

      // 3. Cascading text entrance
      if (textGroupRef.current) {
        const kineticItems = textGroupRef.current.querySelectorAll('.kinetic-item');
        if (kineticItems.length > 0) {
          gsap.set(kineticItems, { yPercent: 115, opacity: 0 });
          gsap.to(kineticItems, {
            yPercent: 0,
            opacity: 1,
            stagger: 0.08,
            duration: 0.75,
            ease: 'power3.out',
            onComplete: () => setIsTransitioning(false),
          });
        } else {
          setIsTransitioning(false);
        }
      } else {
        setIsTransitioning(false);
      }
    }, null, 'expandHero+=0.85');

  }, [currentIndex, isTransitioning, reducedMotion]);

  const goToNext = useCallback(() => {
    goToSlide(currentIndex + 1);
  }, [currentIndex, goToSlide]);

  const goToPrev = useCallback(() => {
    goToSlide(currentIndex - 1);
  }, [currentIndex, goToSlide]);

  // Hold-to-Explore press interaction logic
  const startHold = useCallback(() => {
    if (isTransitioning) return;
    setIsHolding(true);
    holdStartRef.current = performance.now();

    const animate = (time) => {
      const elapsed = time - holdStartRef.current;
      const progress = Math.min(1, elapsed / HOLD_DURATION_MS);
      setHoldProgress(progress);

      if (progress >= 1) {
        setIsHolding(false);
        setHoldProgress(0);
        goToNext();
      } else {
        holdAnimRef.current = requestAnimationFrame(animate);
      }
    };

    if (holdAnimRef.current) cancelAnimationFrame(holdAnimRef.current);
    holdAnimRef.current = requestAnimationFrame(animate);
  }, [goToNext, isTransitioning]);

  const cancelHold = useCallback(() => {
    setIsHolding(false);
    if (holdAnimRef.current) {
      cancelAnimationFrame(holdAnimRef.current);
      holdAnimRef.current = null;
    }
    // Smoothly reset hold progress
    gsap.to({ val: holdProgress }, {
      val: 0,
      duration: 0.2,
      onUpdate: function () {
        setHoldProgress(this.targets()[0].val);
      },
    });
  }, [holdProgress]);

  // Timeline Slider Scrubbing Interactions
  const handleScrubStart = (e) => {
    if (isTransitioning) return;
    setIsScrubbing(true);
    handleScrubMove(e);
  };

  const handleScrubMove = (e) => {
    if (!scrubTrackRef.current) return;
    const rect = scrubTrackRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const rawProgress = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const targetIdx = Math.min(BIG_FIVE_DATA.length - 1, Math.floor(rawProgress * BIG_FIVE_DATA.length));
    setScrubPreviewIndex(targetIdx);
  };

  const handleScrubEnd = () => {
    if (isScrubbing && scrubPreviewIndex !== null && scrubPreviewIndex !== currentIndex) {
      goToSlide(scrubPreviewIndex);
    }
    setIsScrubbing(false);
    setScrubPreviewIndex(null);
  };

  // Keyboard accessibility listeners (Arrow Left & Arrow Right)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;

      if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        goToPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev]);

  // Touch swipe support for mobile devices
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const diffX = touchStartXRef.current - touchEndX;
    const diffY = touchStartYRef.current - touchEndY;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 45) {
      if (diffX > 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  return {
    currentIndex,
    currentAnimal: BIG_FIVE_DATA[currentIndex],
    totalSlides: BIG_FIVE_DATA.length,
    isTransitioning,
    holdProgress,
    isHolding,
    reducedMotion,
    isScrubbing,
    scrubPreviewIndex,
    goToSlide,
    goToNext,
    goToPrev,
    startHold,
    cancelHold,
    handleScrubStart,
    handleScrubMove,
    handleScrubEnd,
    handleTouchStart,
    handleTouchEnd,
    containerRef,
    textGroupRef,
    fullBleedBgRef,
    morphStageRef,
    cardLeftRef,
    cardCenterRef,
    cardRightRef,
    scrubTrackRef,
  };
}
