const {
  getAllLaunches,
  // addNewLaunch,
  scheduleNewLaunch,
  existsLaunchWithId,
  abortLaunchById,
} = require('../../models/launches.model');

async function httpGetAllLaunches(req, res) {
  return res.status(200).json(await getAllLaunches()); // Array of all launches are returned
}

async function httpAddNewLaunch(req, res) {
  const launch = req.body;

  if (!launch.mission || !launch.rocket || !launch.launchDate || !launch.target) {
    return res.status(400).json({ error: 'Missing required launch data' });
  }
  launch.launchDate = new Date(launch.launchDate);
  // launch.launchDate.toString() or below NaN same
  if (isNaN(launch.launchDate)) {
    return res.status(400).json({ error: 'Invalid launch Date' });
  }
  // addNewLaunch(launch); // old version
  await scheduleNewLaunch(launch); // new version

  return res.status(201).json(launch);
}

async function httpAbortLaunch(req, res) {
  const launchId = Number(req.params.id);
  const existsLaunch = await existsLaunchWithId(launchId);
  if (!existsLaunch) {
    return res.status(404).json({
      ok: false,
      error: 'Launch not found',
    });
  }
  const aborted = await abortLaunchById(launchId);
  if (!aborted) {
    return res.status(404).json({
      ok: false,
      error: 'Launch not aborted!',
    });
  }
  return res.status(200).json({
    ok: true,
    response: 'Launch aborted',
  });
}

module.exports = {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortLaunch,
};
