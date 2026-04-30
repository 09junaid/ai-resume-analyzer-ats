import { Outlet } from "react-router";
import SiteHeader from "./SiteHeader";

export default function RootLayout() {
  return (
    <>
      <SiteHeader />
      <Outlet />
    </>
  );
}
