import { Router } from "express";
import { playerValidation } from "./validation/player.js";

const router = Router();

router.post("/stats", (req, res) => {

  
  playerValidation(req, res);
  const player = {
    name: req.body.name,
    tag: req.body.tag,
    region: req.body.region,
  };

  //get PUUID  ACCOUNT-V1
  // get Match history using PUUID
  //how can i get one year of match history?
  //use Match-V5 ,current time - one year = start time
  //end time is current time

  const endTime = Date.now() / 1000;
  const yearInMiliSec = 365 * 24 * 60 * 60 ;
  const startTime = (endTime - yearInMiliSec);  
  
  res.send("OK");
});


export default router;