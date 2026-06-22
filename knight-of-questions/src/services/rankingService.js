import { getRanking } from './api.js';

export async function getDadosRanking(token) {
    const ranking = await getRanking(token);

    return ranking;
}