//cSpell: disable
import path from "path"
import {
  getMatchsByPUUID,
  getPUUIDByRiotID,
  getMatchTimeStamp,
  getMatchData
} from "./player.js";
import { JSONFile } from 'lowdb/node';

import { Low } from "lowdb";

//remove when we have real storage system

const storagePath = ["C:/Users/AURES/Documents/Hackthon-Storage/storage.json", "C:/Users/admin/Documents/storage.json"];

const dbFile = path.resolve(storagePath[0])

const adapter = new JSONFile(dbFile);

const db = new Low(adapter, {players: {}});

await db.read();

async function getStats(player) {
  const puuid = getPUUIDByRiotID(player);
  if(fetchLastYearMatchIds(puuid, player.region)) {
    
    const savedMatchesIDs = db.data.players[puuid].yearMatchIDs;  
    const gameStats =  {}
    for(let i of savedMatchesIDs) {
      const matchData = await getMatchData(i,player.region);
      db.data.player[puuid].gameStats = matchData.info
      await db.write();
    }
    //i don't feel like i have idea or direction 
    //way to check if we already fetched for this player (json file each as temp sol)
    //go throught each match data
    //save in json
    // caluclate analytics -> what do mean by analytics we need to defi
    //players stats
  }
}

export async function fetchLastYearMatchIds(puuid, region) {
  let requestCount = 5;
  let endTime = Math.floor(Date.now() / 1000);
  const yearInSec = 365 * 24 * 60 * 60;
  const startTime = endTime - yearInSec;
  
  db.data ||= {};             // if db.data doesn’t exist, create it
  db.data.players ||= {};     // if db.data.players doesn’t exist, create it
  db.data.players[puuid] ??= { region, yearMatchIDs: [],gameStats: []}

  const savedMatchIds = new Set(db.data.players[puuid].yearMatchIDs);
  
  while (endTime > startTime) {
    try { 
      const params = {
        endTime: Math.floor(endTime),
        startTime: Math.floor(startTime),
        count: 100,
      };
      
      const matchIDs = await getMatchsByPUUID(puuid, region, params);

      if (!matchIDs || matchIDs.length === 0) {
        console.log("no more matches found");
        return true;
      };

      
      const newMatches = matchIDs.filter((id) => !savedMatchIds.has(id));
      if (newMatches.length == 0) break;


      newMatches.forEach(id => {
        savedMatchIds.add(id);
      });

      db.data.players[puuid].yearMatchIDs = Array.from(savedMatchIds);
      await db.write();

      const oldestMatchTime = await getMatchTimeStamp(matchIDs[matchIDs.length - 1],region);
      endTime = (oldestMatchTime /1000) - 1;

      await new Promise((res) => setTimeout(res, 1000));
    } catch (error) {
      console.error("Error fetching matches:", error.message);
      requestCount--;

      if(requestCount <= 0 ) {
        console.error("Max retries reached, aborting.");
        return false;
      }
      console.log(`Retrying... (${requestCount} retries left)`);
      await new Promise((res) => setTimeout(res, 5000));
    }
  }
  return true;
}
