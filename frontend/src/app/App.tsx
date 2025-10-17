import { Suspense } from "react";
import AppRoute from "./provider/routes/AppRoute";

const App = () => {
  return (
    <div className="app">
      <Suspense fallback="">
        <AppRoute />
      </Suspense>
    </div>
  );
};

export default App;
