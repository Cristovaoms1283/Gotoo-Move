import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black/95 p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full -z-10" />
      
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black italic tracking-tighter mb-2">
            FIT<span className="text-primary italic">CONNECT</span>
          </h1>
          <p className="text-white/40 text-sm italic uppercase tracking-widest">Treine em qualquer lugar</p>
        </div>

        <SignUp 
          appearance={{
            elements: {
              formButtonPrimary: "btn-premium btn-primary w-full",
              card: "glass border-white/10 shadow-2xl",
              headerTitle: "text-white font-bold",
              headerSubtitle: "text-white/60",
              socialButtonsBlockButton: "glass border-white/10 hover:bg-white/5 text-white text-sm",
              socialButtonsBlockButtonText: "text-white font-medium",
              dividerLine: "bg-white/10",
              dividerText: "text-white/40",
              formFieldLabel: "text-white/60",
              formFieldInput: "glass border-white/10 text-white focus:border-primary",
              footerActionLink: "text-primary hover:text-primary/80",
              identityPreviewText: "text-white",
              identityPreviewEditButtonIcon: "text-primary",
            }
          }}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          forceRedirectUrl="/dashboard"
        />
      </div>
    </div>
  );
}
