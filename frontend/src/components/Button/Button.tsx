import React from "react";
import styles from "./Button.module.css";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "cancel" | "delete" | "copy" | "utility";
  className?: string;
};

const Button: React.FC<ButtonProps> = ({
  variant = "default",
  className = "",
  ...props
}) => {
  const variantClass = variant !== "default" ? styles[variant] : "";
  return (
    <button
      className={[styles.button, variantClass, className].filter(Boolean).join(" ")}
      {...props}
    />
  );
};

export default Button;
