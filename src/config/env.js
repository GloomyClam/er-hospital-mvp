require('dotenv').config(); //env 파일을 읽을 수 있도록 해주는 코드

function requireEnv(name) { // requireEnv 기능은 name 요소만 받는다 = 그 보관함에서 환경변수 이름(name) 을 문자열로 받아온 뒤 값을 꺼내온다
  const value = process.env[name];  // 값(벨류)을 저장하는 임시공간에 값을 저장한다 = 노드가 들고있는 환경변수 보관함(내가 설정한 값을 다른파일에 저장해둠)에서 환경변수의 이름을 문자열로 받아옴
  if (!value) { // 만약 벨류가 빈칸이라면
    throw new Error(`Missing required environment variable: ${name}`);// 함수를 종료하고 에러를 던진다 "api 키가 없다" 쓰루와 캐치는 필수조건은 아니다 - 이 코드의 목적은 api가 없다면 서버를 킬 필요가 없으니 서버 실행을 막아줌
  }
  return value; // 찾은 값을 결과로 내보낸다
}

const port = Number(process.env.PORT) || 3000; // 포트의 정보를 임시저장 = 문자열이 아닌 숫자로 표기(노드 내의 내가 설정한 값을 들고온다)

module.exports = { //이 파일의 값(module)을 다른곳에서도 사용할 수 있도록 한다
  port, // 포트 번호
  serviceKey: requireEnv('DATA_GO_KR_SERVICE_KEY'),// process.env 안에서 DATA_GO_KR_SERVICE_KEY 라는 이름의 환경변수를 꺼내어 서비스 키라는 이름을 붙여 내보낸다
  emergencyApiUrl: requireEnv('EMERGENCY_API_URL'),// api 주소: 노드내에서 EMERGENCY_API_URL내의 주소를 들고온다
  seriousDiseaseApiUrl: requireEnv('SERIOUS_DISEASE_API_URL'), // 중증질환 수용 가능 정보 API 주소를 별도 설정값으로 관리한다
  emergencyLocationApiUrl: requireEnv('EMERGENCY_LOCATION_API_URL'), // 병원 주소와 좌표를 조회하는 위치정보 API 주소
  stage1: process.env.STAGE1 || '부산광역시', // api에서 받아올 지역값은 기본적으로 내가 정한 STAGE1 값을 쓴다 || 없으면 기본 값으로 부산광역시  를 쓴다 (이 값은 api에 요청할 조건이다)
  stage2: process.env.STAGE2 || '수영구', // api에서 받아올 지역값은 기본적으로 내가 정한 STAGE2 값을 쓴다 || 없으면 기본 값으로 수영구 를 쓴다(이 값은 api에 요청할 조건이다)
};
