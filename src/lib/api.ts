import { supabase } from './supabase';

export async function fetchFabricPrice(fabricName: string): Promise<{
  tissu: string;
  prix_moyen: number;
  fournisseur: string;
}> {
  try {
    const { data, error } = await supabase.functions.invoke('price-scraper', {
      query: { tissu: fabricName }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching fabric price:', error);
    throw error;
  }
}