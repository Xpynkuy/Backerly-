import { MainPage } from "@pages/main";
import { Layout } from "@widgets/layout";
import { Route, Routes } from "react-router";
import { LoginPage } from "@pages/login";
import { RegisterPage } from "@pages/register";
import { AuthLayout } from "@widgets/authLayout";
import { ProtectedRoute } from "@shared/lib/protectedRoute/ProtectedRoute.tsx";
import { Profile } from "@pages/profile";
import { NotFoundPage } from "@pages/notFoundPage";
import { SearchPage } from "@pages/search";
import { SubscriptionsPage } from "@pages/subscriptions";
import { FeedPage } from "@pages/feed";
import { DashboardPage } from "@pages/dashboard/ui";
import { PayoutsPage } from "@pages/payouts";

const AppRoute = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<MainPage />}></Route>
        <Route
          path="/profile/:username"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <SearchPage />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path="/subscriptions"
          element={
            <ProtectedRoute>
              <SubscriptionsPage />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path="/feed"
          element={
            <ProtectedRoute>
              <FeedPage />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path="/payouts"
          element={
            <ProtectedRoute>
              <PayoutsPage />
            </ProtectedRoute>
          }
        ></Route>
      </Route>
      <Route path="*" element={<NotFoundPage />}></Route>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />}></Route>
        <Route path="/register" element={<RegisterPage />}></Route>
      </Route>
    </Routes>
  );
};

export default AppRoute;
