# 보안 변경 릴리스 절차

## 머지·릴리스 전 필수 조건

이 PR은 애플리케이션 마이그레이션을 실행하지 않는다. 새 로그인 코드는 `Token.attempts INTEGER NOT NULL DEFAULT 0`에 의존한다. 담당자는 **머지 전에** 대상 DB, 백업/복구 절차, 변경 승인, 적용 순서와 아래 수동 작업의 담당자를 확인해야 한다. 새 코드를 서비스하기 **전에** `20261025120000_add_token_attempts`를 승인된 별도 작업으로 적용해야 한다. 기존 애플리케이션은 이 추가 컬럼을 사용하지 않으므로 스키마를 먼저 준비할 수 있다.

1. Preview에는 운영과 분리된 DB를 사용한다. 이 PR은 환경 변수·원격 설정을 읽거나 변경하지 않는다. 따라서 현재 Preview DB의 격리는 검증하지 않았다.
2. 담당자가 승인된 대상 DB를 로컬 보안 환경에 설정하고, 미적용 마이그레이션 전체를 검토한다. `prisma migrate deploy`는 이번 파일뿐 아니라 모든 미적용 파일을 실행하므로, 기존 마이그레이션 이력이 일치하는지 확인해야 한다. DB URL이나 비밀번호를 채팅·PR·로그에 붙이지 않는다.
3. Vercel/CI 밖의 별도 수동 릴리스 작업에서만 다음 명령을 실행한다. 아래 명령은 이 PR 구현·검증 중 실행하지 않았다.

   ```sh
   CONFIRM_MANUAL_MIGRATION=yes yarn release:migrate
   ```

4. 마이그레이션 적용을 확인한 뒤 새 애플리케이션을 릴리스하고 격리된 환경에서 이메일 요청·확인·재사용 거부와 구매자/판매자 채팅을 점검한다. 실제 SMTP 전송과 원격 Preview 검증은 이 구현에서 수행하지 않았다.
5. 롤백 시 애플리케이션을 이전 버전으로 돌릴 수 있으며 추가 컬럼은 유지한다. 이 PR이 기존 로그인 취약점을 수정하므로 이전 버전 복귀는 보안상 별도 판단이 필요하다.

**스키마가 준비되지 않은 Preview에서도 빌드는 성공할 수 있지만 로그인 API는 실패한다.** 빌드 성공은 DB 준비 완료를 의미하지 않는다. Preview 성공을 위해 운영 DB에 마이그레이션을 적용하면 안 된다.

## 자동 실행 경로

