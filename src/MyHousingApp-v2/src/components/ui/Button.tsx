import { forwardRef, type ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  iconLeft?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, iconLeft, children, className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      data-variant={variant}
      data-size={size}
      data-loading={loading ? 'true' : undefined}
      className={[styles.btn, className].filter(Boolean).join(' ')}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {iconLeft && <span className={styles.icon}>{iconLeft}</span>}
      <span>{children}</span>
    </button>
  );
});
