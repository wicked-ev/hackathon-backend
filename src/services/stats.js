import {
  getMatchsByPUUID,
  getPUUIDByRiotID,
  getMatchTimeStamp,
} from "./player.js";
import fs from "fs";

function getStats(player) {
  const puuid = getPUUIDByRiotID(player);
}

export async function fetchLastYearMatchIds(puuid, region) {
  let endTime = Date.now() / 1000;
  const yearInMiliSec = 365 * 24 * 60 * 60;
  const startTime = endTime - yearInMiliSec;
  const requestCount = 5;

  const storagePath = "C:/Users/AURES/Documents/storage.json";
  const storageObj = JSON.parse(fs.readFileSync(storagePath, "utf-8"));

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
      console.log("here?");
      fs.writeFileSync(storagePath, JSON.stringify(storageObj, null, 2));
      console.log("storage ready?");
      endTime = await getMatchTimeStamp(matchIDs[0],region);
      console.log("new endTime: " + endTime);
      console.log("new startTime: " + startTime);
      await new Promise((res) => setTimeout(res, 1000));
    } catch (error) {
      console.error("Error fetching matches:", error.message);
      await new Promise((res) => setTimeout(res, 5000));
      requestCount-=1;
      if(requestCount == 0 ) break;
    }
  }
}
