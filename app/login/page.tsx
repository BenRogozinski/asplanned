import LoginPage from "@/components/LoginPage/LoginPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log In"
};

const Login: React.FC = () => {
  return (
    <LoginPage />
  )
};

export default Login;