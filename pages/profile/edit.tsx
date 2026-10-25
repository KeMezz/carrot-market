import FilledBtn from "@components/atom/filled-btn";
import TextInput from "@components/atom/text-input";
import Layout from "@components/template/layout";
import useImageId from "@libs/client/useImageId";
import useMutation from "@libs/client/useMutation";
import useUser from "@libs/client/useUser";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface EditProfileForm {
  name?: string;
  avatar?: FileList;
}

interface EditProfileResponse {
  success: boolean;
  error?: string;
}

const Edit = () => {
  const router = useRouter();

  // define APIs
  const { user } = useUser();
  const [editProfile, { loading, data }] =
    useMutation<EditProfileResponse>(`/api/users/me`);

  // configure edit profile forms
  const {
    register,
    handleSubmit,
    setValue,
    watch,
  } = useForm<EditProfileForm>();
  const onValid = async ({ name, avatar }: EditProfileForm) => {
    if (loading) return;

    // if user touches avatar input, we request the cloudflare upload url.
    if (avatar && avatar.length > 0 && user) {
      const avatarId = await getImageId({
        fileList: avatar!,
        fileName: user?.id + "",
      });
      editProfile({
        name,
        avatarId,
      });
    }

    // when avatar image is not provided, we just send it without image.
    else editProfile({ name });
  };

  // fills form initially, with previous user profile data
  useEffect(() => {
    if (user) {
      setValue("name", user.name ?? "");
    }
    if (user?.avatar) {
      setAvatarPreview(
        `https://imagedelivery.net/bNh-NL16qgpnc_aca1vxPw/${user.avatar}/avatar`
      );
    }
  }, [user, setValue]);

  useEffect(() => {
    if (data?.success) router.push("/profile");
  }, [data, router]);

  // define user avatar variables
  const avatar = watch("avatar");
  const [avatarPreview, setAvatarPreview] = useState<null | string>(null);

  // get image url and get upload mutate function
  const [getImageId, { loading: uploadImageLoading }] = useImageId();

  // when user provides a new avatar image, we fake fills an avatar component with new image.
  useEffect(() => {
    if (avatar && avatar.length > 0) {
      const file = avatar[0];
      setAvatarPreview(URL.createObjectURL(file));
    }
  }, [avatar]);

  return (
    <Layout title="프로필 수정하기" canGoBack>
      <form onSubmit={handleSubmit(onValid)}>
        <div className="flex p-4 my-4 gap-4 items-center">
          {avatarPreview ? (
            <Image
              alt={user!.name}
              src={avatarPreview}
              width={64}
              height={64}
              priority
              className="bg-gray-400 rounded-full w-16 h-16 object-cover"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-400 rounded-full" />
          )}
          <label
            htmlFor="avatar"
            className="border py-2 px-4 rounded-lg cursor-pointer"
          >
            Change
          </label>
          <input
            {...register("avatar")}
            id="avatar"
            type="file"
            className="hidden"
            accept="image/*"
          />
        </div>
        <section className="flex flex-col gap-4 px-4">
          <TextInput
            id="name"
            name="Name"
            register={register("name")}
            type="text"
          />
          <p>로그인 이메일: {user?.email ?? "없음"}</p>
          <p className="text-sm text-gray-600">이메일과 전화번호는 이 화면에서 변경할 수 없습니다.</p>
          {data && !data.success ? <p role="alert">프로필을 저장하지 못했습니다.</p> : null}
          <FilledBtn
            title={
              loading || uploadImageLoading ? "Loading..." : "Update Profile"
            }
          />
        </section>
      </form>
    </Layout>
  );
};

export default Edit;
