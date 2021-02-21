const mongoose = require("mongoose");
const paginate = require("../utils/paginate");
const validation = require("../utils/validation");

exports.create_product = async (req, res, next) => {
  const args = req.body;

  let _category = await mongoose
    .model("Category")
    .create({ category_name: args.category });

  if (!_category)
    return res.status(500).json({
      error: "Kategori getirilirken bir hata oluştu."
    });

  const product_veri = {
    title: args.title,
    price: args.price,
    desc: args.desc,
    images: args.images.length > 0 ? args.images : [],
    listed_by: req.userData.profile_id,
    category: _category._id,
  };

  let product = await mongoose.model("Product").create(product_veri);

  if (product)
    return res.status(201).json({
      message: "Ürün oluşturuldu, admin onayı bekliyor.",
      request: {
        type: "GET",
        url: `http://localhost:3000/api/products/${product._id}`
      }
    });
  else
    return res.status(500).json({
      error: "Ürün oluşturulurken bir hata oluştu, admin ile iletişime geç"
    });
};

/*
args.tags = ["utu", "kalem"]
args.tags.map(tag => {})
tag = utu,
tag = kalem

product_veri.tags = [ObjectID, ObjectID]

let my_name = "bugra"

`my name is ${my_name}` => "my name is bugra"
"my name is " + my_name


req.body.images = ["şlksafsşaskfaslşfkaf.com/şaskşaskfgşl", "aşslkfaşlkfasşlkf.com/asşfkasşlfkasşlfk"]
req.body.images = []

product_veri.images = ["şlksafsşaskfaslşfkaf.com/şaskşaskfgşl", "aşslkfaşlkfasşlkf.com/asşfkasşlfkasşlfk"]
product_veri.images = []

if(args.images.length > 0) {} else {}
args.images.length > 0 ? {} : {}
*/

exports.get_products = (req, res, next) => {
  let args = {
    limit: parseInt(req.params.limit),
    skip: parseInt(req.params.skip)
  };
  mongoose
    .model("Product")
    .find({ isListing: true, isApproved: true })
    .sort({ updated_at: -1 })
    .limit(paginate.setLimit(args))
    .skip(paginate.setSkip(args))
    .exec()
    .then(result => {
      if (result.length > 0) {
        const response = {
          count: result.length,
          products: result.map(product => {
            return {
              title: product.title,
              price: product.price,
              thumbnail: product.thumbnail,
              request: {
                type: "GET",
                url: `http://localhost:3000/api/products/${product._id}`
              }
            };
          })
        };

        return res.status(200).json(response);
      } else {
        return res.status(200).json({
          message: "Listelenecek ürün yok."
        });
      }
    });
};

exports.get_product_by_id = async (req, res, next) => {
  const product_id = req.params.product_id;

  let result = await mongoose
    .model("Product")
    .find({ _id: product_id })
    .populate({
      path: "listed_by",
      select:
        "store_name -birth_date -products -ilanlar -followers -following -begendigi_products -adres -engellenen_kullanicilar -telefon_no -user_id -isHidden",
      populate: {
        path: "profile_type",
        select: "-profile_id -user_id"
      }
    })
    .populate("category", "category_name")

  if (result) return res.status(200).json(result);
  else
    return res.status(400).json({
      error: "Verilen ID için ürün bulunamadı."
    });
};

