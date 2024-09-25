// Definindo um tipo para a resposta da API
interface ExchangeRateApiResponse {
  conversion_rates: {
    BRL: number;
  };
}

// Função para obter a taxa de câmbio
/**
 * Função para buscar a taxa de câmbio de uma moeda para BRL.
 * @param currency - A moeda base a ser convertida (ex: USD, EUR).
 * @returns A taxa de câmbio de BRL ou null em caso de falha.
 */
export const getExchangeRate = async (currency: string): Promise<number | null> => {
  const API_KEY = process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY; // Obtendo a chave de API do .env.local
  const url = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${currency}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Erro ao buscar taxa de câmbio para ${currency}: ${response.statusText}`);
    }

    const data: ExchangeRateApiResponse = await response.json();

    if (data?.conversion_rates?.BRL) {
      return data.conversion_rates.BRL; // Retorna a taxa de câmbio BRL
    } else {
      throw new Error('Falha ao obter a taxa de câmbio da API');
    }
  } catch (error: any) {
    console.error('Erro ao buscar taxa de câmbio:', error.message || error);
    return null; // Retorna null em caso de erro
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
  const exchangeRate = await getExchangeRate(currency);

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
