import { useEffect, useState } from 'react';
import styles from './Typewriter.module.css';

interface Props {
  text: string;
  speed?: number;
  startDelay?: number;
  showCursor?: boolean;
}

export function Typewriter({ text, speed = 55, startDelay = 200, showCursor = true }: Props) {
  const [out, setOut] = useState('');

  useEffect(() => {
    let mounted = true;
    setOut('');
    let i = 0;
    const tick = () => {
      if (!mounted) return;
      if (i < text.length) {
        i++;
        setOut(text.slice(0, i));
        setTimeout(tick, speed);
      }
    };
    const t = setTimeout(tick, startDelay);
    return () => {
      mounted = false;
      clearTimeout(t);
    };
  }, [text, speed, startDelay]);

  return (
    <span className={styles.wrap}>
      <span>{out}</span>
      {showCursor && <span className={styles.caret} aria-hidden>|</span>}
    </span>
  );
}
