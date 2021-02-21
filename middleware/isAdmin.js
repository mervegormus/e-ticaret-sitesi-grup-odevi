module.exports = (req, res, next) => {
  if(req.userData.profile_type !== "admin") {
    return res.status(409).json({
      message: "Bu işlemi yapabilmek için admin olmanız gerekiyor."
    });
  }
  next();
}