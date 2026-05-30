const { XMLParser } = require('fast-xml-parser'); //XMLParser 공간을 할당 = fast-xml-parser 라이브러리안의 XMLParser도구를 찾아와서 넣어둔다(XML을 해석하는 번역기)
const { // serviceKey,emergencyApiUrl,stage1,stage2 공간 할당 = 파일 밖으로 한번 나가서 컨피그 내에 env 파일로 가서 각 객체에 맞는 형식을 저장한다
  serviceKey,
  emergencyApiUrl,
  stage1,
  stage2,
} = require('../config/env');
const { mapHospitals } = require('../utils/filterSuyeong'); // mapHospitals 공간 할당 = 파일 밖으로 한번 나가서 utils/filterSuyeong위치에 있는 mapHospitals 을 들고와 저장한다 

const xmlParser = new XMLParser({ ignoreAttributes: true }); // xmlParser 공간 할당 = 새로운 xmlParser 값을 저장할때 Attributes(api쪽에서 할당한 속성) 를 무시하고 json 값만 저장한다
 
async function fetchSuyeongHospitals() { // 비동기 기능 fetchSuyeongHospitals 을 만든다
  const url = new URL(emergencyApiUrl); // url 공간을 할당 = emergencyApiUrl에서 받아온 새로운 url을 저장한다 
  url.searchParams.set('serviceKey', serviceKey); // api의 인증을 통과하기 위해 기존 주소에 내 서비스 키를 붙인다
  url.searchParams.set('STAGE1', stage1); //  api가 필요한 정보만 줄 수 있도록 지역을 좁힌다
  url.searchParams.set('STAGE2', stage2);
  url.searchParams.set('pageNo', '1'); // api에게 첫번째 페이지만 요청한다
  url.searchParams.set('numOfRows', '100'); // api 에게 100가지만 보여달라 요청한다

  const response = await fetch(url.toString()); //response 공간할당 = url.toString()로 요청할 주소를 문자열로 바꾼다. 요청한 주소는 비동기로 받아온다

  if (!response.ok) {// 만약 response응답은 왔지만 성공하지 못했다면
    throw new Error(`Public API HTTP error: ${response.status}`); // 새로운 에러를 던진다 (`Public API HTTP error: ${response.status}`
  }

  const xml = await response.text(); // xml 공간할당 = 비동기로 response 텍스트를 받아와 저장한다
  const parsed = xmlParser.parse(xml); // parsed 공간할당 = xmlParser내의 parse 기능을 xml 받아서 저장한다 ->  xmlParser 번역기를 사용해 api에서 받아온 문자열(xml)을 서버가 알아들을 수 있도록 바꾼다
  const header = parsed?.response?.header; // header 공간할당 = parsed안에서 response를 찾고 그 안에서 header를 찾아서 저장한다(?는 옵셔널제이닝, 앞의 값이 있으면 들어가고 없으면 멈춘다)

  const code = header?.resultCode; // code 공간 할당 = header 안에서resultCode를 찾아서 저장한다  ->resultCode는 공공 api에서 요청이 성공했는지 설명하는 코드임
  const ok = code === '00' || code === 0 || code === '0'; //  ok 공간 할당 = code가 00(문자열)이거나 0(숫자) 이거나 0(문자열) 일때의 값을 저장
  if (!ok) { //만약 code가 ok 조건을 만족하지 않는다면
    throw new Error(header?.resultMsg || 'Public API returned an error'); // 새로운 에러를 던진다(header안의 resultMsg를 찾아 넣는다 값이 없으면 설정해둔 문자열을 출력한다)
  }

  const body = parsed?.response?.body; //body 공강 할당 = parsed내에 .response를 찾고 response 내에.body 값을 찾아서 저장
  const items = body?.items?.item; // 아이템 공간 할당 =  body 내에서 items 값을 찾고 items 내에서 .item값을 찾아 저장
  const hospitals = mapHospitals(items); // 공간할당hospitals = api 에서 받은 원본 데아터를 mapHospitals에 넣어서 쓰기 좋은 병원 배열로 바꾼다

  return { //함수 값을 도출하고 종료
    region: { stage1, stage2 }, //  지역이름 부산, 수영구
    totalCount: Number(body?.totalCount) || hospitals.length, // totalCount 숫자(바디 내의 토탈카운트를 찾아옴) 를 들고오거나 없으면 병원 배열 숫자를 들고온다
    hospitals, // 병원 배열
  };
}

module.exports = { fetchSuyeongHospitals }; // fetchSuyeongHospitals 값을 다른곳에서 사용 가능하도록 한다
