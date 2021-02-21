const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    // ["Bearer", "askasşlgkagşkasgşsl"]
    //Bearer askasşlgkagşkasgşsl
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, "secret");
    req.userData = decoded;
    next();
  }catch(err) {
    console.log(err);
    return res.status(409).json({
      message: "Giriş Başarısız"
    })
  }
}