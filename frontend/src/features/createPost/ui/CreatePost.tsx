import { useState } from "react";
import { useCreatePostMutation } from "@entities/post/model/api/postApi";

export const CreatePost = ({
  username,
  onCreated,
}: {
  username: string;
  onCreated: () => void;
}) => {
  const [createPost, { isLoading }] = useCreatePostMutation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    await createPost({ username, title, description, image }).unwrap();

    setTitle("");
    setDescription("");
    setImage(null);

    onCreated();
  };

  return (
    <form
      onSubmit={submit}
      style={{ border: "1px solid #ddd", padding: 12, borderRadius: 12 }}
    >
      <h3 style={{ marginTop: 0 }}>Create post</h3>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        style={{ width: "100%", marginBottom: 8 }}
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        style={{ width: "100%", marginBottom: 8, minHeight: 90 }}
      />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files?.[0] ?? null)}
      />

      <div style={{ marginTop: 8 }}>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Publishing..." : "Publish"}
        </button>
      </div>
    </form>
  );
};
