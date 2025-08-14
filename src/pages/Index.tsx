import LoginPage from "@/components/LoginPage";
import LoginScreen from "@/components/LoginScreen";

const Index = () => {
  const loginpage = true;
  return loginpage ? <LoginScreen /> : <LoginPage />;
};

export default Index;
