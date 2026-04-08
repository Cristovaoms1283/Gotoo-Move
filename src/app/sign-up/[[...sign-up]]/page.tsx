import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

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
          <p className="text-white/40 text-[10px] italic uppercase tracking-[0.2em] mb-8">Treine em qualquer lugar</p>
          
          <div className="glass border-white/5 p-4 rounded-2xl mb-8 flex items-center justify-between gap-4 group/login transition-all hover:border-primary/30">
            <div className="text-left">
              <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1">Já possui uma conta?</p>
              <p className="text-white text-sm font-bold">Faça seu login agora</p>
            </div>
            <Link 
              href="/sign-in" 
              className="px-6 py-2.5 bg-primary text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,108,0,0.2)] hover:shadow-[0_0_30px_rgba(255,108,0,0.4)]"
            >
              Entrar
            </Link>
          </div>
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
