import { Router } from "express";
import { playerValidation } from "./validation/player.js";
import { getPUUIDByRiotID, regionMap } from "./services/player.js";
import { fetchLastYearMatchIds } from "./services/stats.js";

const router = Router();

router.post("/stats", async (req, res) => {

  playerValidation(req, res);
  const region = regionMap(req.body.region);
  const player = {
    name: req.body.name,
    tag: req.body.tag,
    region: region,
  };

  const puuid = await getPUUIDByRiotID(player);
  console.log("puui: " + puuid);
  
  fetchLastYearMatchIds(puuid,player.region);
  console.log("done");

  res.send("OK");
});


export default router;