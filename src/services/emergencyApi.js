const { XMLParser } = require('fast-xml-parser');
const {
  serviceKey,
  emergencyApiUrl,
  stage1,
  stage2,
} = require('../config/env');
const { mapHospitals } = require('../utils/filterSuyeong');

const xmlParser = new XMLParser({ ignoreAttributes: true });

async function fetchSuyeongHospitals() {
  const url = new URL(emergencyApiUrl);
  url.searchParams.set('serviceKey', serviceKey);
  url.searchParams.set('STAGE1', stage1);
  url.searchParams.set('STAGE2', stage2);
  url.searchParams.set('pageNo', '1');
  url.searchParams.set('numOfRows', '100');

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Public API HTTP error: ${response.status}`);
  }

  const xml = await response.text();
  const parsed = xmlParser.parse(xml);
  const header = parsed?.response?.header;

  const code = header?.resultCode;
  const ok = code === '00' || code === 0 || code === '0';
  if (!ok) {
    throw new Error(header?.resultMsg || 'Public API returned an error');
  }

  const body = parsed?.response?.body;
  const items = body?.items?.item;
  const hospitals = mapHospitals(items);

  return {
    region: { stage1, stage2 },
    totalCount: Number(body?.totalCount) || hospitals.length,
    hospitals,
  };
}

module.exports = { fetchSuyeongHospitals };
