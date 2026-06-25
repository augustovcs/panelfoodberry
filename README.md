# Sabor & Arte — Cardápio Digital

Cardápio digital + checkout + painel do gestor, no estilo "Anota Aí" / DeZap. Mobile-first, pensado para o cliente pedir pelo celular e o gestor controlar a cozinha em tempo real.

## Stack

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** + **shadcn/ui**
- **Zustand** (estado)
- **lucide-react** (ícones)

## Funcionalidades

### Cliente
- Storefront com capa, status "Aberto", avaliação, tempo de entrega e busca
- Categorias com scroll-spy + carrossel de destaques
- Detalhe do item (adicionais, observação, quantidade) em bottom sheet
- Carrinho flutuante (mobile) e sidebar fixo (desktop)
- Checkout: entrega/retirada, endereço com validação, pagamento (PIX, cartão, dinheiro com troco)
- Acompanhamento de pedidos por telefone

### Gestor
- Dashboard com métricas do dia (fila, produção, faturamento, ticket médio…)
- Cozinha kanban: arraste os cartões ou use as setas para mudar de etapa; toque para ver detalhes e cancelar

Alterne entre cliente e gestor pelo botão no topo.

## Rodando localmente

```bash
npm install
npm run dev
```

Build de produção:

```bash
npm run build
npm run preview
```

## Deploy (Vercel)

Projeto Vite estático — importe o repositório na Vercel (preset **Vite**, build `npm run build`, output `dist`).
