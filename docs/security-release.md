# 보안 변경 릴리스 절차

## Draft 릴리스 전 필수 조건

이 구현에서는 운영/외부 DB, 마이그레이션, seed, 실제 SMTP/API 키, 원격 설정 변경, 수동 배포를 사용하지 않았다. 아래 조건은 담당자가 별도 승인된 작업으로 준비해야 한다. **조건을 충족하기 전에는 draft를 유지한다.**

1. Preview DB를 운영과 분리하고 대상 DB·백업/복구·담당자·승인·적용 순서를 확인한다. `Token.attempts`와 새 `LoginBudget` 테이블 및 `User_email_lower_key` 인덱스가 필요하다. 파일은 `20261025120000_add_token_attempts`, `20261025150000_login_delivery_budget`에 있다. 이 PR에서 애플리케이션 마이그레이션을 실행하지 않았다. 격리된 로컬 PG 테스트는 무작위 스키마의 최소 fixture만 만든다.
2. 기존 이메일을 읽기 전용으로 사전 점검한다. 아래 충돌이 있으면 릴리스를 중단하고 각각의 소유권을 확인하여 별도 승인된 절차로 해결한다. 계정을 자동으로 합치거나 임의로 선택/소문자 덮어쓰기하지 않는다. 새 인덱스 생성도 충돌 시 실패한다. 런타임은 같은 소문자 이메일에 두 계정이 발견되면 로그인을 거부한다. 기존 계정의 ID와 세션 신뢰는 유지한다.

   ```sql
   SELECT lower(email) AS canonical_email, count(*) AS accounts
   FROM "User" WHERE email IS NOT NULL
   GROUP BY lower(email) HAVING count(*) > 1;
   ```

   이메일 목록에는 개인정보가 있으므로 공개 로그에 남기지 않는다. 추가로 기존 주소를 `normalizeEmail` 규칙과 비교해 공백, 비ASCII, 표시이름/목록/주석, 잘못된 dot-atom 주소를 확인한다. 이 주소들은 새 로그인에서 지원하지 않으므로 별도 소유 확인·지원 절차가 필요하다. 소문자화는 이 서비스의 identity 정책이며 모든 메일 공급자의 local-part 의미가 같다는 주장이 아니다. Prisma schema가 표현하지 못하는 함수 인덱스이므로 향후 schema 변경 시 유지 여부를 확인한다.
3. 모든 미적용 마이그레이션과 `_prisma_migrations` 이력, 기존 baseline 필요 여부를 확인한다. `migrate deploy`는 이번 파일만 실행하지 않는다. Vercel/CI 밖의 승인된 수동 작업만 아래 명령을 사용할 수 있다. 이 구현에서는 실행하지 않았다.

   ```sh
   CONFIRM_MANUAL_MIGRATION=yes yarn release:migrate
   ```

