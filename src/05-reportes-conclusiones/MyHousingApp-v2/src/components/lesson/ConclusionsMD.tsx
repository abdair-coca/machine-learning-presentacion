import ReactMarkdown from 'react-markdown';
import styles from './ConclusionsMD.module.css';

export function ConclusionsMD({ content }: { content: string }) {
  return (
    <div className={styles.wrap}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
