const express = require('express'); //  express 공간 할당 = express라이브러리를 불러와서 저장한다(서버를 만들 수 있는 도구를 저장해든다)
const cors = require('cors'); //  cors 공간할당 = cors 라이브러리를 불러와서 저장한다(다른 포트에서 요청이 들어와도 허용해주는 도구)
const path = require('path');//(폴더 경로를 안전하게 이어줌)
const { port } = require('./src/config/env'); // env파일내 저장한 포트값을 들고와서 저장한다(서버가 몇번 포트에서 열릴지 가져오는 도구)
const hospitalsRouter = require('./src/routes/hospitals'); // hospitalsRouter 공간할당 = 해당경로에 있는 파일을 들고와서  저장한다(api요청을 처리하는 길 안내도구)

const app = express(); // app 공간할당 = express 도구함을 실행한다

app.use(cors()); //  app내의 cors 도구함을 사용한다
app.use(express.json()); //app내의 express도구함을 사용한다 브라우저가 보낸 값을 서버가 이해할 수 있게 json 값으로 받는다
app.use(express.static(path.join(__dirname, 'public'))); // app내의 express도구함을 사용한다  퍼블릭 파일을 브라우저가 볼 수 있도록 제공한다

app.use('/api/hospitals', hospitalsRouter); // 앱내의 /api/hospitals' 경로에서 들어오는 요청은 hospitalsRouter 로 넘긴다

app.listen(port, () => {  // 앱 내에서 포트를 읽어오고 서버를 포트 번호에서 실행한다 그 포트를 기준으로 서버 콘솔에 해당 문구를 띄운다
  console.log(`Server running at http://localhost:${port}`);
});
