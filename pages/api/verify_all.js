import axios from "axios";
import jwt from "jsonwebtoken";
export default async function verify(req, res) {
  const secret = process.env.SECRET;
  const tested = req.body.tokens.map((tok) => jwt.verify(tok, secret));
  console.log(tested);
  if (
    new Set(tested.map(({ email }) => email)).size === 1 &&
    tested.length >= process.env.CAPTCHA
  ) {
    console.log(process.env.PROD);
    if (process.env.PROD === "true") {
      const { data } = await axios.post(
        `https://sth5-dispenser.saltyaom.com/dispenser/captcha-challenge`,
        {
          email: tested[0].email,
          key: "<  NO U  >",
          production: true,
        }
      );
      console.log(data);
      res.status(200).json({ res: data.ticket });
    } else {
      res.status(200).json({ res: "DUMMY-TICKET" });
    }
  } else {
    res.status(403).json({ res: "Failed" });
  }
}
