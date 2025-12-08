# 바닐라js로 구현한 게시판

바닐라 자바스크립트(Vanilla JavaScript)로 구현한 커뮤니티 게시판 프로젝트입니다. 프레임워크 없이 순수 자바스크립트를 사용하여 SPA(Single Page Application)와 유사한 구조로 컴포넌트 및 페이지 로직을 분리하여 개발되었습니다.

## 🎥 시연 영상

![시연 영상](assets/게시판과제시연영상.mp4)


## 🚀 주요 기능

### 1. 회원 관리
- **회원가입/로그인**: 이메일, 비밀번호, 닉네임, 프로필 이미지를 통한 회원가입 및 로그인.
- **프로필 관리**: 닉네임 및 프로필 이미지 수정 기능.
- **비밀번호 변경**: 현재 비밀번호 확인 없이 새로운 비밀번호로 변경.
- **회원 탈퇴**: 계정 삭제 기능.

### 2. 게시판 (Board)
- **게시글 목록**: 무한 스크롤(Infinite Scroll)을 통한 게시글 목록 조회.
- **게시글 상세**: 게시글 내용, 작성자 정보, 조회수/좋아요 수 확인.
- **게시글 작성/수정/삭제**: 이미지 첨부가 가능한 게시글 작성 및 수정, 삭제 기능.
- **좋아요**: 게시글에 대한 좋아요 토글 기능.

### 3. 댓글 (Comments)
- **댓글 목록**: 게시글에 달린 댓글 조회 (작성자 프로필 이미지 표시).
- **댓글 작성/수정/삭제**: 댓글 CRUD 기능 구현.

### 4. 기타
- **AI 채팅**: AI 모델과 대화할 수 있는 채팅 기능 (스트리밍 지원).
- **반응형 디자인**: 모바일 및 데스크탑 환경 지원.

## 🛠 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Vanilla CSS (BEM 방법론 적용, CSS Variables 활용)
- **API**: Fetch API를 이용한 RESTful API 통신
- **Module System**: ES Modules (`import`/`export`)

## 📂 프로젝트 구조

```
board-front/
├── index.html          # 메인 페이지 (게시글 목록)
├── login.html          # 로그인 페이지
├── signup.html         # 회원가입 페이지
├── post.html           # 게시글 상세 페이지
├── write.html          # 게시글 작성/수정 페이지
├── profile.html        # 프로필 수정 페이지
├── password.html       # 비밀번호 변경 페이지
├── chat.html           # AI 채팅 페이지
├── assets/
│   └── css/            # 전역 및 페이지별 CSS 파일
├── src/
│   ├── api/            # API 통신 모듈 (api.js)
│   ├── components/     # 공통 UI 컴포넌트 (header.js 등)
│   ├── pages/          # 페이지별 비즈니스 로직 (board.js, post.js 등)
│   └── utils/          # 유틸리티 함수 및 상수 (utils.js, constants.js)
└── README.md           # 프로젝트 문서
```

## ⚙️ 설정 및 실행 방법

### 1. API 서버 설정
`src/utils/constants.js` 파일에서 백엔드 API 주소를 설정할 수 있습니다.

```javascript
// src/utils/constants.js
export const BASE_URL = 'http://localhost:8001'; // 백엔드 서버 주소
```

### 2. 실행
이 프로젝트는 정적 파일로 구성되어 있으므로, 간단한 로컬 웹 서버를 통해 실행할 수 있습니다.

**Python 사용 시:**
```bash
python3 -m http.server 3000
```

**VS Code Live Server 확장 프로그램 사용 시:**
`index.html` 파일을 우클릭하여 "Open with Live Server" 선택.

브라우저에서 `http://localhost:3000`으로 접속하여 확인합니다.

## 🎨 디자인 시스템

- **색상**: 보라색(`--color-primary`)을 메인 컬러로 사용하여 깔끔하고 모던한 느낌을 줍니다.
- **UI 요소**: 둥근 모서리(`border-radius`)와 부드러운 그림자(`box-shadow`)를 사용하여 친근한 사용자 경험을 제공합니다.