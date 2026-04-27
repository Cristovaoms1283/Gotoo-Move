"use client";

import { useState } from "react";
import { CreditCard, Rocket } from "lucide-react";
import { createOneOffCheckoutSession } from "@/app/actions/stripe";

export default function BuyOneOffButton({ goal }: { goal: string }) {
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    try {
      setLoading(true);
      await createOneOffCheckoutSession(goal);
    } catch (error) {
      console.error("Erro ao iniciar checkout avulso:", error);
      alert("Ocorreu um erro ao processar seu pagamento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleBuy}
      disabled={loading}
      className="btn-premium bg-white text-black hover:bg-primary hover:text-black w-full mt-4 flex items-center justify-center gap-2 shimmer"
    >
      {loading ? (
        "Processando..."
      ) : (
        <>
          <CreditCard className="h-4 w-4" />
          Acesso Avulso (R$ 5,00)
          <Rocket className="h-4 w-4 text-primary" />
        </>
      )}
    </button>
  );
}
