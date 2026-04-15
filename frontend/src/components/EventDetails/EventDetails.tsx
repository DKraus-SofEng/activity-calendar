import React, { useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import styles from "./EventDetails.module.css";

import Button from "../Button/Button";
import CustomCKEditor from "../CustomCKEditor/CustomCKEditor";

interface EventDetailsProps {
  initialTitle?: string;
  initialContent?: string;
  onSave: (title: string, content: string) => void;
  onCancel: () => void;
  onDelete?: () => void;
  compact?: boolean;
}

const EventDetails: React.FC<EventDetailsProps> = ({
  initialTitle = "",
  initialContent = "",
  onSave,
  onCancel,
  onDelete,
  compact = false,
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);

  return (
    <form className={styles.eventDetailsForm}>
      <input
        className={styles.eventTitleInput}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
      />
      <div className={styles.editorContainer}>
        <CustomCKEditor initialData={content} onChange={setContent} />
      </div>
      <div className={styles.eventDetailsActions}>
        <Button type="button" onClick={() => onSave(title, content)}>
          Save
        </Button>
        <Button type="button" variant="cancel" onClick={onCancel}>
          Cancel
        </Button>
        {onDelete && (
          <Button type="button" variant="delete" onClick={onDelete}>
            Delete
          </Button>
        )}
      </div>
    </form>
  );
};

export default EventDetails;

/* Toolbar */
/**
 * This configuration was generated using the CKEditor 5 Builder. You can modify it anytime using this link:
 * https://ckeditor.com/ckeditor-5/builder/#installation/NoDgNARAzAdADDAjBSBWATFAbATlVAFgPR0QHZ0s4ccCyCpEop1NVdVF0uc4L2UEAKYA7FFDDBEYaXBny4AXUgATCiFQBjdBEVA=
 */
