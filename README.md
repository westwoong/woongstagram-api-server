# CURD Backend API

## 🔧 Stack
![Language](https://img.shields.io/badge/Code%20Language-JavaScript-yellow.svg) <br>
![File Upload](https://img.shields.io/badge/ORM-Sequelize-lightgrey.svg) <br>
![Database](https://img.shields.io/badge/Database-MySQL-blue.svg) <br>
![File Upload](https://img.shields.io/badge/File%20Upload-Multer-orange.svg) <br>
![Web Framework](https://img.shields.io/badge/Web%20Framework-Express-brightgreen.svg) <br>
![CodeDeploy](https://img.shields.io/badge/CodeDeploy-AWS%20Elastic%20Beanstalk-skyblue)



## 📚 Description
- 인스타그램 주요 기능을 Express로 구현했습니다

## 📂 Source Structure
```markdown
src
├── config
├── controllers
├── errors
├── middleware
├── models
├── repository
├── routes
├── service
│   └── validators
└── utils
```
## 📝 Structure Details

### config
서버를 구동하는데 필요한 설정 파일을 분리하였습니다.

### controllers
각 서비스의 컨트롤러로, 사용자의 요청을 처리하고 응답을 반환합니다.

### errors
사용자의 잘못된 입력에 대한 HTTP 에러 코드 클래스 파일들을 분리하였습니다.

### middleware
인가와 예외처리 등 공통적으로 사용되는 부분을 분리하였습니다.

### models
각 테이블의 스키마 정의를 분리하여 관리하고, ERD 설계가 진행됩니다.

### repository
DB와 상호작용하는 함수 코드를 테이블 별로 분리하여 재사용성을 높였습니다.

### routes
사용자의 요청을 각 컨트롤러로 분배하고, 필요한 매개변수를 추출하여 컨트롤러에 전달합니다.

### service
컨트롤러와 라우터로부터 받은 사용자의 요청에 대해 실제 작업 (비지니스 로직)을 수행하여 데이터를 처리합니다.

### service/validators
각 서비스 로직에 대해 입력데이터의 유효성을 사전에 검증하는 로직을 분리하였습니다.

### utils
로깅 등 공통적으로 사용하는 보조 기능을 분리하였습니다.

---
## 💡 main feature
- 회원가입 및 인증 (JWT, refreshToken)
- 게시글 작성 및 조회 (페이지네이션 추가)
  - 게시글 조회 시 게시물작성자의 닉네임,게시글에 달린 댓글&좋아요 수, 최근댓글(댓글작성자의 닉네임, 댓글 내용) 출력
- 댓글 작성 및 조회
- 게시글&댓글 수정&삭제 (본인의 게시물&댓글만 수정&삭제 가능)
- 사진&파일 업로드
- 팔로우, 언팔로우 기능
- 게시물 좋아요 기능
- 마이페이지(팔로워&팔로잉 목록) 조회


## 📑 posting
- [코드를 함수로 분리하는 이유](https://westwoong.notion.site/fb5200790fe842aa8e78d5079f61bf65?pvs=4)
- [N+1 문제](https://westwoong.notion.site/ORM-N-1-e2a119e72c3e4adb91f7b49aac698b6a?pvs=4)

