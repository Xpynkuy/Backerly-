import {MainPage} from "@pages/main";
import {Layout} from "@widgets/layout";
import {Route, Routes} from "react-router";
import {LoginPage} from "@pages/login";
import {RegisterPage} from "@pages/register";
import {AuthLayout} from "@widgets/authLayout";
import {ProtectedRoute} from "@shared/lib/protectedRoute/ProtectedRoute.tsx";
import {Profile} from "@pages/profile";
import {Feed} from "@pages/feed";

const AppRoute = () => {
  return (
    //MAIN LAYOUT
    <Routes>
      <Route
        element={<Layout />}
      >
        <Route
          path="/"
          element={<MainPage />}
        ></Route>
        <Route
          path='/profile'
          element={<ProtectedRoute><Profile /></ProtectedRoute>}
        ></Route>
        <Route
          path='/feed'
          element={<ProtectedRoute><Feed /></ProtectedRoute>}
        ></Route>
      </Route>


      //AUTH LAYOUT
      <Route element={<AuthLayout />}>
        <Route
          path='/login'
          element={<LoginPage />}
        ></Route>
        <Route
          path='/register'
          element={<RegisterPage />}
        ></Route>
      </Route>

    </Routes>
  );
};

export default AppRoute;
