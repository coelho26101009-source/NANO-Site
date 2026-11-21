/** A band of big words that never stops moving (still with reduced motion). */
export function Marquee({ words }: { words: readonly string[] }) {
  const run = (copy: number) =>
    words.map((word, index) => (
      <span key={`${copy}-${word}`} className="marquee-item">
        <span
          className={index % 2 ? "marquee-word outline" : "marquee-word serif"}
        >
          {word}
        </span>
        <span className="marquee-star">✳</span>
      </span>
    ));
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {run(0)}
        {run(1)}
      </div>
    </div>
  );
}
