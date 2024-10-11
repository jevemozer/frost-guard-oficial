// src/app/financeiro/page.tsx
'use client';

import { ProtectedRoute } from '@/lib/protectedRoute';
import AcompanhamentoPagamento from '@/components/finance/AcompanhamentoPagamento';

export default function Financeiro() {
  return (
    <ProtectedRoute>
      <div className="p-4 pt-8">
        <AcompanhamentoPagamento />
      </div>
    </ProtectedRoute>
  );
}
