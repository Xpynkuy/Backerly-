import Avatar from "@shared/ui/avatar/Avatar";
import styles from "./ProfileInfo.module.scss";
import MyButton from "@shared/ui/button/MyButton";
import {
  useUpdateAvatarMutation,
  useActivateCreatorMutation,
} from "@entities/user/model/api/userApi";
import { useRef, type ReactNode } from "react";
import type { User } from "@entities/user";
import { Camera, Users, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@shared/lib/hooks/hooks";
import { setUser } from "@features/auth/model/slice/authSlice";
 
interface ProfileInfoProps {
  user: User;
  isMyProfile: boolean;
  descriptionSlot: ReactNode;
}
 
const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "http://localhost:5001";
 
export const ProfileInfo = ({
  user,
  isMyProfile,
  descriptionSlot,
}: ProfileInfoProps) => {
  const [updateAvatar, { isLoading }] = useUpdateAvatarMutation();
  const [activateCreator, { isLoading: isActivating }] =
    useActivateCreatorMutation();
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((s) => s.auth.user);
 
  const pickAvatar = () => avatarInputRef.current?.click();
 
  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
 
    await updateAvatar({ username: user.username, file }).unwrap();
    e.target.value = "";
  };
 
  const handleActivateCreator = async () => {
    if (
      !confirm(
        t(
          "creator.activateConfirm",
          "Activate creator mode? You'll be able to publish posts and create subscription tiers.",
        ),
      )
    )
      return;
    try {
      const updated = await activateCreator().unwrap();
      if (authUser) {
        dispatch(setUser({ ...authUser, isCreator: true }));
      }
    } catch (e) {
      console.error("activate creator failed", e);
      alert(t("creator.activateFailed", "Failed to activate creator mode"));
    }
  };
 
  const avatarSrc = user.avatarUrl
    ? `${API_ORIGIN}${user.avatarUrl}`
    : "/default_avatar.png";
 
  return (
    <div className={styles.container}>
      <div className={styles.avatarWrapper}>
        <Avatar src={avatarSrc} size="160px" border="1px solid #555A60" />
 
        {isMyProfile && (
          <MyButton
            type="button"
            className={styles.avatarButton}
            onClick={pickAvatar}
            disabled={isLoading}
            icon={<Camera size={18} />}
            size="AUTO"
            color="GRAY"
          />
        )}
 
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={onAvatarChange}
        />
      </div>
 
      <h3 className={styles.username}>{user.username}</h3>
 
      {user.isCreator &&
        (() => {
          const followers = user.totalSubscriberCount ?? 0;
          const paid = user.paidSubscriberCount ?? 0;
 
          if (followers === 0 && paid === 0) return null;
 
          return (
            <div className={styles.subscriberStats}>
              <Users size={16} />
              <span>
                {followers > 0 && (
                  <>
                    {followers} {t("profile.followers")}
                  </>
                )}
                {followers > 0 && paid > 0 && <> · </>}
                {paid > 0 && (
                  <>
                    {paid} {t("profile.paidSubscribers")}
                  </>
                )}
              </span>
            </div>
          );
        })()}
 
      <div className={styles.desc}>{descriptionSlot}</div>
 
      {isMyProfile && !user.isCreator && (
        <div className={styles.creatorCta}>
          <div className={styles.creatorCtaHeader}>
            <Sparkles size={18} />
            <strong>{t("creator.becomeCreator", "Become a creator")}</strong>
          </div>
          <p className={styles.creatorCtaDesc}>
            {t(
              "creator.activateDesc",
              "Activate creator mode to publish posts and offer paid subscription tiers.",
            )}
          </p>
          <MyButton
            onClick={handleActivateCreator}
            disabled={isActivating}
            size="FULL"
            color="PRIMARY"
          >
            {isActivating
              ? "..."
              : t("creator.activateBtn", "Activate creator mode")}
          </MyButton>
        </div>
      )}
    </div>
  );
};