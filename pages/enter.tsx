import { NextPage } from "next";
import { useEffect, useState } from "react";
import OutlineBtn from "@components/atom/outline-btn";
import TabBtn from "@components/atom/tab-btn";
import FilledBtn from "@components/atom/filled-btn";
import TextInput from "@components/atom/text-input";
import { useForm } from "react-hook-form";
import useMutation from "@libs/client/useMutation";
import { ResponseType } from "@libs/server/withHandler";
import { useRouter } from "next/router";

type method = "email" | "phone";

interface EnterForm {
  email?: string;
  phone?: string;
}

interface TokenForm {
  token: string;
}

const Enter: NextPage = () => {
  const [enter, { loading, data }] =
    useMutation<ResponseType>("/api/users/enter");
  const [confirmToken, { loading: tokenLoading, data: tokenData }] =
    useMutation<ResponseType>("/api/users/confirm");

  const { register, reset, handleSubmit } = useForm<EnterForm>();
  const { register: tokenRegister, handleSubmit: tokenHandleSubmit } =
    useForm<TokenForm>();

  const [loginMethod, setLoginMethod] = useState<method>("email");
  const changeMethod = (targetMethod: method) => {
    reset();
    setLoginMethod(targetMethod);
  };

  const onValid = (validForm: EnterForm) => {
    if (loading) return;
    enter(validForm);
  };
  const onTokenValid = (validForm: TokenForm) => {
    if (tokenLoading) return;
    confirmToken(validForm);
  };

  useEffect(() => {
    if (data?.success) {
      reset();
    }
  }, [data?.success, reset]);

  const router = useRouter();
  useEffect(() => {
    console.log("TD", tokenData);
    if (tokenData?.success) {
      router.push("/?page=1");
    }
  }, [tokenData, router]);

  return (
    <>
      <div className="h-48 flex flex-col justify-center items-center text-center text-3xl gap-2">
        <p>🥕</p>
        <h1 className="font-bold">Enter to Karrot</h1>
      </div>
      {data?.success ? null : (
        <div className="flex">
          <TabBtn
            isActive={loginMethod === "email"}
            onClick={() => changeMethod("email")}
            title="Email Address"
          />
          <TabBtn
            isActive={loginMethod === "phone"}
            onClick={() => changeMethod("phone")}
            title="Phone Number"
          />
        </div>
      )}
      {data?.success ? (
        <>
          <form
            className="space-y-6 p-4 my-4"
            onSubmit={tokenHandleSubmit(onTokenValid)}
          >
            <TextInput
              register={tokenRegister("token", {
                required: true,
                disabled: tokenLoading,
                maxLength: 6,
              })}
              type="number"
              id="token"
              name="Confirmation Token"
              maxLength={6}
            />
            <FilledBtn title={!tokenLoading ? "Confirm Token" : "Loading..."} />
          </form>
        </>
      ) : (
        <>
          <form className="space-y-6 p-4 my-4" onSubmit={handleSubmit(onValid)}>
            {loginMethod === "email" ? (
              <>
                <TextInput
                  register={register("email", {
                    required: true,
                    disabled: loading,
                  })}
                  type="email"
                  id="email"
                  name="Email Address"
                />
                <FilledBtn title={!loading ? "Get login link" : "Loading..."} />
              </>
            ) : (
              <>
                <TextInput
                  register={register("phone", {
                    required: true,
                    disabled: loading,
                  })}
                  type="number"
                  id="phone"
                  name="Phone Number"
                />
                <FilledBtn
                  title={!loading ? "Get one-time password" : "Loading..."}
                />
              </>
            )}
          </form>
        </>
      )}
      <div className="flex flex-col justify-center">
        <p className="text-center bg-white z-10 w-fit mx-auto px-4">
          or enter with
        </p>
        <div className="w-full absolute border-t bg-gray-300" />
      </div>
      <div className="grid grid-cols-2 px-4 gap-4 mt-8">
        <OutlineBtn d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
        <OutlineBtn d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" />
      </div>
    </>
  );
};

export default Enter;
