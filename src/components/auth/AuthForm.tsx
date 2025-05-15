
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface AuthFormProps {
  isLogin?: boolean;
}

const AuthForm = ({ isLogin = true }: AuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // In a real app, this would connect to an authentication API
    setTimeout(() => {
      setIsLoading(false);
      
      if (isLogin) {
        // Simulating login
        if (email && password) {
          localStorage.setItem("currentUser", JSON.stringify({ 
            id: Math.random().toString(36).substring(2),
            name: email.split("@")[0], 
            email 
          }));
          toast.success("Successfully logged in!");
          navigate("/messages");
        } else {
          toast.error("Invalid credentials");
        }
      } else {
        // Simulating registration
        if (name && email && password) {
          localStorage.setItem("currentUser", JSON.stringify({ 
            id: Math.random().toString(36).substring(2),
            name, 
            email 
          }));
          toast.success("Account created successfully!");
          navigate("/messages");
        } else {
          toast.error("Please fill all fields");
        }
      }
    }, 1000);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{isLogin ? "Login" : "Create Account"}</CardTitle>
        <CardDescription>
          {isLogin 
            ? "Enter your credentials to access your account" 
            : "Fill in the information to create your account"}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <Input
                id="name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button 
            type="submit" 
            className="w-full bg-messaging-primary hover:bg-messaging-primary/90"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : isLogin ? "Login" : "Create Account"}
          </Button>
          <div className="text-sm text-center">
            {isLogin ? (
              <p>
                Don't have an account?{" "}
                <a href="/register" className="text-messaging-primary hover:underline">
                  Sign up
                </a>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <a href="/login" className="text-messaging-primary hover:underline">
                  Login
                </a>
              </p>
            )}
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AuthForm;
