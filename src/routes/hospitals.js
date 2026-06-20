const express = require('express');// express 공간 할당 = express라이브러리(도구상자)를 들고와서 변수에 담는다
const { stage1: defaultStage1, stage2: defaultStage2 } = require('../config/env');
const { fetchHospitals } = require('../services/emergencyApi');

const router = express.Router(); // router 공간 할당 = express 내의 Router 기능을 들고온다 -> 여러 api 주소를 관리 할 수 있는 라우터 객체

router.get('/', async (req, res) => { // 이 라우터의 기본 주소('/')로 get 요청이 들어오면 아래 함수를 실행한다
  try { // 일단 해봐
    // 화면에서 선택한 지역을 우선 사용하고, query가 없으면 환경변수 기본값을 사용한다.
    const region = {
      stage1: String(req.query.stage1 || defaultStage1).trim(),
      stage2: String(req.query.stage2 || defaultStage2).trim(),
    };
    const data = await fetchHospitals(region);
    res.json(data); // 서버 응답에서 데이터를 json 형식으로 브라우저에게 보내준다(res)
  } catch (err) { // 에러가 나면 이곳으로
    console.error('Failed to fetch hospitals:', err.message); // 서버 콘솔에 에러 메시지를 띄운다 (Failed to fetch hospitals:+ 실제 받아온 에러 메세지 )
    res.status(502).json({ // 서버의 응답을 에러코드 502로 지정하고 브라우저에게 json 형식으로 보낸다
      error: '병원 정보를 가져오지 못했습니다.', 
      message: err.message,
    });
  }
});

module.exports = router;// 모듈내의 라우터 기능을 다른곳에서 사용할 수 있게 한다 
