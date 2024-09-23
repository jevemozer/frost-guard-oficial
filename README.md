# Frost Guard

Frost Guard é uma ferramenta centralizada para o controle de manutenções corretivas e preventivas de equipamentos de refrigeração em carretas câmaras frias. O foco está na eficiência operacional e financeira, garantindo que todo o processo de manutenção seja acompanhado, desde o diagnóstico até o pagamento.

## Funcionalidades Principais

- **Autenticação de Usuários**: Login e cadastro de usuários, utilizando Supabase.
- **Dashboard**: Exibe dados essenciais como manutenções totais, custos e estatísticas relacionadas aos equipamentos.
- **Cadastro de Manutenções**: Registro detalhado de novas manutenções com acompanhamento do status até a finalização.
- **Financeiro**: Gestão de pagamentos das manutenções concluídas, com rastreamento de notas fiscais e status de pagamento.
- **Cadastros**: Registre equipamentos, motoristas, cidades, oficinas, grupos de problemas, entre outros.

## Tecnologias Utilizadas

- [Next.js 13+](https://nextjs.org)
- [TypeScript](https://www.typescriptlang.org/)
- [React](https://reactjs.org/)
- [Shadcn-ui](https://ui.shadcn.dev/)
- [Supabase](https://supabase.com/)
- [Lucide Icons](https://lucide.dev/)
- [Tailwind CSS](https://tailwindcss.com/)


## Requisitos

- Node.js 18.x ou superior
- npm, yarn, pnpm ou bun


## Primeiros Passos

1. Clone o repositório:

```
git clone https://github.com/seu-usuario/frost-guard.git
```

2. Navegue até o diretório do projeto:

```
cd frost-guard
```

3. Instale as dependências:

```
npm install
# ou
yarn install
# ou
pnpm install
# ou
bun install
```

4. Configure as variáveis de ambiente. Crie um arquivo .local.env com as seguintes variáveis (exemplo):

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Execute o servidor de desenvolvimento

```
npm run dev
# ou
yarn dev
# ou
pnpm dev
# ou
bun dev
```

6. Abra http://localhost:3000 no seu navegador para visualizar a aplicação.

Você pode começar a editar a página modificando app/page.tsx. A página será atualizada automaticamente conforme você fizer mudanças.

