import zod from "zod";

export function playerValidation(req, res) {
    const schema = zod.object({
    name: zod.string().min(3).max(16),
    tag: zod.string().min(3).max(5),
    region: zod.enum([
      "EUW",
      "NA",
      "EUNE",
      "KR",
      "CN",
      "BR",
      "LAN",
      "LAS",
      "OCE",
      "TR",
      "JP",
      "SEA",
    ]),
  });

  try {
    schema.parse(req.body);
  } catch (error) {
    console.log("Validation Error: " + error.message);
    res.status(400).send({ errors: error.issues });
    return;
  }
}



