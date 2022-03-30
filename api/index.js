//                       _oo0oo_
//                      o8888888o
//                      88" . "88
//                      (| -_- |)
//                      0\  =  /0
//                    ___/`---'\___
//                  .' \\|     |// '.
//                 / \\|||  :  |||// \
//                / _||||| -:- |||||- \
//               |   | \\\  -  /// |   |
//               | \_|  ''\---/''  |_/ |
//               \  .-\__  '-'  ___/-. /
//             ___'. .'  /--.--\  `. .'___
//          ."" '<  `.___\_<|>_/___.' >' "".
//         | | :  `- \`.;`\ _ /`;.`/ - ` : | |
//         \  \ `_.   \_ __\ /__ _/   .-` /  /
//     =====`-.____`.___ \_____/___.-`___.-'=====
//                       `=---='
//     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const server = require("./src/app.js");
const { conn, Country, Capital } = require("./src/db.js");
require("dotenv").config();
const { BASEURL_API } = process.env;
const axios = require("axios");

// Syncing all the models at once.
conn.sync({ force: true }).then(async () => {
  server.listen(3001, () => {
    console.log("server on port 3001"); // eslint-disable-line no-console
  });

  try {
    await getData();
    console.log("db done");
  } catch (err) {
    console.log(err);
  }
});

const getData = async () => {
  // save data in db of restcountries API
  const response = await axios.get(`${BASEURL_API}/all`);
  const countries = response.data;

  for (let country of countries) {
    await Country.findOrCreate({
      where: {
        id: country.cca3,
        name: country.name.common,
        flag: country.flags[0],
        region: country.region,
        subregion: country.subregion || "none",
        area: country.area,
        population: country.population,
      },
    });

    let capital;
    if (!country.capital) {
      capital = "none";
      await Capital.create({ name: capital, countryId: country.cca3 });
    }
    if (country.capital && country.capital.length === 1) {
      capital = country.capital[0];
      await Capital.create({ name: capital, countryId: country.cca3 });
    }
    if (country.capital && country.capital.length > 1) {
      for (let capital of country.capital) {
        await Capital.create({ name: capital, countryId: country.cca3 });
      }
    }
  }
};
