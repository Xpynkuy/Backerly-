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

const AppRoute = () => {
  return (
    //MAIN LAYOUT
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
      </Route>
      <Route path="*" element={<NotFoundPage />}></Route>
      //AUTH LAYOUT
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />}></Route>
        <Route path="/register" element={<RegisterPage />}></Route>
      </Route>
    </Routes>
  );
};

export default AppRoute;
