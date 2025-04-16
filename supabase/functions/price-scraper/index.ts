import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import { load } from 'npm:cheerio@1.0.0-rc.12';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Cache en mémoire pour stocker les résultats
const priceCache = new Map();
const CACHE_DURATION = 1000 * 60 * 60; // 1 heure

interface PriceResult {
  tissu: string;
  prix_moyen: number;
  fournisseur: string;
  timestamp?: number;
}

async function scrapeMondialTissus(searchTerm: string): Promise<PriceResult> {
  try {
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
    const url = `https://www.mondialtissus.fr/recherche?q=${encodeURIComponent(searchTerm)}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = load(html);
    
    // Sélecteur CSS pour les prix (à adapter selon la structure du site)
    const prices: number[] = [];
    $('.product-price').each((_, element) => {
      const priceText = $(element).text().trim();
      const price = parseFloat(priceText.replace('€', '').replace(',', '.').trim());
      if (!isNaN(price)) {
        prices.push(price);
      }
    });

    if (prices.length === 0) {
      throw new Error('Aucun prix trouvé');
    }

    const averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length;

    return {
      tissu: searchTerm,
      prix_moyen: Number(averagePrice.toFixed(2)),
      fournisseur: 'Mondial Tissus',
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('Erreur lors du scraping:', error);
    throw error;
  }
}

Deno.serve(async (req) => {
  // Gérer les requêtes OPTIONS pour CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    const url = new URL(req.url);
    const tissu = url.searchParams.get('tissu');

    if (!tissu) {
      return new Response(
        JSON.stringify({ error: 'Le paramètre "tissu" est requis' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }

    // Vérifier le cache
    const cachedResult = priceCache.get(tissu);
    if (cachedResult && (Date.now() - cachedResult.timestamp) < CACHE_DURATION) {
      return new Response(
        JSON.stringify(cachedResult),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }

    // Effectuer le scraping
    const result = await scrapeMondialTissus(tissu);
    
    // Mettre en cache
    priceCache.set(tissu, result);

    return new Response(
      JSON.stringify(result),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Erreur lors de la récupération du prix',
        message: error.message
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
});