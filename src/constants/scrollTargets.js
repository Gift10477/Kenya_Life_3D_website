/**
 * Karibu Kenya — Shared Scroll Target Constants
 *
 * All scroll offsets into the GSAP-pinned hero pin-spacer are expressed as
 * multiples of window.innerHeight so they remain resolution-independent.
 *
 * Timeline progress thresholds:
 *   p >= 0.18  → discovery
 *   p >= 0.65  → bigfive
 *
 * The pin duration is ~4.6–5.2 × viewport heights.
 *   discovery offset  = ~1.35 vh  (smoothly inside the 0.20–0.58 discovery cards window)
 *   bigfive  offset   = ~3.60 vh  (centered inside the 0.70–1.00 Big Five resting window)
 */
export const SCROLL_TARGETS = {
  /** How many innerHeight multiples past pinSpacer.top gets us into the Discovery phase */
  DISCOVERY_MULTIPLIER: 1.35,
  /** How many innerHeight multiples past pinSpacer.top gets us into the Big Five resting window */
  BIGFIVE_MULTIPLIER: 3.60,
};

/**
 * Helper: resolve the absolute scroll position for a chapter inside the pin-spacer.
 * @param {'discovery'|'bigfive'} chapterId
 * @returns {number} absolute scroll Y in pixels
 */
export function getPinnedChapterScrollY(chapterId) {
  const heroExp = document.getElementById('hero-experience');
  const pinSpacer = heroExp?.parentElement;
  const baseTop = pinSpacer?.classList.contains('pin-spacer')
    ? pinSpacer.offsetTop
    : heroExp?.offsetTop ?? 0;

  if (chapterId === 'discovery') {
    return baseTop + window.innerHeight * SCROLL_TARGETS.DISCOVERY_MULTIPLIER;
  }
  if (chapterId === 'bigfive') {
    return baseTop + window.innerHeight * SCROLL_TARGETS.BIGFIVE_MULTIPLIER;
  }
  return baseTop;
}
