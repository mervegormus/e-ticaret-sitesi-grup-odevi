const mongoose = require("mongoose");

exports.get_profile = (req, res, next) => {
  const profile_id = req.userData.profile_id;

  mongoose
    .model("Profile")
    .findOne({ _id: profile_id })
    .select("-__v -user_id -store_name -urunler")
    .populate("user_id", "-__v, -password -profile_id")
    .populate("followers", "-__v -user_id")
    .populate("followed", "-__v -user_id")
    .populate("engellenen_kullanicilar", "-__v -user_id")
    .exec()
    .then(profile => {
      if (profile) {
        return res.status(200).json({ ...profile, profile_type: req.userData.profile_type });
      } else {
        return res.status(404).json({
          err: "Profil bulunamadı."
        });
      }
    })
    .catch(err => {
      console.log(err);
      return res.status(500).json({
        err
      });
    });
};

// http://localhost:3003/api/profile/get-profile
// http://localhost:3003/api/profile/asd12938124129asd
// req.params.profile_id = asd12938124129asd

exports.get_profile_by_id = (req, res, next) => {
  mongoose
    .model("Profile")
    .findOne({ _id: req.params.profile_id })
    .select("-__v -user_id -urunler -store_name -urunler")
    .populate("user_id", "-__v, -password -profile_id")
    .populate("followers", "-__v -user_id")
    .populate("followed", "-__v -user_id")
    .populate("profile_type", "-user_id -profile_id")
    .populate("engellenen_kullanicilar", "-__v -user_id")
    .exec()
    .then(profile => {
      if (profile) {
        if (profile.isHidden) {
          return res.status(200).json({
            name: profile.name,
            surname: profile.surname,
            ilanlar: profile.ilanlar,
            followers: profile.followers,
            followed: profile.followed,
            email: profile.email,
            profile_type: profile.profile_type.yetki
          });
        } else {
          return res.status(200).json(profile);
        }
      } else {
        return res.status(404).json({
          err: "Profil bulunamadı."
        });
      }
    })
    .catch(err => {
      console.log(err);
      return res.status(500).json({
        err
      });
    });
};

exports.update_profile = (req, res, next) => {
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }

  mongoose
    .model("Profile")
    .updateOne({ _id: req.userData.profile_id }, { $set: updateOps })
    .exec()
    .then(result => {
      return res.status(200).json({
        message: "Profil Güncellendi",
        result
      });
    })
    .catch(err => {
      console.log(err);
      return res.status(500).json({
        err:
          "Profil Güncelleme Esnasında Bir Hata İle Karşılaştık, Admin İle İletişime Geç"
      });
    });
};

/*
  updateOps = {
    "name": "Altug",
    "email": "buggracelenk01@gmail.com"
  }
*/

/*
[
  { 
    propName: "name",
    value: "Altug"
  },
  {
    propName: "email",
    value: "buggracelenk01@gmail.com"
  }
]
*/

exports.delete_profile = async (req, res, next) => {
  try {
    let removed_profile = await mongoose
      .model("Profile")
      .remove({ _id: req.userData.profile_id });
    let removed_user = await mongoose
      .model("User")
      .remove({ _id: req.userData._id });

    return res.status(200).json({
      message: "Hesabınız Kalıcı Silinmiştir."
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      err
    })
  }
};
