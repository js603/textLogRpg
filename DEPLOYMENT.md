# 🚀 GitHub Pages 배포 가이드

이 가이드는 Text Log RPG 게임을 GitHub Pages에 배포하는 방법을 설명합니다.

## 📋 사전 준비

### 1. GitHub 저장소 생성
- GitHub에서 새 저장소를 생성 (공개 또는 비공개)
- 저장소 이름 예시: `copy-of-text-log-rpg_-the-survivor` 또는 원하는 이름

### 2. Vite 설정 확인
`vite.config.ts` 파일의 `base` 경로가 저장소 이름과 일치하는지 확인하세요:

```typescript
base: mode === 'production' ? '/저장소-이름/' : '/',
```

**예시:**
- 저장소 이름이 `my-rpg-game`이면 → `base: '/my-rpg-game/'`
- 저장소 이름이 `text-rpg`이면 → `base: '/text-rpg/'`

## 🔑 API 키 설정

### GitHub Secrets에 API 키 추가
1. GitHub 저장소 페이지로 이동
2. `Settings` → `Secrets and variables` → `Actions` 클릭
3. `New repository secret` 클릭
4. 다음 정보 입력:
   - Name: `GEMINI_API_KEY`
   - Secret: 실제 Gemini API 키 입력 (`.env.local` 파일의 값)
5. `Add secret` 클릭

> ⚠️ **중요**: API 키는 절대로 코드에 직접 포함하지 마세요!

## 📤 배포 방법

### 방법 1: GitHub에 푸시하여 자동 배포 (추천)

1. **Git 초기화 및 커밋**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **GitHub 원격 저장소 연결**
   ```bash
   git remote add origin https://github.com/사용자명/저장소-이름.git
   ```

3. **푸시하여 배포**
   ```bash
   git branch -M main
   git push -u origin main
   ```

4. **GitHub Pages 활성화**
   - GitHub 저장소 → `Settings` → `Pages`
   - Source: `GitHub Actions` 선택
   - 자동으로 배포가 시작됩니다!

5. **배포 확인**
   - `Actions` 탭에서 배포 진행 상황 확인
   - 완료되면 `https://사용자명.github.io/저장소-이름/` 에서 게임 플레이 가능

### 방법 2: 수동 배포

자동 배포가 작동하지 않는 경우:

1. **로컬에서 빌드**
   ```bash
   pnpm build
   ```

2. **gh-pages 설치**
   ```bash
   pnpm add -D gh-pages
   ```

3. **package.json에 배포 스크립트 추가**
   ```json
   "scripts": {
     "deploy": "gh-pages -d dist"
   }
   ```

4. **배포 실행**
   ```bash
   pnpm deploy
   ```

## 🔧 문제 해결

### 404 오류가 발생하는 경우
- `vite.config.ts`의 `base` 경로가 저장소 이름과 일치하는지 확인
- GitHub Pages 설정에서 Source가 올바른지 확인

### 빌드 실패
- API 키가 GitHub Secrets에 올바르게 추가되었는지 확인
- `.github/workflows/deploy.yml`의 브랜치 이름 확인 (`main` 또는 `master`)

### 스타일이 깨지는 경우
- 브라우저 콘솔에서 404 에러 확인
- `base` 경로 설정 재확인

## 📍 배포 후 URL

배포가 완료되면 다음 URL에서 게임을 플레이할 수 있습니다:

```
https://사용자명.github.io/저장소-이름/
```

**예시:**
- 사용자명: `johndoe`, 저장소: `my-rpg` → `https://johndoe.github.io/my-rpg/`

## 🔄 업데이트 방법

코드를 수정한 후:

```bash
git add .
git commit -m "업데이트 내용"
git push
```

자동으로 재배포됩니다!

## ⚠️ 주의사항

1. **API 키 보안**: 프론트엔드에서 API 키를 사용하므로 다른 사람이 악용할 수 있습니다. 
   - 무료 사용량 제한 설정 권장
   - Google Cloud Console에서 API 키 제한 설정 (HTTP Referrer 제한)

2. **첫 배포 시간**: 첫 배포는 5-10분 정도 걸릴 수 있습니다.

3. **캐시 문제**: 변경사항이 즉시 반영되지 않으면 브라우저 캐시를 지우세요 (Ctrl+F5).

## 🎮 완료!

이제 전 세계 어디서든 게임을 플레이할 수 있습니다!
