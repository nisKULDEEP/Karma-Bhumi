import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./protected.route";
import AuthRoute from "./auth.route";
import {
  authenticationRoutePaths,
  baseRoutePaths,
  protectedRoutePaths,
} from "./common/routes";
import BaseLayout from "@/layout/base.layout";
import NotFound from "@/page/errors/NotFound";

function AppRoutes() {
  return (
    <Routes>
      <Route element={<BaseLayout />}>
        {baseRoutePaths.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Route>

      <Route path="/" element={<AuthRoute />}>
        <Route element={<BaseLayout />}>
          {authenticationRoutePaths.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={route.element}
            />
          ))}
        </Route>
      </Route>

      {/* Protected Route - this already includes AppLayout */}
      <Route path="/" element={<ProtectedRoute />}>
        {/* Removed the AppLayout wrapper since ProtectedRoute already includes it */}
        {protectedRoutePaths.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={route.element}
          />
        ))}
      </Route>
      
      {/* Catch-all for undefined routes */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
