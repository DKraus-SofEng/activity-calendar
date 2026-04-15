import React, { useRef, useState, useEffect } from "react";
import styles from "./Modal.module.css";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string; // Now just a string
  content?: React.ReactNode;
  showCloseButton?: boolean;
  className?: string; // for custom modal sizing or extra classes
  children?: React.ReactNode; // optional, for extra flexibility
  initialPosition?: { x: number; y: number }; // optional, for initial modal position
  draggable?: boolean; // allow disabling drag if needed
}

const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  content,
  showCloseButton = true,
  className,
  children,
  initialPosition = {
    x: window.innerWidth / 2 - 200,
    y: window.innerHeight / 2 - 220,
  },
  draggable = true,
}) => {
  const [position, setPosition] = useState(initialPosition);
  const dragData = useRef({ dragging: false, offsetX: 0, offsetY: 0 });
  const wasDragging = useRef(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPosition(initialPosition);
    // eslint-disable-next-line
  }, [open]);

  const handleDragStart = (e: React.MouseEvent) => {
    if (!draggable) return;
    dragData.current.dragging = true;
    wasDragging.current = false;
    if (modalRef.current) {
      const rect = modalRef.current.getBoundingClientRect();
      dragData.current.offsetX = e.clientX - rect.left;
      dragData.current.offsetY = e.clientY - rect.top;
    } else {
      dragData.current.offsetX = e.clientX - position.x;
      dragData.current.offsetY = e.clientY - position.y;
    }
    document.body.style.userSelect = "none";
  };
  const handleDrag = (e: MouseEvent) => {
    if (!dragData.current.dragging) return;
    wasDragging.current = true;
    const x = e.clientX - dragData.current.offsetX;
    const y = e.clientY - dragData.current.offsetY;
    setPosition({ x, y });
  };
  const handleDragEnd = () => {
    dragData.current.dragging = false;
    document.body.style.userSelect = "";
  };
  useEffect(() => {
    if (!draggable) return;
    window.addEventListener("mousemove", handleDrag);
    window.addEventListener("mouseup", handleDragEnd);
    return () => {
      window.removeEventListener("mousemove", handleDrag);
      window.removeEventListener("mouseup", handleDragEnd);
    };
    // eslint-disable-next-line
  }, [position, draggable]);

  if (!open) return null;
  // Handler for outside click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (wasDragging.current) {
      wasDragging.current = false;
      return;
    }
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div
        ref={modalRef}
        className={`${styles.modal} ${className || ""}`}
        style={
          draggable && dragData.current.dragging
            ? {
                position: "absolute",
                left: position.x,
                top: position.y,
                margin: 0,
              }
            : {}
        }
      >
        <div
          className={styles.dialogTitle}
          style={{
            cursor: draggable ? "move" : "default",
            position: "relative",
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            handleDragStart(e);
          }}
          onMouseUp={(e) => {
            e.stopPropagation();
            handleDragEnd();
          }}
        >
          {title}
          {showCloseButton && (
            <button
              className={styles.closeX}
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              aria-label="Close"
              style={{ position: "absolute", right: 0, top: 0 }}
            >
              ×
            </button>
          )}
        </div>
        {content && <div className={styles.dialogContent}>{content}</div>}
        {children}
      </div>
    </div>
  );
};

export default Modal;
