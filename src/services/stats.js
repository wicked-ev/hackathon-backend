import {
  getMatchsByPUUID,
  getPUUIDByRiotID,
  getMatchTimeStamp,
} from "./player.js";
import fs from "fs";

//remove when done
const storagePath = ["C:/Users/AURES/Documents/storage.json", "C:/Users/admin/Documents/storage.json"];

function getStats(player) {
  const puuid = getPUUIDByRiotID(player);
  if(fetchLastYearMatchIds(puuid, player.region)) {
    const storageObj = JSON.parse(fs.readFileSync(storagePath[1], "utf-8"));
    const matchesIDs = storageObj.yearMatchIDs
    //maybe use MONGO DB for this
    //way to check if we already fetched for this player (json file each as temp sol)
    //go throught each match data
    //save in json
    // caluclate analytics
  }
}

export async function fetchLastYearMatchIds(puuid, region) {
  let endTime = Math.floor(Date.now() / 1000);
  const yearInSec = 365 * 24 * 60 * 60;
  const startTime = endTime - yearInSec;
  const requestCount = 5;

  const storageObj = JSON.parse(fs.readFileSync(storagePath[1], "utf-8"));

  while (endTime > startTime) {
    try { 
      const params = {
        endTime: Math.floor(endTime),
        startTime: Math.floor(startTime),
        count: 100,
      };

      const matchIDs = await getMatchsByPUUID(puuid, region, params);

      if (!matchIDs || matchIDs.length === 0) break;
      console.log(
        `Fetched ${matchIDs.length} matches, total: ${storageObj.yearMatchIDs.length}`
      );
      //save matchIds
      storageObj.yearMatchIDs.push(...matchIDs);
      endTime = await getMatchTimeStamp(matchIDs[matchIDs.length - 1],region) - 1;
      fs.writeFileSync(storagePath[1], JSON.stringify(storageObj, null, 2));
      await new Promise((res) => setTimeout(res, 1000));
    } catch (error) {
      console.error("Error fetching matches:", error.message);
      await new Promise((res) => setTimeout(res, 5000));
      requestCount-=1;
      if(requestCount == 0 ) {
        return true;
      }
    }
  }
  return true;
}
