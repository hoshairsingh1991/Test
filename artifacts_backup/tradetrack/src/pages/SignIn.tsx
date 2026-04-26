import { SignIn } from "@clerk/react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
      <div className="relative z-10 w-full max-w-[440px]">
        <SignIn 
          routing="path" 
          path={`${basePath}/sign-in`} 
          signUpUrl={`${basePath}/sign-up`}
          forceRedirectUrl={`${basePath}/dashboard`}
        />
      </div>
    </div>
  );
}
