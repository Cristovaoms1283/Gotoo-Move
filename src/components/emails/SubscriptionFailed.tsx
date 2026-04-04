import * as React from 'react';

interface SubscriptionFailedEmailProps {
    userName: string;
    planName: string;
}

export const SubscriptionFailedEmail: React.FC<Readonly<SubscriptionFailedEmailProps>> = ({
    userName,
    planName,
}) => (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', color: '#333' }}>
        <h1 style={{ color: '#EF4444' }}>Problema na cobrança da assinatura 💳</h1>
        <p>Olá, <strong>{userName}</strong>,</p>
        <p>Não conseguimos processar o pagamento recorrente do seu plano <strong>{planName}</strong> no Fit Connect.</p>

        <div style={{ backgroundColor: '#FFF7ED', padding: '15px', borderRadius: '10px', marginTop: '20px', border: '1px solid #FFEDD5' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#9A3412' }}>O que isso significa?</h3>
            <p style={{ margin: '5px 0' }}>Seu status no sistema foi alterado para <strong>Atrasado (Past Due)</strong>.</p>
            <p style={{ margin: '5px 0' }}>Você ainda tem acesso temporário, mas o Stripe tentará realizar a cobrança novamente em breve.</p>
            <p style={{ margin: '5px 0' }}>Caso a cobrança falhe várias vezes, seu acesso Premium será revogado.</p>
        </div>

        <p style={{ marginTop: '20px' }}>
            <strong>Como resolver?</strong><br />
            Verifique os dados do seu cartão no portal do cliente ou adicione um novo método de pagamento.
        </p>

        <a 
            href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`}
            style={{ 
                display: 'inline-block', 
                backgroundColor: '#0F172A', 
                color: '#fff', 
                padding: '12px 24px', 
                borderRadius: '8px', 
                textDecoration: 'none',
                marginTop: '15px'
            }}
        >
            Atualizar Pagamento
        </a>

        <hr style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: '30px 0' }} />
        <p style={{ fontSize: '12px', color: '#64748B' }}>
            Fit Connect - Sua evolução começa aqui.
        </p>
    </div>
);
