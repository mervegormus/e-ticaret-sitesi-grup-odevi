module.exports = (req, res, next) => {
  if(req.userData.profile_type !== "magaza") {
    return res.status(409).json({
      message: "Bu işlemi yapabilmek için mağaza kullanıcısı olmanız gerekiyor."
    });
  }
  next();
}