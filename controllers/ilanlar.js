const mongoose = require("mongoose");
const paginate = require("../utils/paginate");
const validation = require("../utils/validation");

exports.ilan_olustur = async (req, res, next) => {
  const args = req.body;

  let _category = await mongoose
    .model("Category")
    .findOne({ category_name: args.category });

  if (!_category)
    return res.status(500).json({
      error: "Kategori getirilirken bir hata oluştu."
    });

  const ilan_veri = {
    title: args.title,
    price: args.price,
    desc: args.desc,
    images: args.images.length > 0 ? args.images : [],
    listed_by: req.userData.profile_id,
    category: _category._id
  };

  let ilan = await mongoose.model("Ilan").create(ilan_veri);

  if (ilan)
    return res.status(201).json({
      message: "İlan oluşturuldu, admin onayı bekliyor.",
      request: {
        type: "GET",
        url: `http://localhost:3000/api/ilanlar/${ilan._id}`
      }
    });
  else
    return res.status(500).json({
      error: "İlan oluşturulurken bir hata oluştu, admin ile iletişime geç"
    });
};

/*
args.tags = ["utu", "kalem"]
args.tags.map(tag => {})
tag = utu,
tag = kalem

ilan_veri.tags = [ObjectID, ObjectID]

let my_name = "bugra"

`my name is ${my_name}` => "my name is bugra"
"my name is " + my_name


req.body.images = ["şlksafsşaskfaslşfkaf.com/şaskşaskfgşl", "aşslkfaşlkfasşlkf.com/asşfkasşlfkasşlfk"]
req.body.images = []

ilan_veri.images = ["şlksafsşaskfaslşfkaf.com/şaskşaskfgşl", "aşslkfaşlkfasşlkf.com/asşfkasşlfkasşlfk"]
ilan_veri.images = []

if(args.images.length > 0) {} else {}
args.images.length > 0 ? {} : {}
*/

exports.get_ilanlar = async (req, res, next) => {
  let args = {
    limit: parseInt(req.params.limit),
    skip: parseInt(req.params.skip)
  };

  let _ilanlar = await mongoose.model("Ilan").find({ isApproved: true, isListing: true});
  let total_count = _ilanlar.length;

  mongoose
    .model("Ilan")
    .find({ isListing: true, isApproved: true })
    .sort({ updated_at: -1 })
    .limit(paginate.setLimit(args))
    .skip(paginate.setSkip(args))
    .exec()
    .then(result => {
      if (result.length > 0) {
        const response = {
          total_count,
          count: result.length,
          ilanlar: result.map(ilan => {
            return {
              title: ilan.title,
              price: ilan.price,
              thumbnail: ilan.thumbnail,
              request: {
                type: "GET",
                url: `http://localhost:3000/api/ilanlar/${ilan._id}`
              }
            };
          })
        };

        return res.status(200).json(response);
      } else {
        return res.status(200).json({
          message: "Listelenecek ilan yok."
        });
      }
    });
};

exports.get_ilan_by_id = async (req, res, next) => {
  const ilan_id = req.params.ilan_id;

  let result = await mongoose
    .model("Ilan")
    .find({ _id: ilan_id })
    .populate({
      path: "listed_by",
      select:
        "-birth_date -ilanlar -urunler -followers -following -begendigi_ilanlar -adres -engellenen_kullanicilar -telefon_no -user_id -isHidden -store_name",
      populate: {
        path: "profile_type",
        select: "-profile_id -user_id"
      }
    })
    .populate("category", "category_name");

  if (result) return res.status(200).json(result);
  else
    return res.status(400).json({
      error: "Verilen ID için ilan bulunamadı."
    });
};

exports.update_ilan = async (req, res, next) => {
  const ilan_id = req.params.ilan_id;

  let updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }

  updateOps["updated_at"] = Date.now();

  let old_ilan = await mongoose.model("Ilan").findOne({ _id: ilan_id });

  mongoose
    .model("Ilan")
    .findOneAndUpdate({ _id: ilan_id }, { $set: updateOps })
    .exec()
    .then(result => {
      if (result !== old_ilan) {
        return res.status(200).json({
          message: "İlan Başarıyla Güncellendi",
          request: {
            type: "GET",
            url: `http://locahost:3000/api/ilanlar/${result._id}`
          }
        });
      } else {
        return res.status(500).json({
          error:
            "İlan güncellenirken bir hata oluştu, lütfen tekrar deneyiniz ve admin ile iletişime geçiniz."
        });
      }
    })
    .catch(err => {
      console.log(err.message);
      return res.status(500).json({
        error: err.message
      });
    });
};

