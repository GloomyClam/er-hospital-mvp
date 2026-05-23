require('dotenv').config();

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const port = Number(process.env.PORT) || 3000;

module.exports = {
  port,
  serviceKey: requireEnv('DATA_GO_KR_SERVICE_KEY'),
  emergencyApiUrl: requireEnv('EMERGENCY_API_URL'),
  stage1: process.env.STAGE1 || '부산광역시',
  stage2: process.env.STAGE2 || '수영구',
};
