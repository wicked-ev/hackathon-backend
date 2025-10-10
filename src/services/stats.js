import path from "path"
import {
  getMatchsByPUUID,
  getPUUIDByRiotID,
  getMatchTimeStamp,
  getMatchData
} from "./player.js";
import { JSONFile } from 'lowdb/node';

import fs from "fs";
import { Low } from "lowdb";
import { match } from "assert";

//remove when done
const storagePath = ["C:/Users/AURES/Documents/Hackthon-Storage/storage.json", "C:/Users/admin/Documents/storage.json"];

const dbFile = path.resolve(storagePath[0])

const adapter = new JSONFile(dbFile);

const db = new Low(adapter, {players: {}});

await db.read();


async function getStats(player) {
  const puuid = getPUUIDByRiotID(player);
  if(fetchLastYearMatchIds(puuid, player.region)) {
    const storageObj = JSON.parse(fs.readFileSync(storagePath[0], "utf-8"));
    
    const matchesIDs = storageObj[puuid].yearMatchIDs;

    
    
    if(!storageObj[puuid].mathData) {
      console.log("match data already saved");
      return true;
    }
    


    for(let i of matchesIDs) {
      const matchData = await getMatchData(i,player.region);
      storageObj[puuid].matchData = matchData;
    }
    
    //maybe use MONGO DB for this
    //way to check if we already fetched for this player (json file each as temp sol)
    //go throught each match data
    //save in json
    // caluclate analytics -> what do mean by analytics we need to defi
    //players stats
    //longest/shortest games
    //number of games played in the least year
    //number of games played for each game mode
    
  }
}

export async function fetchLastYearMatchIds(puuid, region) {
  let requestCount = 5;
  let endTime = Math.floor(Date.now() / 1000);
  const yearInSec = 365 * 24 * 60 * 60;
  const startTime = endTime - yearInSec;
  
  db.data.players[puuid] ??= { region, yearMatchIDs: [],matchData: []}

  const savedMatchIds = new Set(db.data.players[puuid].yearMatchIDs);
  

  // const storageObj = JSON.parse(fs.readFileSync(storagePath[0], "utf-8"));
  // if (storageObj[puuid]) {
  //   console.log("the player matchids already saved");
  //   return true; 
  // }
  
  // storageObj[puuid] = { yearMatchIDs: [] };
  
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
      console.log(
        `Fetched ${matchIDs.length} matches, total: ${storageObj.yearMatchIDs.length}`
      );
      //save matchIds
      
      const newMatches = matchIDs.filter((id) => !savedMatchIds.has(id));
      if (newMatches.length == 0) break;

      // storageObj[puuid].yearMatchIDs.push(...matchIDs);
      // fs.writeFileSync(storagePath[0], JSON.stringify(storageObj, null, 2));
      newMatches.forEach(id => {
        savedMatchIds.add(id);
      });

      db.data.players[puuid].yearMatchIDs = Array.from(savedMatchIds);
      await db.write();

      oldestMatchTime = await getMatchTimeStamp(matchIDs[matchIDs.length - 1],region);
      endTime = (oldestMatchTime /1000) - 1;

      await new Promise((res) => setTimeout(res, 1000));
    } catch (error) {
      console.error("Error fetching matches:", error.message);
      requestCount--;

      if(requestCount <= 0 ) {
        console.error("Max retries reached, aborting.");
        return false;
      }
      console.log(`Retrying... (${remainingRetries} retries left)`);
      await new Promise((res) => setTimeout(res, 5000));
    }
  }
  return true;
}