/*

title -> İkinci El Araba => Doktordan temiz araba
price -> 2000 => 1500

[
  {
    propName: "title",
    value: "Doktordan temiz araba"
  },
  {
    propName: "price",
    value: 1500
  }
]

ops = {
    propName: "title",
    value: "Doktordan temiz araba"
  }

ops = {
    propName: "price",
    value: 1500
  }



for(ops in req.body) {
  updateOps[ops.propName] = ops.value
}
*/

exports.like_ilan = async (req, res, next) => {
  const ilan_id = req.params.ilan_id;

  let ilan = await mongoose.model("Ilan").findOne({ _id: ilan_id });

  ilan.like_count += 1;

  let result = await ilan.save();

  if (result) {
    return res.status(200).json({
      message: "İlan Beğenildi",
      request: {
        type: "GET",
        url: `http://locahost:3000/api/ilanlar/${result._id}`
      }
    });
  } else {
    return res.status(500).json({
      error:
        "İlan beğenilirken bir hata ile karşılaşıldı. lütfen tekrar deneyiniz ve admin ile iletişime geçiniz."
    });
  }
};

exports.dislike_ilan = async (req, res, next) => {
  const ilan_id = req.params.ilan_id;

  let ilan = await mongoose.model("Ilan").findOne({ _id: ilan_id });

  ilan.like_count -= 1;

  let result = await ilan.save();

  if (result) {
    return res.status(200).json({
      message: "İlan Beğenilerden çıkarıldı",
      request: {
        type: "GET",
        url: `http://locahost:3000/api/ilanlar/${result._id}`
      }
    });
  } else {
    return res.status(500).json({
      error:
        "İlan beğenilerden çıkarılırken bir hata ile karşılaşıldı. lütfen tekrar deneyiniz ve admin ile iletişime geçiniz."
    });
  }
};

exports.ilan_favla = async (req, res, next) => {
  /*
  ilanın fav sayısını bir artır
  ilanın favlayan kullanıcılar kısmına profil_id'sini ekle
  profilde favlanan ilanlar kısmına bu ilanı ekle
  */

  const ilan_id = req.params.ilan_id;

  let ilan = await mongoose.model("Ilan").findOne({ _id: ilan_id });
  let profile = await mongoose
    .model("Profile")
    .findOne({ _id: req.userData.profile_id });

  ilan.fav_count += 1;
  ilan.faved_users.push(req.userData.profile_id);
  profile.fav_ilanlar.push(ilan_id);

  let ilan_res = await ilan.save();
  let profile_res = await profile.save();

  if (ilan_res && profile_res) {
    return res.status(200).json({
      message: "İlan favorilere eklendi",
      request: {
        path: "GET",
        url: `http://localhost:3000/api/profile/favs`
      }
    });
  } else if (!ilan_res) {
    return res.status(500).json({
      error:
        "İlan favorilere eklenirken bir hata oluştu, tekrar deneyiniz ve admin ile iletişime geçiniz."
    });
  } else if (!profile_res) {
    return res.status(500).json({
      error:
        "İlan profile eklenirken bir hata oluştu, tekrar deneyiniz ve admin ile iletişime geçiniz."
    });
  }
};

exports.unfav_ilan = async (req, res, next) => {
  const ilan_id = req.params.ilan_id;

  let ilan = await mongoose.model("Ilan").findOne({ _id: ilan_id });
  let profile = await mongoose
    .model("Profile")
    .findOne({ _id: req.userData.profile_id });

  ilan.fav_count -= 1;
  ilan.faved_users.filter(faved_user => {
    return faved_user !== req.userData.profile_id;
  });
  profile.fav_ilanlar.filter(fav_ilan => {
    return fav_ilan !== ilan_id;
  });

  let ilan_res = await ilan.save();
  let profile_res = await profile.save();

  if (ilan_res && profile_res) {
    return res.status(200).json({
      message: "İlan favorilerden çıkarıldı.",
      request: {
        path: "GET",
        url: `http://localhost:3000/api/profile/favs`
      }
    });
  } else if (!ilan_res) {
    return res.status(500).json({
      error:
        "İlan favorilerden çıkarılırken bir hata oluştu, tekrar deneyiniz ve admin ile iletişime geçiniz."
    });
  } else if (!profile_res) {
    return res.status(500).json({
      error:
        "İlan profilden çıkarılırken bir hata oluştu, tekrar deneyiniz ve admin ile iletişime geçiniz."
    });
  }
};
/*
  let arr = [1,2,3,4,5];
  arr.filter(number => number !== 4);
  arr = [1,2,3,5];
*/
exports.delete_ilan = (req, res, next) => {
  let ilan_id = req.params.ilan_id;

  mongoose
    .model("Ilan")
    .findByIdAndDelete(ilan_id)
    .exec()
    .then(result => {
      if (!result)
        return res.status(500).json({
          error: "İlan silinirken bir hata ile karşılaşıldı."
        });

      return res.status(200).json({
        messsage: "İlan başarılı bir şekilde silindi.",
        result
      });
    });
};

