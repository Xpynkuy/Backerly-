import { MainPage } from "@pages/main";
import { Layout } from "@widgets/layout";
import { Route, Routes } from "react-router";

const AppRoute = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route path="/" element={<MainPage/>}></Route>
        <Route></Route>
        <Route></Route>
      </Route>
    </Routes>
  );
};

export default AppRoute;
