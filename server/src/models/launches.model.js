const launchesDatabase = require('./launches.mongo'); // new version
const planets = require('./planets.mongo'); // new version
// const launches = new Map();   // old version
// let latestFlightNumber = 100;
const DEFAULT_FLIGHT_NUMBER = 100;
const launch = {
  flightNumber: 100,
  mission: 'Kepler Exploration X',
  rocket: 'Explorer IS1',
  launchDate: new Date('December 27,2030'),
  target: 'Kepler-442 b',
  customers: ['NASA', 'SpaceX'],
  upcoming: true,
  success: true,
};
saveLaunch(launch);
// launches.set(launch.flightNumber, launch);

async function existsLaunchWithId(launchId) {
  // return launches.has(launchId); //old version
  return await launchesDatabase.findOne({
    flightNumber: launchId,
  }); //new version
}
async function getLatestFlightNumber() {
  const latestLaunch = await launchesDatabase.findOne({}, { _id: 0 }).sort('-flightNumber'); // minus operator sorts in descending order
  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }
  return latestLaunch.flightNumber;
}
async function getAllLaunches() {
  // return Array.from(launches.values());  //old version
  return await launchesDatabase.find({}, { __v: 0, _id: 0 }); //new version
}
async function saveLaunch(launch) {
  const planet = await planets.findOne({
    keplerName: launch.target,
  });
  if (!planet) {
    throw new Error('Matching planet not found! ');
  }
  await launchesDatabase.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    {
      upsert: true,
    }
  );
}
// old version
// function addNewLaunch(launch) {
//   latestFlightNumber++;
//   launches.set(
//     latestFlightNumber,
//     Object.assign(launch, {
//       success: true,
//       upcoming: true,
//       customers: ['NASA', 'Space X'],
//       flightNumber: latestFlightNumber,
//     })
//   );
// }

async function scheduleNewLaunch(launch) {
  const newFlightNumber = (await getLatestFlightNumber()) + 1;

  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customers: ['NASA', 'Space X'],
    flightNumber: newFlightNumber,
  });
  await saveLaunch(newLaunch);
}
async function abortLaunchById(launchId) {
  // old version
  // const aborted = launches.get(launchId);
  // aborted.upcoming = false;
  // aborted.success = false;
  // return aborted;
  // new version
  const aborted = await launchesDatabase.updateOne(
    {
      flightNumber: launchId,
    },
    {
      success: false,
      upcoming: false,
    }
  );
  return aborted.modifiedCount === 1;
}

module.exports = {
  getAllLaunches,
  // addNewLaunch, // old version
  scheduleNewLaunch, // new version
  existsLaunchWithId,
  abortLaunchById,
};
