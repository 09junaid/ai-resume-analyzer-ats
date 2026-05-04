import { Outlet, useLocation } from "react-router";
import SiteHeader from "./SiteHeader";

export default function RootLayout() {
  const { pathname } = useLocation();
  const hideNavbar = pathname === "/login" || pathname === "/register";

  return (
    <>
      {!hideNavbar && <SiteHeader />}
      <Outlet />
    </>
  );
}
