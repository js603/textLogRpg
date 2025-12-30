# 🎮 Text Log RPG - Quick Deployment Summary

## ✅ 배포 준비 완료!

모든 파일이 준비되었습니다. 이제 GitHub Pages에 배포할 수 있습니다.

## 🚀 빠른 배포 단계 (5분 소요)

### 1️⃣ GitHub 저장소 준비
```bash
# 새 저장소를 GitHub에서 생성하세요
# 예: https://github.com/사용자명/text-log-rpg
```

### 2️⃣ Vite 설정 업데이트 (중요!)
**`vite.config.ts` 파일의 6번째 줄을 확인하세요:**
```typescript
base: mode === 'production' ? '/저장소-이름/' : '/',
```
**저장소 이름으로 변경하세요!** 예:
- 저장소가 `text-log-rpg`면 → `'/text-log-rpg/'`
- 저장소가 `my-game`이면 → `'/my-game/'`

### 3️⃣ GitHub Secrets 설정
1. GitHub 저장소 → Settings → Secrets and variables → Actions
2. New repository secret 클릭
3. 추가:
   - Name: `GEMINI_API_KEY`
   - Secret: `.env.local` 파일의 API 키 복사하여 붙여넣기

### 4️⃣ Git 푸시
```bash
git init
git add .
git commit -m "Initial deployment"
git remote add origin https://github.com/사용자명/저장소-이름.git
git branch -M main
git push -u origin main
```

### 5️⃣ GitHub Pages 활성화
1. GitHub 저장소 → Settings → Pages
2. Source: **GitHub Actions** 선택
3. 완료! Actions 탭에서 배포 진행 확인

## 🌐 배포 후 URL
```
https://사용자명.github.io/저장소-이름/
```

## 📚 자세한 가이드
더 자세한 내용은 `DEPLOYMENT.md` 파일을 참고하세요.

---

**배포 완료 시간**: 첫 배포는 약 3-5분 소요됩니다.
