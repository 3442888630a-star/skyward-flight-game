// Deterministic screenshot scenes behind ?shot=start|play|approach|end.
// Each scene stages the real flight world and plane kinematics so every screenshot
// reflects authentic gameplay at golden hour.

import { MISSION_RINGS, MODE_MISSION, RUNWAY, STEP } from './config.js';
import { clamp, wrapAngle } from './math.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './hud.js';

/** Simple autopilot steering the plane toward a target 3D point. */
function autopilotTo(plane, target, desiredSpeed = 44) {
  const dx = target.x - plane.pos.x;
  const dy = target.y - plane.pos.y;
  const dz = target.z - plane.pos.z;
  const distH = Math.hypot(dx, dz) || 1;
  const targetHeading = Math.atan2(dx, -dz);
  const hdgErr = wrapAngle(targetHeading - plane.heading);
  const targetBank = clamp(hdgErr * 1.4, -0.55, 0.55);
  const rollCmd = clamp((targetBank - plane.roll) * 2.2, -1, 1);

  const targetPitch = clamp(Math.atan2(dy, distH) + 0.04, -0.25, 0.25);
  const pitchCmd = clamp((targetPitch - plane.pitch) * 3.0, -1, 1);
  const yawCmd = clamp(hdgErr * 0.8, -0.5, 0.5);
  const throttleDelta = clamp((desiredSpeed - plane.speed) * 0.15, -1, 1);

  return { pitch: pitchCmd, roll: rollCmd, yaw: yawCmd, throttleDelta, brake: false };
}

