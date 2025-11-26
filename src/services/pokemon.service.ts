import { Pokemon, PokemonGeneration, GENERATION_RANGES } from '@/lib/types';
import { shuffleArray } from '@/lib/utils';

const POKEAPI_BASE = 'https://pokeapi.co/api/v2';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface CachedPokemon {
  data: Pokemon[];
  timestamp: number;
}

class PokemonService {
  private cache: Map<string, CachedPokemon> = new Map();

  /**
   * Get random Pokemon from a specific generation
   */
  async getRandomPokemon(generation: PokemonGeneration, count: number): Promise<Pokemon[]> {
    const range = GENERATION_RANGES[generation];
    const cacheKey = `gen-${generation}`;

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return this.selectRandomPokemon(cached.data, count);
    }

    try {
      // Fetch all Pokemon in the generation
      const allPokemon: Pokemon[] = [];

      // We'll fetch a batch to speed things up
      const promises: Promise<Pokemon | null>[] = [];

      for (let id = range.start; id <= range.end; id++) {
        promises.push(this.fetchPokemon(id));
      }

      const results = await Promise.all(promises);

      results.forEach(pokemon => {
        if (pokemon) {
          allPokemon.push(pokemon);
        }
      });

      // Cache the results
      this.cache.set(cacheKey, {
        data: allPokemon,
        timestamp: Date.now(),
      });

      return this.selectRandomPokemon(allPokemon, count);
    } catch (error) {
      console.error('Error fetching Pokemon:', error);
      throw new Error('Failed to fetch Pokemon data');
    }
  }

  /**
   * Fetch a single Pokemon by ID
   */
  private async fetchPokemon(id: number): Promise<Pokemon | null> {
    try {
      const response = await fetch(`${POKEAPI_BASE}/pokemon/${id}`);

      if (!response.ok) {
        console.warn(`Failed to fetch Pokemon ${id}`);
        return null;
      }

      const data = await response.json();

      return {
        id: data.id,
        name: data.name,
        spriteUrl: data.sprites.front_default || '',
      };
    } catch (error) {
      console.error(`Error fetching Pokemon ${id}:`, error);
      return null;
    }
  }

  /**
   * Select random Pokemon from an array
   */
  private selectRandomPokemon(pokemon: Pokemon[], count: number): Pokemon[] {
    const shuffled = shuffleArray(pokemon);
    return shuffled.slice(0, count);
  }

  /**
   * Clear cache (useful for development)
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export const pokemonService = new PokemonService();
