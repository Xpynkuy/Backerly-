import React, { useEffect, useState } from "react";
import { useAppSelector } from "@shared/lib/hooks/hooks";
import { useNavigate } from "react-router-dom";
import MyInput from "@shared/ui/input/MyInput";
import Loader from "@shared/ui/loader/Loader";
import { UserCard } from "../userCard/UserCard";
import { useLazySearchUsersQuery } from "@entities/user/model/api/userApi";
import styles from "./UserSearch.module.scss";
import { useTranslation } from "react-i18next";

export const UserSearch: React.FC = () => {
  const isAuth = !!useAppSelector((s) => s.auth.isAuthenticated);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [trigger, { data, isFetching, isError, error }] =
    useLazySearchUsersQuery();

  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState(query);

  useEffect(() => {
    if (!isAuth) {
      navigate("/login");
    }
  }, [isAuth, navigate]);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!debounced) return;
    trigger({ query: debounced });
  }, [debounced, trigger]);

  const results = data?.items ?? [];

  {
    isFetching && <Loader />;
  }

  {
    isError && <div style={{ color: "red" }}>{t("Failed to search users")}</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t("Find a Creator")}</h2>

      <MyInput
        placeholder={t("Type username...")}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {!isFetching && !error && (
        <>
          {debounced === "" ? (
            <div className={styles.notif}>
              {t("Enter at least 1 character to search")}
            </div>
          ) : results.length === 0 ? (
            <div className={styles.notif}>{t("No users found")}</div>
          ) : (
            <div className={styles.userList}>
              {results.map((u) => (
                <UserCard key={u.id} user={u} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
