import axios from "axios";
import { LogError } from "../utils/loggers.js";
// cSpell:disable
function getRiotClient(region) {
  return axios.create({
    baseURL: `https://${region}.api.riotgames.com`,
    headers: {
      "X-Riot-Token": process.env.RIOT_API_KEY,
    },
    timeout: 10000,
  });
}
export function regionMap(region) {
    const map = {
      EUW: "europe",
      EUNE: "europe",
      TR: "europe",
      BR: "americas",
      NA: "americas",
      LAN: "americas",
      LAS: "americas",
      KR: "asia",
      CN: "asia",
      OCE: "asia",
      SEA: "asia",
      JP: "asia",
    };
    return map[region] || "europe";
}
export async function getPUUIDByRiotID(player) {
    
  const client = getRiotClient(player.region);

  try {
    const res = await client.get(
      `/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(
        player.name
      )}/${encodeURIComponent(player.tag)}`
    );
    if (res.data) {
      return res.data.puuid;
    }
  } catch (error) {
    LogError("Error getting PUUID:" + error.message);
    LogError("Request status Account API: " + error.status);
    LogError("Axios Error " + error.response);

    if(error.status == 404) {
        LogError("Account Not Found");
    }

    if(error.status == 401) {
        LogError("Unauthorized — Riot API key invalid or rate limited");
    }
    // throw new Error(`Riot API returned status ${status}: ${JSON.stringify(data)}`)
  }
}


export function getMatchByPUUID(puuid,region) {
    const client = getRiotClient(region);
    try {
        const res = client.get(`/lol/match/v5/matches/by-puuid/${encodeURIComponent(puuid)}/ids`,{
            
        });
        if(res.data) {
            return res.data
        }
    } catch (error) {
       LogError("Error on getting match id: " + error.message); 
       LogError("Error status: " + error.status); 
    }

}