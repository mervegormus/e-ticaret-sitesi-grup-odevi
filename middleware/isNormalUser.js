module.exports = (req, res, next) => {
  if(req.userData.profile_type !== "normal") {
    return res.status(409).json({
      message: "Bu işlemi yapabilmek için normal kullanıcı olmanız gerekiyor."
    });
  }
  next();
}