import { NextPage } from "next";
import CommunityCategory from "@components/atom/chip";
import ReactionBtn from "@components/atom/reaction-btn-big";
import FilledBtn from "@components/atom/filled-btn";
import Textarea from "@components/atom/textarea";
import Profile from "@components/molecule/profile";
import Layout from "@components/template/layout";
import CommunityQuestion from "@components/molecule/community-question";
import { useRouter } from "next/router";
import useSWR from "swr";
import { Answer, Post } from "@prisma/client";
import { useForm } from "react-hook-form";
import useMutation from "@libs/client/useMutation";
import { useEffect } from "react";

interface UserEssential {
  id: number;
  name: string;
  avatar: string | null;
}

interface PostDetailResponse {
  success: boolean;
  post: {
    user: UserEssential;
    answers: {
      answer: string;
      id: number;
      createdAt: string;
      user: UserEssential;
    }[];
    _count: { answers: number; interests: number };
  } & Post;
  isInterest: boolean;
}

interface AnswerForm {
  answer: string;
}

interface AnswerResponse {
  success: boolean;
  answer: Answer;
}

const CommunityDetail: NextPage = () => {
  const router = useRouter();
  const { data, mutate } = useSWR<PostDetailResponse>(
    router.query.id ? `/api/posts/${router.query.id}` : null
  );

  const [interest, { loading: interestLoading }] = useMutation(
    `/api/posts/${router.query.id}/interest`
  );
  const onInterestClick = () => {
    if (!data) return;
    mutate(
      (prev) =>
        prev && {
          ...prev,
          post: {
            ...prev.post,
            _count: {
              ...prev.post._count,
              interests: data?.isInterest
                ? prev.post._count.interests - 1
                : prev.post._count.interests + 1,
            },
          },
          isInterest: !data?.isInterest,
        },
      false
    );
    if (!interestLoading) {
      interest({});
    }
  };

  const { register, handleSubmit, reset } = useForm<AnswerForm>();
  const [sendAnswer, { data: answerData, loading: answerLoading }] =
    useMutation<AnswerResponse>(`/api/posts/${router.query.id}/answer`);

  const onValid = (data: AnswerForm) => {
    if (answerLoading) return;
    sendAnswer(data);
  };

  useEffect(() => {
    if (answerData && answerData.success) {
      reset();
      mutate();
    }
  }, [answerData, reset, mutate]);

  return (
    <Layout canGoBack>
      <section className="flex flex-col p-4 gap-4">
        <div className="border-b">
          <CommunityCategory category="동네질문" />
          <Profile
            userId={data?.post.user.id}
            name={data?.post.user.name}
            avatar={data?.post.user.avatar}
          />
        </div>
        <CommunityQuestion question={data?.post.question} />
        <div className="flex gap-6 border-t border-b py-3">
          <ReactionBtn
            isClicked={data?.isInterest}
            onClick={onInterestClick}
            title="궁금해요"
            count={data?.post._count.interests!}
            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
          <ReactionBtn
            title="답변"
            count={data?.post._count.answers!}
            d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
          />
        </div>
        {data?.post.answers.map((answer) => (
          <div className="flex gap-4" key={answer.id}>
            <div className="bg-gray-300 w-12 h-12 rounded-full" />
            <div className="flex flex-col gap-1 w-fit">
              <h3 className="text-sm">{answer.user.name}</h3>
              <p className="text-xs text-gray-400">{answer.createdAt}</p>
              <p>{answer.answer}</p>
            </div>
          </div>
        ))}
        <form onSubmit={handleSubmit(onValid)} className="flex flex-col gap-4">
          <Textarea
            id="answer"
            register={register("answer", { required: true })}
            placeholder="Answer the question!"
          />
          <FilledBtn title={answerLoading ? "Loading..." : "Reply"} />
        </form>
      </section>
    </Layout>
  );
};

export default CommunityDetail;
