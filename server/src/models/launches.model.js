const axios = require('axios');

const launchesDatabase = require('./launches.mongo'); // new version
const planets = require('./planets.mongo'); // new version
// const launches = new Map();   // old version
// let latestFlightNumber = 100;
const DEFAULT_FLIGHT_NUMBER = 100;
const launch = {
  flightNumber: 100, //exist in flight_number in SpacexAPI
  mission: 'Kepler Exploration X', //name in spacexapi
  rocket: 'Explorer IS1', //exist in rocket.name in our spacexAPI response.
  launchDate: new Date('December 27,2030'), //date_local in spacexAPI
  target: 'Kepler-442 b', // not applicable in SPACEXAPI
  customers: ['NASA', 'SpaceX'], //payload.customers from each payload in spacexAPI
  upcoming: true, // upcomming in SPACEXAPI response.
  success: true, // success in SPACEXAPI response
};
saveLaunch(launch); // launches.set(launch.flightNumber, launch);
const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

async function loadLaunchData() {
  console.log('Downloading launch data... ');
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: 'rocket',
          select: { name: 1 },
        },
        {
          path: 'payloads',
          select: { customers: 1 },
        },
      ],
    },
  });
  const launchDocs = response.data.docs;
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc['payloads'];
    const customers = payloads.flatMap((payload) => {
      return payload['customers'];
    });
    const launch = {
      flightNumber: launchDoc['flight_number'],
      mission: launchDoc['name'],
      rocket: launchDoc['rocket']['name'],
      launchDate: launchDoc['date_local'],
      upcoming: launchDoc['upcoming'],
      success: launchDoc['success'],
      customers, //customer :customers,
    };
    console.log(`${launch.flightNumber} ${launch.mission}`);
  }
}

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
  loadLaunchData,
  getAllLaunches,
  // addNewLaunch, // old version
  scheduleNewLaunch, // new version
  existsLaunchWithId,
  abortLaunchById,
};
