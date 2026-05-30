import styles from './Plot.module.css';

interface Props {
  src?: string;
  alt?: string;
  placeholder?: string;
}

/** Renderiza una imagen base64 generada por matplotlib en Pyodide. */
export function Plot({ src, alt = 'Gráfico generado', placeholder = 'El gráfico aparecerá tras ejecutar el código.' }: Props) {
  if (!src) {
    return <div className={styles.placeholder}>{placeholder}</div>;
  }
  const dataUrl = src.startsWith('data:') ? src : `data:image/png;base64,${src}`;
  return (
    <figure className={styles.figure}>
      <img src={dataUrl} alt={alt} />
    </figure>
  );
}