exports.update_product = async (req, res, next) => {
  const product_id = req.params.product_id;

  let updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }

  updateOps["updated_at"] = Date.now();

  let old_product = await mongoose.model("Product").findOne({ _id: product_id });

  mongoose
    .model("Product")
    .findOneAndUpdate({ _id: product_id }, { $set: updateOps })
    .exec()
    .then(result => {
      if (result !== old_product) {
        return res.status(200).json({
          message: "Ürün Başarıyla Güncellendi",
          request: {
            type: "GET",
            url: `http://locahost:3000/api/products/${result._id}`
          }
        });
      } else {
        return res.status(500).json({
          error:
            "Ürün güncellenirken bir hata oluştu, lütfen tekrar deneyiniz ve admin ile iletişime geçiniz."
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

exports.like_product = async (req, res, next) => {
  const product_id = req.params.product_id;

  let product = await mongoose.model("Product").findOne({ _id: product_id });

  product.like_count += 1;

  let result = await product.save();

  if (result) {
    return res.status(200).json({
      message: "Ürün Beğenildi",
      request: {
        type: "GET",
        url: `http://locahost:3000/api/products/${result._id}`
      }
    });
  } else {
    return res.status(500).json({
      error:
        "Ürün beğenilirken bir hata ile karşılaşıldı. lütfen tekrar deneyiniz ve admin ile iletişime geçiniz."
    });
  }
};

exports.dislike_product = async (req, res, next) => {
  const product_id = req.params.product_id;

  let product = await mongoose.model("Product").findOne({ _id: product_id });

  product.like_count -= 1;

  let result = await product.save();

  if (result) {
    return res.status(200).json({
      message: "Ürün Beğenilerden çıkarıldı",
      request: {
        type: "GET",
        url: `http://locahost:3000/api/products/${result._id}`
      }
    });
  } else {
    return res.status(500).json({
      error:
        "Ürün beğenilerden çıkarılırken bir hata ile karşılaşıldı. lütfen tekrar deneyiniz ve admin ile iletişime geçiniz."
    });
  }
};

exports.fav_product = async (req, res, next) => {
  /*
  productın fav sayısını bir artır
  productın favlayan kullanıcılar kısmına profil_id'sini ekle
  profilde favlanan products kısmına bu productı ekle
  */

  const product_id = req.params.product_id;

  let product = await mongoose.model("Product").findOne({ _id: product_id });
  let profile = await mongoose
    .model("Profile")
    .findOne({ _id: req.userData.profile_id });

  product.fav_count += 1;
  product.faved_users.push(req.userData.profile_id);
  profile.fav_products.push(product_id);

  let product_res = await product.save();
  let profile_res = await profile.save();

  if (product_res && profile_res) {
    return res.status(200).json({
      message: "Ürün favorilere eklendi",
      request: {
        path: "GET",
        url: `http://localhost:3000/api/profile/favs`
      }
    });
  } else if (!product_res) {
    return res.status(500).json({
      error:
        "Ürün favorilere eklenirken bir hata oluştu, tekrar deneyiniz ve admin ile iletişime geçiniz."
    });
  } else if (!profile_res) {
    return res.status(500).json({
      error:
        "Ürün profile eklenirken bir hata oluştu, tekrar deneyiniz ve admin ile iletişime geçiniz."
    });
  }
};

exports.unfav_product = async (req, res, next) => {
  const product_id = req.params.product_id;

  let product = await mongoose.model("Product").findOne({ _id: product_id });
  let profile = await mongoose
    .model("Profile")
    .findOne({ _id: req.userData.profile_id });

  product.fav_count -= 1;
  product.faved_users.filter(faved_user => {
    return faved_user !== req.userData.profile_id;
  });
  profile.fav_products.filter(fav_product => {
    return fav_product !== product_id;
  });

  let product_res = await product.save();
  let profile_res = await profile.save();

  if (product_res && profile_res) {
    return res.status(200).json({
      message: "Ürün favorilerden çıkarıldı.",
      request: {
        path: "GET",
        url: `http://localhost:3000/api/profile/favs`
      }
    });
  } else if (!product_res) {
    return res.status(500).json({
      error:
        "Ürün favorilerden çıkarılırken bir hata oluştu, tekrar deneyiniz ve admin ile iletişime geçiniz."
    });
  } else if (!profile_res) {
    return res.status(500).json({
      error:
        "Ürün profilden çıkarılırken bir hata oluştu, tekrar deneyiniz ve admin ile iletişime geçiniz."
    });
  }
};
/*
  let arr = [1,2,3,4,5];
  arr.filter(number => number !== 4);
  arr = [1,2,3,5];
*/
exports.delete_product = (req, res, next) => {
  let product_id = req.params.product_id;

  mongoose
    .model("Product")
    .findByIdAndDelete(product_id)
    .exec()
    .then(result => {
      if (!result)
        return res.status(500).json({
          error: "Ürün silinirken bir hata ile karşılaşıldı."
        });

      return res.status(200).json({
        messsage: "Ürün başarılı bir şekilde silindi.",
        result
      });
    });
};

exports.get_my_products = (req, res, next) => {
  let args = {
    limit: parseInt(req.params.limit),
    skip: parseInt(req.params.skip)
  };
  mongoose
    .model("Product")
    .find({ listed_by: req.userData.profile_id })
    .sort({ updated_at: -1 })
    .limit(paginate.setLimit(args))
    .skip(paginate.setSkip(args))
    .exec()
    .then(result => {
      if (result.length > 0) {
        const response = {
          count: result.length,
          products: result.map(product => {
            return {
              title: product.title,
              price: product.price,
              thumbnail: product.thumbnail,
              request: {
                type: "GET",
                url: `http://localhost:3000/api/products/${product._id}`
              }
            };
          })
        };

        return res.status(200).json(response);
      } else {
        return res.status(200).json({
          message: "Listelenecek ürün yok."
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

  let products = await mongoose
    .model("Product")
    .find({ title: /`${search_string}`/i, })
    .sort({ updated_at: -1 })
    .exec();
  let ilanlar = await mongoose
    .model("Ilan")
    .find({ title: /`${search_string}`/i, })
    .sort({ updated_at: -1 })
    .exec();

  if (!products)
    return res.status(500).json({
      error: "Ürünler getirilemedi."
    });

  if (!ilanlar)
    return res.status(500).json({
      error: "İlanlar getirilemedi."
    });

  let results = [];

  if (products.length === 0 && ilanlar.length > 0) {
    results = [...results, ilanlar];
  } else if (products.length > 0 && ilanlar.length === 0) {
    results = [...results, products];
  } else if (products.length > 0 && ilanlar.length > 0) {
    results = [...results, products, ilanlar];
  }

  return res.status(200).json({
    results
  });
};

exports.search_category = async (req, res, next) => {
  try {
    let args = {
      limit: parseInt(req.params.limit),
      skip: parseInt(req.params.skip)
    };

    if (!req.body.category || req.body.category === "")
      return res.status(405).json({
        error: "Kategori seçilmedi"
      });

    await validation.isValid(req.body.category, "category_id");

    let products = await mongoose
      .model("Product")
      .find({ isListing: true, isApproved: true, category: req.body.category })
      .sort({ updated_at: -1 })
      .limit(paginate.setLimit(args))
      .skip(paginate.setSkip(args))
      .exec();

    let ilanlar = await mongoose
      .model("Ilan")
      .find({ isListing: true, isApproved: true, category: req.body.category })
      .sort({ updated_at: -1 })
      .limit(paginate.setLimit(args))
      .skip(paginate.setSkip(args))
      .exec();

    if (!products)
      return res.status(500).json({
        error: "Ürünler getirilemedi."
      });

    if (!ilanlar)
      return res.status(500).json({
        error: "İlanlar getirilemedi."
      });

    let results = [];

    if (products.length === 0 && ilanlar.length > 0) {
      results = [...results, ilanlar];
    } else if (products.length > 0 && ilanlar.length === 0) {
      results = [...results, products];
    } else if (products.length > 0 && ilanlar.length > 0) {
      results = [...results, products, ilanlar];
    }
  } catch (err) {}
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
//exports.productsımı_getir
