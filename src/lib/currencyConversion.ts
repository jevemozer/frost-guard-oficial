// Definindo um tipo para a resposta da API
interface ExchangeRateApiResponse {
  conversion_rates: {
    [key: string]: number;
  };
}

// Cache para taxas de câmbio
let exchangeRatesCache: Record<string, number> = {};

// Taxas de câmbio padrão como fallback
const defaultExchangeRates: Record<string, number> = {
  BRL: 1.00000, // Brasil
  UYU: 0.13000, // Uruguai
  PEN: 1.48000, // Peru
  ARS: 0.01400, // Argentina
  CLP: 0.00540, // Chile
  PYG: 0.00069, // Paraguai
};

// Função para carregar todas as taxas de câmbio de uma vez
/**
 * Carrega e armazena todas as taxas de câmbio para BRL no cache.
 * Se a API falhar, usa as taxas padrão.
 * @param currency - A moeda base a ser convertida (ex: USD, EUR).
 * @returns A taxa de câmbio de BRL ou null em caso de falha.
 */
export const loadExchangeRates = async (currency: string): Promise<number | null> => {
  const API_KEY = process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY; // Obtendo a chave de API do .env.local
  const url = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${currency}`;

  // Verifica se a taxa já está no cache
  if (exchangeRatesCache[currency]) {
    return exchangeRatesCache[currency];
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Erro ao buscar taxa de câmbio para ${currency}: ${response.statusText}`);
    }

    const data: ExchangeRateApiResponse = await response.json();

    // Cacheando todas as taxas de câmbio
    if (data?.conversion_rates?.BRL) {
      exchangeRatesCache = { ...exchangeRatesCache, ...data.conversion_rates };
      return data.conversion_rates.BRL;
    } else {
      throw new Error('Falha ao obter a taxa de câmbio da API');
    }
  } catch (error: any) {
    console.error('Erro ao buscar taxa de câmbio:', error.message || error);
    // Fallback para taxa padrão
    return defaultExchangeRates[currency] || null;
  }
};

// Função para converter valores para BRL
/**
 * Converte um valor de uma moeda fornecida para BRL com base na taxa de câmbio atual.
 * @param amount - O valor a ser convertido.
 * @param currency - A moeda do valor fornecido.
 * @returns Um objeto com o valor original, valor convertido e a taxa de câmbio ou null em caso de erro.
 */
export const convertToBRL = async (
  amount: number, 
  currency: string
): Promise<{ originalAmount: number; convertedAmount: number; exchangeRate: number } | null> => {
  const exchangeRate = await loadExchangeRates(currency);

  if (!exchangeRate) {
    console.warn(`Não foi possível converter ${amount} ${currency} para BRL. Mantendo o valor original.`);
    return {
      originalAmount: amount,
      convertedAmount: amount, // Mantém o valor original na conversão
      exchangeRate: 1 // Retorna 1 como taxa de câmbio se não foi possível converter
    };
  }

  // Converte o valor para BRL com base na taxa de câmbio
  const convertedAmount = amount * exchangeRate;

  return {
    originalAmount: amount,
    convertedAmount,
    exchangeRate
  };
};