exports.get_my_ilanlar = (req, res, next) => {
  let args = {
    limit: parseInt(req.params.limit),
    skip: parseInt(req.params.skip)
  };
  mongoose
    .model("Ilan")
    .find({ listed_by: req.userData.profile_id })
    .sort({ updated_at: -1 })
    .limit(paginate.setLimit(args))
    .skip(paginate.setSkip(args))
    .exec()
    .then(result => {
      if (result.length > 0) {
        const response = {
          count: result.length,
          ilanlar: result.map(ilan => {
            return {
              title: ilan.title,
              price: ilan.price,
              thumbnail: ilan.thumbnail,
              request: {
                type: "GET",
                url: `http://localhost:3000/api/ilanlar/${ilan._id}`
              }
            };
          })
        };

        return res.status(200).json(response);
      } else {
        return res.status(200).json({
          message: "Listelenecek ilan yok."
        });
      }
    })
    .catch(err => {
      console.log(err.message);
      return res.status(500).json({
        error: err.message
      });
    });
};

exports.search = async (req, res, next) => {
  let search_string = req.body.search_string;

  let ilanlar = await mongoose
    .model("Ilan")
    .find({ title: /`${search_string}`/i })
    .sort({ updated_at: -1 })
    .exec();
  let urunler = await mongoose
    .model("Product")
    .find({ title: /`${search_string}`/i })
    .sort({ updated_at: -1 })
    .exec();

  if (!ilanlar)
    return res.status(500).json({
      error: "İlanlar getirilemedi."
    });

  if (!urunler)
    return res.status(500).json({
      error: "Urunler getirilemedi."
    });

  return res.status(200).json({
    results: {
      ilanlar,
      urunler
    }
  });
};

exports.search_category = async (req, res, next) => {
  try {

    if (!req.body.category || req.body.category === "")
      return res.status(405).json({
        error: "Kategori seçilmedi"
      });

    await validation.isValid(req.body.category, "category_id");

    let ilanlar = await mongoose
      .model("Ilan")
      .find({ isListing: true, isApproved: true, category: req.body.category })
      .sort({ updated_at: -1 })
      .exec();

    let urunler = await mongoose
      .model("Product")
      .find({ isListing: true, isApproved: true, category: req.body.category })
      .sort({ updated_at: -1 })
      .exec();

    if (!ilanlar)
      return res.status(500).json({
        error: "İlanlar getirilemedi."
      });

    if (!urunler)
      return res.status(500).json({
        error: "Urunler getirilemedi."
      });

    return res.status(200).json({
      results: {
        ilanlar,
        urunler
      }
    });
  } catch (err) {}
};

exports.search_by_price = async (req, res, next) => {
  let args = {
    limit: parseInt(req.params.limit),
    skip: parseInt(req.params.skip)
  };

  //$gt -> greater then
  //$lt -> lower then

  let ilanlar = await mongoose
    .model("Ilan")
    .find({
      isListing: true,
      isApproved: true,
      price: { $gt: req.body.min_price, $lt: req.body.max_price }
    })
    .sort({ updated_at: -1 })
    .exec();

  let urunler = await mongoose
    .model("Product")
    .find({
      isListing: true,
      isApproved: true,
      price: { $gt: req.body.min_price, $lt: req.body.max_price }
    })
    .sort({ updated_at: -1 })
    .exec();

  if (!ilanlar)
    return res.status(500).json({
      error: "İlanlar getirilemedi."
    });

  if (!urunler)
    return res.status(500).json({
      error: "Urunler getirilemedi."
    });

  return res.status(200).json({
    results: {
      ilanlar,
      urunler
    }
  });
};

/*
  req.body.categories = ["asdasda", "asdasd"],

*/

/*
  title: az kullanılmış ütü
  ütü

*/

/*
tags,category,text,fiyat aralığı

*/

//exports.search
//exports.unfav
//exports.delete
//exports.ilanlarımı_getir
