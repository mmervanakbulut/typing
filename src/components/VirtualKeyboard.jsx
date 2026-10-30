import React from 'react';
import { KEYBOARD_ROWS, HOME_ROW_ANCHORS } from '../constants/gameConfig';

export default function VirtualKeyboard({
  targetLetter,
  lastPressed,
  activePoolLetters
}) {
  const poolSet = new Set(activePoolLetters);

  return (
    <div className="virtual-keyboard" aria-label="Sanal Klavye Rehberi">
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="keyboard-row">
          {row.map((keyChar) => {
            const isTarget = targetLetter === keyChar;
            const isInPool = poolSet.has(keyChar);
            const isPressedCorrect =
              lastPressed?.char === keyChar && lastPressed?.correct;
            const isPressedWrong =
              lastPressed?.char === keyChar && !lastPressed?.correct;
            const isAnchor = HOME_ROW_ANCHORS.includes(keyChar);

            let className = 'key-cap';
            if (!isInPool) className += ' key-dimmed';
            if (isTarget) className += ' key-target';
            if (isPressedCorrect) className += ' key-correct';
            if (isPressedWrong) className += ' key-wrong';

            return (
              <div key={keyChar} className={className}>
                <span className="key-letter">{keyChar}</span>
                {isAnchor && <span className="key-bump" />}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