4. 담당자가 실제 Turnstile 위젯과 비밀키를 보안 채널에서 설정한다. `NEXT_PUBLIC_TURNSTILE_SITE_KEY`(빌드 시), `TURNSTILE_SECRET_KEY`(서버), `TURNSTILE_HOSTNAME`(프로토콜/경로 없는 정확한 호스트명)이 필요하다. 위젯 action은 `login`이다. 알려진 Turnstile 테스트 키는 서버가 거부한다. **설정 누락·오류·provider 장애는 발급을 거부한다.** 기존 유효 토큰의 확인과 로그인 세션은 이 설정에 의존하지 않는다. 실제 키를 임의 생성하거나 이 PR/로그에 넣지 않는다. [서버 검증 계약](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/).
5. IP 신뢰 경계를 명시한다. Vercel에서는 `OTP_IP_SOURCE=vercel`과 실제 `VERCEL=1` 환경에서 플랫폼의 `x-vercel-forwarded-for` 한 개 IP만 사용한다. 임의 `x-forwarded-for`, 목록/배열은 거부한다. Vercel 외부 서버에서 이 모드를 흉내 내면 헤더를 위조할 수 있으므로 사용하지 않는다. 직접 연결 서버만 `OTP_IP_SOURCE=socket`을 사용한다. 프록시 뒤 socket 모드는 프록시 IP 전체가 한 예산을 공유한다. 공개 origin 우회가 없고 플랫폼이 헤더를 덮어쓰는 경로인지 담당자가 확인한다. 모드 미설정/잘못된 IP는 발급 거부다. [Vercel 요청 헤더 계약](https://vercel.com/docs/headers/request-headers#x-vercel-forwarded-for).
6. 아래 고정 한도(모든 서버가 같은 DB/키 사용)가 실제 SMTP 할당량보다 낮은지, 정상 트래픽/NAT 환경에서 수용 가능한지 결정한다. 코드 변경 없이 무제한으로 여는 우회 설정은 없다. WAF의 요청률 제한, 발급 실패/예산 소진/공급자 반송 알림과 지원 절차도 준비한다. 키 교체는 기존 IP HMAC 예산을 분리하지만 전역 예산은 유지한다.
7. 스키마·설정 준비 후 격리된 환경에서 실제 위젯, SMTP, 이메일 요청/확인/재사용 거부, 프로필 수정, 구매자/판매자 채팅을 확인한다. 이 구현에서 브라우저 E2E/실제 Turnstile/SMTP/원격 Preview와 운영 스키마는 검증하지 않았다. 빌드 성공은 이 조건을 대체하지 않는다. 롤백은 추가 스키마를 유지할 수 있으나 이전 코드의 보안 결함이 복귀하므로 별도 판단한다.

## 로그인 동작과 가용성 tradeoff

- 단일 ASCII dot-atom 이메일만 받는다. local-part 64자/전체 254자, 단일 @, 정상 도메인 label을 검증하고 trim/소문자화한다. 다중 수신자, 표시이름, 주석, 따옴표, domain literal과 혼합 전화 입력을 거부한다. 조회/신규 저장/전송은 같은 정규화 주소를 쓰고 Nodemailer에는 `{ address, name: "" }` 객체를 넘긴다. 기존 대소문자 혼재 계정 하나는 같은 ID로 조회하며 두 개면 fail-closed다. 공급자별 `+tag`, 점/별칭 통합은 하지 않는다.
- 프로필 API는 email/phone 필드가 있으면 다른 수정 전에 400으로 거부한다. UI에서 identity 수정 입력을 제거했다. 이름/아바타 수정은 유지한다. 미인증 새 이메일을 저장하지 않으며 기존 세션 ID를 바꾸지 않는다. 과거에 이미 이메일을 선점당한 계정이나 과거 세션을 자동 식별/정리하는 복구 기능은 없다. 사전 사고 조사·지원 절차가 별도로 필요하다.
- 코드 공간은 32^12 = 2^60 = 1,152,921,504,606,846,976개다. `crypto.randomInt(32)`로 각 문자를 독립 생성한다. 대문자 A–Z 중 I/O를 제외하고 2–9를 사용하며 UI/서버/메일이 12자리 형식을 공유한다. UI는 붙여넣은 소문자를 대문자로 바꿔 제출한다. 토큰당 최대 5회다.
- 균일한 코드와 토큰마다 서로 다른 최대 5회 추측을 가정하면 N개 토큰 공격의 누적 성공 확률은 **1 - (1 - 5/2^60)^N**, 상한은 **5N/2^60**이다. 대략값은 `-expm1(N * log1p(-5/2^60))`으로 계산한다. 공격 시작 시 pending 토큰이 없고 모든 전역 발급 예산을 한 계정에 쓰는 보수적 경우, 30일 15,000개 토큰/75,000회 추측은 약 6.5052×10^-14(0.0000000000065052%)다. 시작 전에 보유한 유효 토큰은 N에 더한다. 무기한 공격의 확률이 0이라는 뜻은 아니다. 메일함/세션/비밀키 탈취는 이 추측 모델에 포함하지 않는다.
- 이메일별 발급 cooldown/상한을 제거했다. 공격자가 피해자 이메일만 알아서 그 이메일 전용 슬롯을 계속 점유하는 R1-1 경로가 없다. 다른 브라우저 발급은 기존 유효 토큰·시도 횟수를 변경하지 않는다. 쿠키 재생성은 IP/전체 예산을 초기화하지 않는다.
- Turnstile 서버 검증(5초 timeout, success/hostname/action 확인)이 성공해야 DB 예산을 예약한다. provider의 단일 사용 토큰 계약에 의존하여 replay를 거부한다. 검증 실패는 User/Token/예산 행을 만들지 않고 메일도 보내지 않는다. 실제 provider를 사용한 검증은 릴리스 전 조건이다.
- `LoginBudget` 한 행을 FOR UPDATE + ReadCommitted로 잠그고 **잠금 획득 후 DB 시각**으로 최근 예약을 계산한다. 전역 **10회/60초, 100회/60분, 500회/24시간**, IP별 **5회/10분, 30회/24시간**의 rolling 한도를 적용한다. IP는 HMAC으로 저장하고 IPv6 표기/IPv4-mapped 주소를 정규화한다. 예산 행은 1개, 최근 이벤트는 최대 500개다. 예약은 User/Token 생성/SMTP 호출 전에 확정하고 실패/로그인 성공에도 환불하지 않는다. 실제 공급자의 배달 시각/재시도 횟수에 대한 상한이 아니라 애플리케이션 발송 예약 한도다.
- 이에 따라 fresh User/Token 생성도 전역 예약 수 이하로 제한된다. 여러 주소/별칭/쿠키로 DB 행이나 발송량을 무제한 늘리는 기존 경로를 줄였다. 누적 계정 수는 하루 최대 500개씩 계속 증가할 수 있어 보존 정책은 여전히 필요하다. 봇 방어가 공격자를 완전히 막는다는 보장은 없다.
- **공격자가 봇 검증을 통과하고 전역 예산을 소진하면 정상 새 발급도 차단된다.** 같은 NAT/IP 사용자는 IP 예산을 공유한다. IPv6 주소 변경/프록시/여러 IP는 IP 한도를 우회할 수 있으나 전역 상한은 유지된다. 표적 메일폭탄도 완전 차단하지 않는다. 최악의 경우 한 피해자에게 전역 예산 전체(24시간당 최대 500회 예약)가 집중될 수 있다. 기존 유효 토큰 확인은 발급 예산/Turnstile과 분리되어 계속 가능하다. 이 가용성·메일 괴롭힘 tradeoff를 수용할지 담당자가 릴리스 전에 판단해야 한다.
- 싱글턴 잠금의 DB 부하, /confirm 무효 요청, provider 검증 호출 비용까지 이 예산이 제한하지는 않는다. WAF/인프라 요청 한도는 별도로 필요하다. 전역적으로 안전하거나 DoS가 불가능하다고 주장하지 않는다.
- User 행 잠금/ReadCommitted, 잠금 후 clock_timestamp, 정확한 tokenId/userId/issuedAt와 256비트 비공개 browser binding, HMAC 저장, DB 시각 10분 만료, 토큰별 5회/단일 소비를 유지했다. 네트워크 호출은 트랜잭션 밖이다. 전송/세션 저장 실패 시 해당 토큰을 소진한다. SMTP/DB commit의 분산 원자성은 없으며 오래된 토큰은 같은 사용자의 다음 발급에서 정리한다.
- Naver 465 implicit TLS, 인증서/호스트 검증, TLS 1.2 이상과 유한 timeout을 유지했다. 전화/SMS 인증은 지원하지 않는다. API 오류 응답/로그는 provider/DB 오류 객체를 출력하지 않는다.

## 자동 실행 및 검증

- `build`는 `prisma generate && next build`다. `vercel.json`의 build/install/ignore 명령은 유지했다. [Vercel 문서](https://vercel.com/docs/project-configuration/vercel-json)에 따른 표준 Git 빌드 경로에 자동 migration/seed가 없다. 다른 브랜치/이전 커밋/외부 배포 경로에 대한 보장은 아니다. 원격 설정을 조회·변경하지 않았다.
- `.github/workflows/security.yml`은 임시 PostgreSQL 16 서비스의 loopback 비기본 포트에서 `yarn test:ci`를 필수 실행한다. CI 또는 REQUIRE_LOCAL_OTP_TESTS에서 전용 URL이 없으면 실패한다. URL은 loopback, DB 이름 carrot_otp_test, 비기본 명시 포트, 추가 query 없음만 허용한다. 운영 DATABASE_URL로 fallback하지 않는다. 테스트는 무작위 fixture 스키마를 만들고 삭제하며 application migration/seed는 호출하지 않는다. CI build는 접속 불가한 더미 DATABASE_URL을 사용한다.
- 개발자의 `yarn test`는 명시적인 LOCAL_OTP_TEST_DATABASE_URL이 없으면 PG 테스트를 건너뛴다. 전체 검증은 격리된 로컬 PG를 준비한 뒤 `LOCAL_OTP_TEST_DATABASE_URL=... yarn test:ci`로 수행한다.
- 로컬 PG에서 동시 발급/소비/시도, DB 시계와 ±24시간 앱 시계 차이, 잠금 대기 만료, 전역/IP 동시 예산, 시간별/일별 한도, 주소 충돌 fail-closed, 실제 enter/confirm 핸들러 결합을 검증했다. JS 시계 사용 변이와 예산 행 잠금 제거 변이는 회귀 테스트가 실패한다. 이전 코드를 복원한 발급/주소 파싱/프로필 변경/6자리 코드 회귀도 실패함을 확인했다.
- 기존 TS 설정은 tests를 제외하므로 Vitest로 테스트를 실행하고 앱 코드는 tsc/lint/build로 검사한다. Prisma 4.12 종료 훅은 Next build worker 종료 시 ERR_INVALID_ARG_TYPE를 출력할 수 있으며 기존 도구 호환성 문제다. 무관한 major 업그레이드는 하지 않았다.
- Next 15.5.28/sharp 0.35.5/nodemailer 10.2.1과 lockfile을 유지했다. 이전 라운드의 audit 잔여 경로(critical 0/high 66/moderate 35/low 10)는 고유 advisory 수가 아니며 개발 도구가 포함된다. 이번 라운드에서 advisory/audit를 다시 조사하지 않았고 모든 취약점 제거를 주장하지 않는다.
