import { useState } from "react";
import MyButton from "@shared/ui/button/MyButton";
import { useUpdateDescriptionMutation } from "@entities/user/model/api/userApi";
import TextArea from "@shared/ui/textArea/TextArea";
import styles from "./UserDescription.module.scss";
import { Trash } from "lucide-react";

interface UserDescriptionProps {
  username: string;
  description?: string | null;
  isMyProfile: boolean;
}
export const UserDescription = (props: UserDescriptionProps) => {
  const { username, description, isMyProfile } = props;
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(description ?? "");

  const [updateDescription, { isLoading }] = useUpdateDescriptionMutation();

  const save = async () => {
    await updateDescription({
      username,
      description: text.trim() || null,
    }).unwrap();

    setEditing(false);
  };

  if (!isMyProfile && !description) return null;

  return (
    <div className={styles.container}>
      {editing ? (
        <>
          <TextArea
            value={text}
            onChange={(e) => setText(e.target.value)}
            width="400px"
          />
          <div className={styles.buttons}>
            <MyButton onClick={save} disabled={isLoading}>
              Save
            </MyButton>
            <MyButton color="RED" onClick={() => setEditing(false)}>
              Cancel
            </MyButton>
          </div>
        </>
      ) : (
        <>
          {description && <p className={styles.desc}>{description}</p>}

          {isMyProfile && (
            <div className={styles.buttons}>
              <MyButton
                size="AUTO"
                color="TRANSPARENT"
                onClick={() => setEditing(true)}
              >
                {description ? "Edit" : "Add description"}
              </MyButton>

              {description && (
                <MyButton
                  size="SMALL"
                  color="TRANSPARENT"
                  icon={<Trash size={16} />}
                  onClick={() =>
                    updateDescription({
                      username,
                      description: null,
                    })
                  }
                >
                  Delete
                </MyButton>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