- `yarn build`: `prisma generate && next build`만 실행한다. DB 변경·seed는 없다.
- `vercel.json`: `buildCommand`는 `yarn build`, `installCommand`는 고정 lockfile 설치, `ignoreCommand`는 `exit 1`로 고정한다. [Vercel 공식 문서](https://vercel.com/docs/project-configuration/vercel-json)는 이 세 필드가 각각 대시보드 Build Command, Install Command, Ignored Build Step보다 우선한다고 명시한다. 기존 대시보드 명령에 마이그레이션이 포함되어 있어도 이 체크아웃의 설정이 우선한다. 빌드 생략 최적화는 비활성화된다.
- 저장소에 다른 Vercel 설정·GitHub Actions·설치/빌드 전후 훅은 없다. `dev`/`start`는 Next만 실행한다. 의존성 설치 훅도 확인했으며 Prisma Client 설치는 코드 생성만 수행하고 엔진 설치는 바이너리를 준비한다. 테스트는 application migrate/seed 명령을 실행하지 않는다.
- `release:migrate`만 마이그레이션을 시작한다. 수동 확인 변수 없이는 거부하며 `VERCEL` 또는 `CI`가 설정된 경우에도 거부한다. 자동 훅에서 호출하지 않는다.
- `prisma.seed`는 명시적인 seed 명령을 위한 기존 설정이다. 자동 경로에서 호출하지 않는다.
- 이 보장은 이 저장소의 표준 Vercel 설정을 사용하는 배포에 관한 것이다. 별도 외부 시스템이나 다른 소스/설정으로 실행하는 작업은 조사하지 않았다.

## 로그인 보안 동작과 남은 제한

- 이메일만 지원한다. 전화번호 및 이메일+전화번호 요청은 DB 쓰기·발송 전에 400으로 거부한다. Twilio 의존성과 호출을 제거했다.
- Naver SMTP는 공식 안내의 465 포트, implicit TLS, 인증서/호스트 검증과 TLS 1.2 이상을 사용한다. [Naver 안내](https://help.naver.com/service/30003/contents/21341?lang=ko&osType=PC), [Nodemailer 문서](https://nodemailer.com/smtp).
- 토큰은 `crypto.randomInt`의 100000–999999 코드이며, 사용자 ID·브라우저의 무작위 256비트 binding·코드의 HMAC만 DB에 저장한다. 밀봉된 세션 쿠키는 정확한 tokenId, userId, binding, 발급 시각을 가진다. 기존 `userId+issuedAt` 쿠키는 재요청해야 한다. `OTP_SECRET` 또는 `SESSION_PW`는 32자 이상이어야 하며 운영에서는 충분한 엔트로피를 가진 비밀값을 사용한다.
- PostgreSQL `User` 행의 `SELECT ... FOR UPDATE`와 ReadCommitted 트랜잭션이 같은 사용자의 발급·시도·소비를 직렬화한다. 잠금 획득 후 DB 시각을 읽어 10분 만료를 판정하며, 정확한 토큰만 확인한다. SMTP 호출은 잠금 밖에서 실행한다.
- 최대 5회 확인한다. 성공한 토큰은 attempts=5로 소비 처리하고 기록을 남긴다. 전송 실패도 attempts=5로 잠그며 발급 기록을 유지한다. 동시 정답은 한 요청만 성공한다. 세션 저장에 실패하면 재요청해야 한다.
- 재발급 간격은 사용자당 60초, 발급 한도는 최근 10분당 5회다. 이전의 1시간 한도를 10분으로 줄였고, 다른 브라우저가 새 토큰을 요청해도 이미 발급된 토큰·시도 횟수를 변경하지 않는다. 성공·전송 실패로 한도를 초기화할 수 없다. 만료된 기록은 같은 사용자의 다음 발급에서 정리된다. 비활성 사용자의 과거 기록은 별도 운영 보존 정책이 필요하다.
- 이메일 식별자에 대한 제한은 공격자와 소유자를 인증 전에 구별하지 못한다. 공격자가 새 발급을 최대 10분 막을 수 있고, 반복 공격이면 계속 지연시킬 수 있다. 이미 보유한 유효 토큰의 확인은 영향을 받지 않는다. 900000개 코드 공간과 각 5회 발급분의 총 25회 시도는 균등 추측 시 약 0.0028%의 성공 확률을 준다. 발급은 최근 10분 창으로 제한하지만 확인 시도는 토큰별 한도이므로, 이전 창의 미만료 토큰까지 포함한 임의의 10분간 확인 횟수가 25회 이하라는 보장은 아니다.
- IP/전체 서비스/메일 공급자 단위 발송 한도·봇 방어는 구현하지 않았다. 여러 주소·메일 별칭으로 전체 발송량/공급자 할당량을 소모할 위험이 남는다. 추가 통제는 신뢰 경계를 확인한 플랫폼/공급자에서 설정해야 한다. 애플리케이션은 `X-Forwarded-For` 등 위조 가능한 헤더를 신뢰해 제한을 우회시키지 않는다.
- 응답·애플리케이션 오류 로그는 DB/SMTP 오류 객체를 출력하지 않는다. 기존 미들웨어의 쿠키 존재 검사는 로그인 화면 이동만 결정하며 API 인증은 `session.user`를 확인한다.

## 검증과 의존성 상태

- Next 15.5.28, sharp 0.35.5는 [2026-10-14 공식 보안 릴리스](https://nextjs.org/blog/nextjs-security-update-october-14-2026)에 명시된 수정 버전이다. Pages Router를 유지한다. App Router 전용 advisory의 적용 여부와 별도로 Image Optimization 수정 버전을 사용한다.
- 프로젝트 설치 요구사항은 Node 20.19+ / 22.12+ / 24+다(Vite 테스트 도구 포함). Node 20.20.2/22.23.1에서 더미 DB/메일/Cloudflare 설정으로 lockfile 설치와 `yarn build`를 확인했다. Prisma 4.12의 종료 훅이 Next worker의 SIGINT 종료 중 `ERR_INVALID_ARG_TYPE`를 출력하지만 빌드는 종료 코드 0으로 완료된다. 이 PR은 Prisma 대규모 업그레이드를 포함하지 않는다.
- `yarn test`는 단위 테스트와 로컬 SMTP 인증서 거부 테스트를 실행한다. PostgreSQL 테스트는 아래 변수를 명시했을 때만 실행한다. 운영 `DATABASE_URL`을 테스트 DB로 사용하지 않는다.

   ```sh
   LOCAL_OTP_TEST_DATABASE_URL=postgresql://carrot_test@127.0.0.1:55439/carrot_otp_test yarn test
   ```

  DB 이름 `carrot_otp_test`, loopback 호스트와 기본값이 아닌 명시적 포트를 강제한다. 임시 PostgreSQL 인스턴스를 별도로 준비해야 한다. 테스트는 무작위 스키마에 최소 User/Token 테이블을 생성하고 종료 시 제거한다. 애플리케이션 마이그레이션이나 seed는 실행하지 않는다. 20개 동시 발급/시도/소비와 잠금 대기 중 만료를 실제 Prisma 4.12/PostgreSQL에서 확인한다.
- 기존 TypeScript 설정은 tests를 제외한다. 테스트는 Vitest 실행으로 검증하며 애플리케이션은 tsc와 Next 빌드로 검사한다. 브라우저 E2E·실제 메일·원격 CI/Preview·운영 스키마 검증은 수행하지 않았다.
- Yarn audit에는 critical 0, high 66, moderate 35, low 10의 의존성 경로가 남는다(고유 advisory 개수가 아니며 개발 의존성도 포함). Next 내부 PostCSS, Tailwind/PostCSS/ESLint 도구 체인, 저장소의 블로그 파싱용 gray-matter/js-yaml, remark/ts-node의 diff, iron-session의 cookie가 포함된다. 블로그/CSS/설정은 현재 저장소 파일을 입력으로 사용하며 외부 사용자가 업로드하는 파싱 경로는 없다. 이를 완전한 취약점 제거로 표현하지 않는다. 강제 버전 override/일괄 major 업그레이드는 적용하지 않았다.
