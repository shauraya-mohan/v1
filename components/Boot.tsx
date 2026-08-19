"use client";

import { Glyphs, Mark } from "./Mark";

export function Boot({ verb, ms }: { verb: string; ms: number }) {
  return (
    <div className="boot" style={{ animationDuration: `${ms}ms` }}>
      <div className="boot-mark">
        <Mark size={68} className="petal" />
      </div>
      <div className="boot-verb">
        <Glyphs size="sm" />
        {verb}
      </div>
      <div className="boot-name">Shauraya Mohan</div>
      <div className="boot-rule">
        <div style={{ animationDuration: `${ms - 300}ms` }} />
      </div>
    </div>
  );
}
