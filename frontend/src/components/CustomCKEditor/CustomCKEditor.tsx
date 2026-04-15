import React, { useState, useEffect, useRef, useMemo } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import DecoupledEditor from "@ckeditor/ckeditor5-build-decoupled-document";

import styles from "./CustomCKEditor.module.css";

const LICENSE_KEY = "GPL"; // or <YOUR_LICENSE_KEY>.

interface CustomCKEditorProps {
  initialData?: string;
  onChange?: (data: string) => void;
}

const CustomCKEditor: React.FC<CustomCKEditorProps> = ({
  initialData = "",
  onChange,
}) => {
  const editorMenuBarRef = useRef<HTMLDivElement>(null);
  const editorToolbarRef = useRef<HTMLDivElement>(null);
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const [data, setData] = useState(initialData);

  useEffect(() => {
    setIsLayoutReady(true);
    return () => setIsLayoutReady(false);
  }, []);

  const { editorConfig } = useMemo(() => {
    if (!isLayoutReady) {
      return {};
    }
    return {
      editorConfig: {
        root: {
          placeholder: "Type or paste your content here!",
          initialData,
        },
        toolbar: {
          items: [
            "undo",
            "redo",
            "|",
            "fontSize",
            "fontColor",
            "fontBackgroundColor",
            "|",
            "bold",
            "italic",
            "underline",
            "|",
            "link",
            "insertTable",
            "|",
            "alignment",
            "|",
            "bulletedList",
            "numberedList",
            "outdent",
            "indent",
          ],
          shouldNotGroupWhenFull: false,
        },
        licenseKey: LICENSE_KEY,
        // ...other config (plugins, balloonToolbar, fontFamily, etc.)...
      },
    };
  }, [isLayoutReady, initialData]);

  return (
    <div className={styles.mainContainer}>
      <div
        className={[
          styles.editorContainer,
          styles.editorContainerDocumentEditor,
          styles.editorContainerIncludeStyle,
          styles.editorContainerIncludeFullscreen,
        ].join(" ")}
      >
        <div
          className={styles.editorContainerMenuBar}
          ref={editorMenuBarRef}
        ></div>
        <div
          className={styles.editorContainerToolbar}
          ref={editorToolbarRef}
        ></div>
        <div className={styles.editorContainerEditor}>
          {editorConfig && (
            <CKEditor
              editor={DecoupledEditor as any}
              config={editorConfig}
              data={data}
              onReady={(editor) => {
                const toolbarEl = editor.ui.view.toolbar?.element;
                if (editorToolbarRef.current && toolbarEl) {
                  editorToolbarRef.current.appendChild(toolbarEl);
                }
                const menuBarView = editor.ui.view.menuBarView;
                if (
                  editorMenuBarRef.current &&
                  menuBarView &&
                  menuBarView.element
                ) {
                  editorMenuBarRef.current.appendChild(menuBarView.element);
                }
                // Focus the editor when ready
                editor.editing.view.focus();
              }}
              onAfterDestroy={() => {
                if (editorToolbarRef.current) {
                  Array.from(editorToolbarRef.current.children).forEach(
                    (child) => child.remove(),
                  );
                }
                if (editorMenuBarRef.current) {
                  Array.from(editorMenuBarRef.current.children).forEach(
                    (child) => child.remove(),
                  );
                }
              }}
              onChange={(_event, editor) => {
                const newData = editor.getData();
                setData(newData);
                if (onChange) onChange(newData);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomCKEditor;
