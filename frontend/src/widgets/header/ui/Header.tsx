import { useAppSelector } from "@shared/lib/hooks/hooks";
import MainHeader from "./MainHeader";
import GuestHeader from "./GuestHeader";

export const Header = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <GuestHeader />;
  }
  return <MainHeader />;
};
