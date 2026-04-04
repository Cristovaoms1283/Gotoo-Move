---
description: Iniciar os servidores locais do projeto FitConnect
---

# Iniciar Servidores Locais — FitConnect

Este workflow deve ser executado **sempre que uma nova conversa sobre o FitConnect for iniciada**, garantindo que o ambiente de desenvolvimento esteja ativo.

## Projeto

- **Caminho**: `c:\Users\CRISTOVÃO\Documents\Antigravity\Projetos\fit-connect`
- **Framework**: Next.js 16 (Turbopack)
- **Banco de dados**: PostgreSQL via Supabase + Prisma ORM
- **Autenticação**: Clerk
- **Pagamentos**: Stripe (webhooks locais via Stripe CLI)

## Passos

### 1. Verificar se o servidor já está rodando

Antes de iniciar, verifique se o `localhost:3000` já está ativo. Se estiver, pule para o passo 3.

### 2. Iniciar o servidor de desenvolvimento Next.js

// turbo
```powershell
npm run dev
```
> Executar em: `c:\Users\CRISTOVÃO\Documents\Antigravity\Projetos\fit-connect`
> Aguardar a mensagem `✓ Ready` antes de continuar.
> O servidor ficará disponível em: http://localhost:3000

### 3. (Opcional) Iniciar o Stripe CLI para webhooks locais

Necessário apenas se for testar **pagamentos ou assinaturas Stripe**.

```powershell
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

> Isso encaminha eventos do Stripe para o endpoint local de webhook.
> O segredo do webhook será exibido no terminal — confirme que está no `.env` como `STRIPE_WEBHOOK_SECRET`.

## Verificação

Após iniciar, confirme:
- [ ] `http://localhost:3000` carrega a página inicial
- [ ] Login com Clerk está funcionando
- [ ] Dashboard do aluno e do admin estão acessíveis

## Observações

- O banco de dados (Supabase) é remoto — não precisa iniciar localmente.
- As variáveis de ambiente estão em `.env` na raiz do projeto.
- Em caso de erro de execução do PowerShell, rodar: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`