export function stageShot(name, world) {
  world.reset(MODE_MISSION);
  const st = world.state;
  const p = st.plane;

  if (name === 'play') {
    // Mountain-system panorama: high over the joined alpine cordillera overlooking Glacier Tarn, colorful foothills & snow peaks
    st.camMode = 0;
    st.ringsPassed = 2;
    st.ringScore = 950;
    st.ringCombo = 2;
    st.maxCombo = 2;
    st.comboMult = 1;
    st.perfectRings = 2;
    st.goodRings = 0;
    st.missionTime = 98.5;
    p.fuel = 79;
    p.pos.x = -1260;
    p.pos.y = 625;
    p.pos.z = -880;
    p.speed = 46;
    p.throttle = 0.68;
    world.setBasisFromHeadingPitchRoll(-0.74, -0.05, -0.10);
    p.vel.x = p.forward.x * p.speed;
    p.vel.y = p.forward.y * p.speed;
    p.vel.z = p.forward.z * p.speed;
    p.verticalSpeed = p.vel.y;
    for (let i = 0; i < Math.round(1.2 / STEP); i += 1) {
      world.step(STEP, { pitch: 0.03, roll: -0.04, yaw: 0, throttleDelta: 0, brake: false }, false);
    }
    st.toastText = 'Alpine Ridge Cleared — Descending to Glacier Tarn';
    st.toastTimer = 2.6;
    return { screen: SCREEN_PLAY, best: st.ringScore };
  }

  if (name === 'approach') {
    // Side-front low-altitude pass beside Mirror Lake Falls: lake + snow peaks + falls + offset plane
    st.camMode = 0;
    st.ringsPassed = MISSION_RINGS.length;
    st.ringScore = 5850;
    st.ringCombo = 8;
    st.maxCombo = 8;
    st.comboMult = 3;
    st.perfectRings = 6;
    st.goodRings = 2;
    st.missionTime = 332.4;
    p.fuel = 31;
    p.pos.x = 89.5;
    p.pos.y = 37.5;
    p.pos.z = -1064;
    p.speed = 34; // ~66 kts approach speed
    p.throttle = 0.36;
    world.setBasisFromHeadingPitchRoll(2.68, -0.06, -0.22);
    p.vel.x = p.forward.x * p.speed;
    p.vel.y = -1.7;
    p.vel.z = p.forward.z * p.speed;
    p.verticalSpeed = -1.7;
    st.shotCam = {
      pos: { x: 68, y: 46, z: -1042 },
      target: { x: 196, y: -38, z: -1305 },
    };
    st.toastText = 'All 8 Rings Cleared! Pass Mirror Lake Falls for RWY 36';
    st.toastTimer = 3.2;
    return { screen: SCREEN_PLAY, best: 5850 };
  }

  if (name === 'end') {
    // Completed mission parked cleanly on Runway 36 at golden hour
    st.camMode = 0;
    st.ringsPassed = MISSION_RINGS.length;
    st.ringScore = 6600;
    st.ringCombo = 8;
    st.maxCombo = 8;
    st.comboMult = 3;
    st.perfectRings = 6;
    st.goodRings = 2;
    st.grazeRings = 0;
    st.missionTime = 368.4;
    p.fuel = 28;
    p.pos.x = 1.5;
    p.pos.y = RUNWAY.elevation + RUNWAY.gearClearance;
    p.pos.z = 72;
    p.speed = 0;
    p.throttle = 0;
    p.vel.x = 0;
    p.vel.y = 0;
    p.vel.z = 0;
    p.verticalSpeed = 0;
    p.onGround = true;
    p.touchdownSink = 0.68;
    p.touchdownOffset = 1.4;
    p.landingGrade = 'BUTTER';
    p.glideslopeGrade = 'ON GLIDESLOPE (A)';
    p.glideslopeDeg = 0.4;
    world.setBasisFromHeadingPitchRoll(0.01, 0.01, 0);
    st.outcome = 'win';
    st.scoreBreakdown.rings = 6600;
    st.scoreBreakdown.time = 394;
    st.scoreBreakdown.fuel = 336;
    st.scoreBreakdown.landing = 1000;
    st.scoreBreakdown.total = 8330;
    return { screen: SCREEN_OVER, best: 8330 };
  }

  if (name === 'yoke') {
    // Extra cockpit verification shot: hard left bank & aft elevator pull with unmistakable yoke rotation + travel
    st.camMode = 2;
    st.ringsPassed = 2;
    st.ringScore = 950;
    st.ringCombo = 2;
    st.maxCombo = 2;
    st.comboMult = 1;
    st.missionTime = 112.4;
    p.fuel = 76;
    p.pos.x = -1480;
    p.pos.y = 510;
    p.pos.z = -960;
    p.speed = 44;
    p.throttle = 0.72;
    world.setBasisFromHeadingPitchRoll(-0.78, 0.08, -0.46);
    p.vel.x = p.forward.x * p.speed;
    p.vel.y = p.forward.y * p.speed;
    p.vel.z = p.forward.z * p.speed;
    p.verticalSpeed = p.vel.y;
    st.lastControls = { pitch: 0.85, roll: -0.96, yaw: -0.22 };
    st.elapsed = 1.6;
    st.toastText = 'Cockpit Hard Left Bank — Smooth Yoke Deflection Check';
    st.toastTimer = 2.5;
    return { screen: SCREEN_PLAY, best: 8330 };
  }

  // Default: 'start' hero cover shot — cockpit view INSIDE the new Eagle Gorge landmark facing Ring 6 + plateau rim + snow peaks
  st.camMode = 2;
  st.ringsPassed = 5;
  st.ringScore = 3000;
  st.ringCombo = 5;
  st.maxCombo = 5;
  st.comboMult = 3;
  st.missionTime = 212.5;
  p.fuel = 62;
  p.pos.x = 2152;
  p.pos.y = 128;
  p.pos.z = 515;
  p.speed = 46;
  p.throttle = 0.68;
  world.setBasisFromHeadingPitchRoll(0.47, -0.01, 0.06);
  p.vel.x = p.forward.x * p.speed;
  p.vel.y = p.forward.y * p.speed;
  p.vel.z = p.forward.z * p.speed;
  p.verticalSpeed = p.vel.y;
  st.lastControls = { pitch: -0.06, roll: 0.14, yaw: 0 };
  st.elapsed = 1.2;
  return { screen: SCREEN_TITLE, best: 8330 };
}
