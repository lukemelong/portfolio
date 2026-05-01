export function playItsTimeSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;

    // Additive bell synthesis using inharmonic partials (real bells aren't harmonic).
    // Higher partials decay faster, giving the characteristic "clang then ring" shape.
    const bellStrike = (freq, startTime, ringDuration) => {
      const partials = [
        { ratio: 1,     amp: 0.5,  decayMult: 1.0  },
        { ratio: 2.756, amp: 0.25, decayMult: 0.4  },
        { ratio: 5.404, amp: 0.12, decayMult: 0.2  },
        { ratio: 8.933, amp: 0.06, decayMult: 0.12 },
      ];
      partials.forEach(({ ratio, amp, decayMult }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = freq * ratio;
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(amp, startTime + 0.006);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + ringDuration * decayMult);
        osc.start(startTime);
        osc.stop(startTime + ringDuration * decayMult + 0.05);
      });
    };

    // Two descending strikes — second is lower and quieter, like a distant echo
    bellStrike(196.00, now, 3.5);        // G3 — first toll
    bellStrike(146.83, now + 1.1, 3.0); // D3 — second toll, a fifth lower

    // Sub-bass drone underneath for weight and dread
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.connect(subGain);
    subGain.connect(ctx.destination);
    sub.type = 'sine';
    sub.frequency.value = 73.42; // D2
    subGain.gain.setValueAtTime(0, now);
    subGain.gain.linearRampToValueAtTime(0.12, now + 0.4);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);
    sub.start(now);
    sub.stop(now + 2.9);
  } catch {
    // AudioContext unavailable; silent fallback
  }
}
