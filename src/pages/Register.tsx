
import AuthForm from "@/components/auth/AuthForm";

const Register = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-messaging-bg p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-messaging-primary mb-2">MessageMe</h1>
          <p className="text-gray-600">Create an account to get started.</p>
        </div>
        <AuthForm isLogin={false} />
      </div>
    </div>
  );
};

export default Register;
