import { RouterProvider } from "react-router";
import { router } from "./routes/app.routes.jsx";
import { AuthProvider } from "./features/auth/context/auth.context.jsx";
import {
  InterviewContext,
  InterviewProvider,
} from "./features/interview/context/interview.context.jsx";
function App() {
  return (
    <AuthProvider>
      <InterviewProvider>
        <RouterProvider router={router} />
      </InterviewProvider>
    </AuthProvider>
  );
}

export default App;
