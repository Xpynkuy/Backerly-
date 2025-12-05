import type {FC} from "react";
import {useAppSelector} from "@shared/lib/hooks/hooks.ts";
import {Navigate, useLocation} from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: FC<ProtectedRouteProps> = ({children}) => {
  const {isAuthenticated} = useAppSelector(state => state.auth)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate
      to='/login'
      state={{from: location}}
      replace
    />
  }

  return children;
}