
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
      navigate("/messages");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-messaging-bg p-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl font-bold text-messaging-primary mb-4">MessageMe</h1>
        <p className="text-xl text-gray-700 mb-8">
          A simple, secure messaging platform for connecting with friends and colleagues.
        </p>
        <div className="flex gap-4 justify-center">
          <Button 
            onClick={() => navigate("/login")}
            className="bg-messaging-primary hover:bg-messaging-primary/90"
            size="lg"
          >
            Login
          </Button>
          <Button 
            onClick={() => navigate("/register")}
            variant="outline"
            size="lg"
          >
            Create Account
          </Button>
        </div>
      </div>
      <div className="mt-16 bg-white p-8 rounded-lg shadow-lg max-w-4xl w-full">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-bold mb-4 text-messaging-dark">
              Start communicating effortlessly
            </h2>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="h-6 w-6 rounded-full bg-messaging-primary mr-2 flex items-center justify-center text-white">
                  ✓
                </div>
                <span>Real-time messaging with instant delivery</span>
              </li>
              <li className="flex items-start">
                <div className="h-6 w-6 rounded-full bg-messaging-primary mr-2 flex items-center justify-center text-white">
                  ✓
                </div>
                <span>Secure authentication to protect your conversations</span>
              </li>
              <li className="flex items-start">
                <div className="h-6 w-6 rounded-full bg-messaging-primary mr-2 flex items-center justify-center text-white">
                  ✓
                </div>
                <span>Simple, intuitive interface that's easy to use</span>
              </li>
            </ul>
          </div>
          <div className="bg-messaging-bg p-4 rounded-lg">
            <div className="border border-gray-200 rounded-lg shadow-sm bg-white overflow-hidden">
              <div className="border-b border-gray-200 p-3 bg-messaging-primary/10">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-messaging-primary/80 flex items-center justify-center text-white font-medium">
                    A
                  </div>
                  <span className="font-medium">Alex Johnson</span>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="max-w-[75%] bg-gray-100 p-2 rounded-lg">
                  <p className="text-sm">Hey there! Have you tried MessageMe?</p>
                </div>
                <div className="max-w-[75%] bg-messaging-primary p-2 rounded-lg text-white ml-auto">
                  <p className="text-sm">Yes, I'm using it right now! It's great!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
