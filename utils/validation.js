const { ObjectID } = require("mongodb");

const isValidID = (_id, field) => {
  if (!_id) throw new Error(`${field}${"boş olamaz"}`);
  if (!ObjectID.isValid(_id)) throw new Error(`${field}${"geçerli bir _id değil"}`);
  true;
};

module.exports = { isValidID };