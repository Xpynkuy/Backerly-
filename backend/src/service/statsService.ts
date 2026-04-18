import prisma from "../config/prisma";

export interface AuthorStats {
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalSubscribers: number;
  paidSubscribers: number;
  freeSubscribers: number;
  postsPerMonth: { month: string; count: number }[];
  subscribersPerMonth: { month: string; count: number }[];
  topPosts: {
    id: string;
    title: string;
    likes: number;
    comments: number;
    createdAt: Date;
  }[];
  popularTags: { tag: string; count: number }[];
}

export const getAuthorStats = async (userId: string): Promise<AuthorStats> => {
  const now = new Date();

  const [
    totalPosts,
    totalLikes,
    totalComments,
    totalFollowers,
    paidSubscribers,
  ] = await Promise.all([
    prisma.post.count({ where: { authorId: userId } }),
    prisma.postLike.count({
      where: { post: { authorId: userId } },
    }),
    prisma.comment.count({
      where: { post: { authorId: userId } },
    }),
    prisma.subscription.count({
      where: { authorId: userId, kind: "follow", status: "active" },
    }),
    prisma.subscription.count({
      where: {
        authorId: userId,
        kind: "paid",
        OR: [
          { status: "active" },
          {
            AND: [
              { status: "cancelled" },
              { expiresAt: { gt: now } },
            ],
          },
        ],
        expiresAt: { gt: now },
      },
    }),
  ]);

  // Free subscribers = all followers. Paying users always have a follow row,
  // so they are intentionally counted in both Free and Paid metrics.
  const freeSubscribers = totalFollowers;
  const totalSubscribers = totalFollowers;

  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const posts = await prisma.post.findMany({
    where: { authorId: userId, createdAt: { gte: twelveMonthsAgo } },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const postsPerMonth = aggregateByMonth(posts.map((p) => p.createdAt));

  const subs = await prisma.subscription.findMany({
    where: {
      authorId: userId,
      kind: "follow",
      createdAt: { gte: twelveMonthsAgo },
    },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const subscribersPerMonth = aggregateByMonth(subs.map((s) => s.createdAt));

  const topPosts = await prisma.post.findMany({
    where: { authorId: userId },
    orderBy: { likes: { _count: "desc" } },
    take: 5,
    select: {
      id: true,
      title: true,
      createdAt: true,
      _count: { select: { likes: true, comments: true } },
    },
  });

  const allPosts = await prisma.post.findMany({
    where: { authorId: userId },
    select: { tags: true },
  });

  const tagCounts = new Map<string, number>();
  for (const p of allPosts) {
    for (const tag of p.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }

  const popularTags = Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalPosts,
    totalLikes,
    totalComments,
    totalSubscribers,
    paidSubscribers,
    freeSubscribers,
    postsPerMonth,
    subscribersPerMonth,
    topPosts: topPosts.map((p) => ({
      id: p.id,
      title: p.title,
      likes: p._count.likes,
      comments: p._count.comments,
      createdAt: p.createdAt,
    })),
    popularTags,
  };
};

function aggregateByMonth(dates: Date[]): { month: string; count: number }[] {
  const map = new Map<string, number>();
  for (const d of dates) {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));
}