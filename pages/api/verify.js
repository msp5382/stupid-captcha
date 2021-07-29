import axios from "axios";
import jwt from "jsonwebtoken";
export default async function verify(req, res) {
  const secret = process.env.SECRET;

  const { data } = await axios.get(
    `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${req.query.token}`
  );
  if (data.success) {
    console.log("data", req.query.email);

    res.status(200).json({
      token: jwt.sign(
        {
          email: req.query.email,
        },
        secret
      ),
      status: "OK",
    });
  } else {
    res.status(403);
  }
}
