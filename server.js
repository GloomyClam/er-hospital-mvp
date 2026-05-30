const express = require('express'); //  express 공간 할당 = express라이브러리를 불러와서 저장한다(쓸수 있는 도구를 저장해든다)
const cors = require('cors'); //  cors 공간할당 = cors 라이브러리를 불러와서 저장한다
const path = require('path');
const { port } = require('./src/config/env'); // env파일내 저장한 포트값을 들고와서 저장한다
const hospitalsRouter = require('./src/routes/hospitals'); // hospitalsRouter 공간할당 = 해당경로에 있는 파일을 들고와서 

const app = express(); // app 공간할당 = express 을 실행한다

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/hospitals', hospitalsRouter);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
