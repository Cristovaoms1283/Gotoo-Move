import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full -z-10" />
      
      <div className="w-full max-w-md z-10 flex flex-col items-center">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black italic tracking-tighter mb-2 text-white">
            FIT<span className="text-primary italic">CONNECT</span>
          </h1>
          <p className="text-zinc-400 text-sm italic uppercase tracking-widest">Treine em qualquer lugar</p>
        </div>

        <SignIn 
          appearance={{
            baseTheme: dark,
            elements: {
              card: "border border-zinc-800 shadow-2xl bg-zinc-900/50 backdrop-blur-md",
              formButtonPrimary: "bg-primary text-black font-bold hover:bg-primary/90",
            }
          }}
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/escolha-treino"
        />
      </div>
    </div>
  );
}
