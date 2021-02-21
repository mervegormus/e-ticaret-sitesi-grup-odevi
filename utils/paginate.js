const setLimit = args => {
    if (args.limit && args.limit < 0) throw new Error(`limit cannot be negative`);
    let limit = args.limit > 10 ? 10 : args.limit;
    if (!Number.isInteger(limit)) throw new Error("limit is not an integer");
    return limit;
};

const setSkip = args => {
    if (args.skip && args.skip < 0) throw new Error(`skip cannot be negative`);
    let skip = args.skip ? args.skip : 0;
    if (!Number.isInteger(skip)) throw new Error("skip is not an integer");

    return skip * setLimit(args);
};

module.exports = { setLimit, setSkip };

/*
type: GET
url: http://localhost:3000/api/ilanlar/:limit/:skip

args = {
  limit: req.params.limit,
  skip: req.params.skip
}

type: GET
url: http://localhost:3000/api/ilanlar/10/2

args = {
  limit: 10,
  skip: 2
}

*/