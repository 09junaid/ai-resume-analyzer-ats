import { createBrowserRouter } from "react-router";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import Protected from "../features/auth/components/Protected";
import GuestOnly from "../features/auth/components/GuestOnly";
import Home from "../features/interview/pages/Home";
import Interview from "../features/interview/pages/Interview";
import Landing from "../features/interview/pages/Landing";
import RootLayout from "../layout/RootLayout";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Landing />,
      },
      {
        path: "login",
        element: (
          <GuestOnly>
            <Login />
          </GuestOnly>
        ),
      },
      {
        path: "register",
        element: (
          <GuestOnly>
            <Register />
          </GuestOnly>
        ),
      },
      {
        path: "workspace",
        element: (
          <Protected>
            <Home />
          </Protected>
        ),
      },
      {
        path: "interview/:interviewId/*",
        element: (
          <Protected>
            <Interview />
          </Protected>
        ),
      },
    ],
  },
]);
