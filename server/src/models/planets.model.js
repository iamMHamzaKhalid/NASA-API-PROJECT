const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');

const planets = require('./planets.mongo');

// const habitablePlanets = []; //old version

const isHabitablePlanet = (planet) => {
  return (
    planet['koi_disposition'] === 'CONFIRMED' &&
    planet['koi_insol'] > 0.36 &&
    planet['koi_insol'] < 1.11 &&
    planet['koi_prad'] < 1.6
  );
};

function loadPlanetsData() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(path.join(__dirname, '..', '..', 'data', 'kepler_data.csv'))
      .pipe(
        parse({
          comment: '#',
          columns: true,
        })
      )
      .on('data', async (data) => {
        if (isHabitablePlanet(data)) {
          savePlanet(data);
        }
      })
      .on('error', (err) => {
        console.log(err);
        reject(err);
      })
      .on('end', async () => {
        // console.log(`${habitablePlanets.length} Habitable planets found! `); old version
        const countPlanetsFound = (await getAllPlanets()).length;
        console.log(`${countPlanetsFound} Habitable planets found! `); // new
        resolve();
      });
  });
}

async function getAllPlanets() {
  // return habitablePlanets;   //old version
  return await planets.find(
    {},
    {
      __v: 0, // specifically excluding these fields from find
      _id: 0,
    }
  ); // Empty obj as argument returns all documents // new version
  // second arg obj, projection(list of fields to return) or pass string as second arg for field name
}
async function savePlanet(planet) {
  // habitablePlanets.push(data);       //old version
  //TODO Replace below create with  insert + update - upsert (in mongodb donot allow duplications)
  // await planets.create({ keplerName: data.kepler_name }); //new version
  try {
    await planets.updateOne(
      {
        keplerName: planet.kepler_name,
      },
      { keplerName: planet.kepler_name },
      { upsert: true }
    ); //new
  } catch (error) {
    console.log(`Could not save planet: ${error}`);
  }
}
module.exports = {
  loadPlanetsData,
  getAllPlanets,
};
