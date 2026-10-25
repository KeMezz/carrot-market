import { NextPage } from "next";
import { useEffect, useRef, useState } from "react";
import FilledBtn from "@components/atom/filled-btn";
import TextInput from "@components/atom/text-input";
import { useForm } from "react-hook-form";
import useMutation from "@libs/client/useMutation";
import { ResponseType } from "@libs/server/withHandler";
import { useRouter } from "next/router";
import Head from "next/head";
import Script from "next/script";

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: Record<string, unknown>) => string;
      reset: (id: string) => void;
      remove: (id: string) => void;
    };
  }
}

const Enter: NextPage = () => {
  const [enter, { loading, data, error }] = useMutation<ResponseType>("/api/users/enter");
  const [confirm, { loading: confirming, data: confirmed }] = useMutation<ResponseType>("/api/users/confirm");
  const { register, handleSubmit } = useForm<{ email: string }>();
  const { register: registerCode, handleSubmit: submitCode } = useForm<{ token: string }>();
  const [ready, setReady] = useState(false);
  const [challenge, setChallenge] = useState("");
  const container = useRef<HTMLDivElement>(null);
  const widget = useRef<string>();
  const router = useRouter();
  const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!ready || !sitekey || !container.current || data?.success || !window.turnstile) return;
    widget.current = window.turnstile.render(container.current, {
      sitekey, action: "login", callback: setChallenge,
      "expired-callback": () => setChallenge(""), "error-callback": () => setChallenge(""),
    });
    return () => { if (widget.current) window.turnstile?.remove(widget.current); };
  }, [ready, sitekey, data?.success]);
  useEffect(() => {
    if (data || error) {
      setChallenge("");
      if (!data?.success && widget.current) window.turnstile?.reset(widget.current);
    }
  }, [data, error]);
  useEffect(() => { if (confirmed?.success) router.push("/?page=1"); }, [confirmed, router]);

  return <>
    <Head><title>로그인 | 캐롯마켓</title></Head>
    {sitekey ? <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" onReady={() => setReady(true)} /> : null}
    <div className="h-48 flex flex-col justify-center items-center text-center text-3xl gap-2">
      <p>🥕</p><h1 className="font-bold">캐롯마켓 로그인</h1>
    </div>
    {data?.success ? <form className="space-y-6 p-4 my-4" onSubmit={submitCode(({ token }) => {
      if (!confirming) confirm({ token: token.trim().toUpperCase() });
    })}>
      <TextInput register={registerCode("token", { required: true, minLength: 12, maxLength: 12 })}
        type="text" id="token" name="12자리 영문 대문자·숫자 인증코드" maxLength={12} />
      <FilledBtn title="인증코드 제출" loading={confirming} />
      {confirmed && !confirmed.success ? <p role="alert">코드를 확인해 주세요. 만료되었으면 다시 로그인해 주세요.</p> : null}
    </form> : <form className="space-y-6 p-4 my-4" onSubmit={handleSubmit(({ email }) => {
      if (!loading && challenge) enter({ email, challenge });
    })}>
      <TextInput register={register("email", { required: true })} type="email" id="email" name="이메일 주소" />
      <div ref={container} />
      {!sitekey ? <p role="alert">로그인 보안 설정이 준비되지 않았습니다.</p> : null}
      {challenge ? <FilledBtn title="인증코드 발송" loading={loading} /> : <p>보안 확인을 완료해 주세요.</p>}
      {(data && !data.success) || error ? <p role="alert">발송하지 못했습니다. 보안 확인 후 잠시 뒤 다시 시도해 주세요.</p> : null}
    </form>}
  </>;
};
export default Enter;
