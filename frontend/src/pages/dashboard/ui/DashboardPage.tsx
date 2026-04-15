import { useGetDashboardStatsQuery } from "@entities/post/model/api/postApi";
import { useGetMeQuery } from "@features/auth/model/api/authApi";
import Loader from "@shared/ui/loader/Loader";
import { useTranslation } from "react-i18next";
import { Navigate } from "react-router-dom";
import styles from "./DashboardPage.module.scss";
 
export const DashboardPage = () => {
  const { data: me, isLoading: isMeLoading } = useGetMeQuery();
  const { data, isLoading, isError } = useGetDashboardStatsQuery(undefined, {
    skip: !me?.isCreator,
  });
  const { t, i18n } = useTranslation();
 
  if (isMeLoading) return <Loader />;
  if (me && !me.isCreator) return <Navigate to="/" replace />;
 
  if (isLoading) return <Loader />;
  if (isError || !data) return <div>Failed to load stats</div>;
 
  // "2025-03" -> "Мар 2025" / "Mar 2025"
  const formatMonthLabel = (monthStr: string) => {
    const [year, month] = monthStr.split("-").map(Number);
    if (!year || !month) return monthStr;
    const date = new Date(year, month - 1, 1);
    const locale = i18n.language?.startsWith("ru") ? "ru-RU" : "en-US";
    const monthName = date.toLocaleString(locale, { month: "short" });
    const capitalized =
      monthName.charAt(0).toUpperCase() + monthName.slice(1).replace(".", "");
    return `${capitalized} ${year}`;
  };
 
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t("dashboard.title")}</h2>
 
      <div className={styles.grid}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{data.totalPosts}</span>
          <span className={styles.statLabel}>{t("dashboard.posts")}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{data.totalLikes}</span>
          <span className={styles.statLabel}>{t("dashboard.likes")}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{data.totalComments}</span>
          <span className={styles.statLabel}>{t("dashboard.comments")}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{data.totalSubscribers}</span>
          <span className={styles.statLabel}>{t("dashboard.subscribers")}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{data.paidSubscribers}</span>
          <span className={styles.statLabel}>{t("dashboard.paidSubs")}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{data.freeSubscribers}</span>
          <span className={styles.statLabel}>{t("dashboard.freeSubs")}</span>
        </div>
      </div>
 
      {data.postsPerMonth.length > 0 && (
        <div className={styles.section}>
          <h3>{t("dashboard.postsChart")}</h3>
          <div className={styles.chartWrapper}>
            <div className={styles.chart}>
              {data.postsPerMonth.map((item: any) => (
                <div key={item.month} className={styles.bar}>
                  <div
                    className={styles.barFill}
                    style={{
                      height: `${Math.max(
                        (item.count /
                          Math.max(
                            ...data.postsPerMonth.map((i: any) => i.count),
                          )) *
                          120,
                        4,
                      )}px`,
                    }}
                  />
                  <span className={styles.barLabel}>
                    {formatMonthLabel(item.month)}
                  </span>
                  <span className={styles.barValue}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
 
      {data.subscribersPerMonth.length > 0 && (
        <div className={styles.section}>
          <h3>{t("dashboard.subsChart")}</h3>
          <div className={styles.chartWrapper}>
            <div className={styles.chart}>
              {data.subscribersPerMonth.map((item: any) => (
                <div key={item.month} className={styles.bar}>
                  <div
                    className={`${styles.barFill} ${styles.barFillAccent}`}
                    style={{
                      height: `${Math.max(
                        (item.count /
                          Math.max(
                            ...data.subscribersPerMonth.map(
                              (i: any) => i.count,
                            ),
                          )) *
                          120,
                        4,
                      )}px`,
                    }}
                  />
                  <span className={styles.barLabel}>
                    {formatMonthLabel(item.month)}
                  </span>
                  <span className={styles.barValue}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
 
      {data.topPosts.length > 0 && (
        <div className={styles.section}>
          <h3>{t("dashboard.topPosts")}</h3>
          <div className={styles.topList}>
            {data.topPosts.map((post: any, i: number) => (
              <div key={post.id} className={styles.topItem}>
                <span className={styles.topRank}>{i + 1}</span>
                <div className={styles.topInfo}>
                  <span className={styles.topTitle}>{post.title}</span>
                  <span className={styles.topMeta}>
                    ❤ {post.likes} · 💬 {post.comments}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
 
      {data.popularTags.length > 0 && (
        <div className={styles.section}>
          <h3>{t("dashboard.popularTags")}</h3>
          <div className={styles.tagCloud}>
            {data.popularTags.map((item: any) => (
              <span key={item.tag} className={styles.tagItem}>
                #{item.tag} ({item.count})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};