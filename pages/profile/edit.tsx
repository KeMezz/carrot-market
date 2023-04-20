import FilledBtn from "@components/atom/filled-btn";
import TextInput from "@components/atom/text-input";
import Layout from "@components/template/layout";
import useImageId from "@libs/client/getImageId";
import getImageId from "@libs/client/getImageId";
import useMutation from "@libs/client/useMutation";
import useUser from "@libs/client/useUser";
import { ProfileErrorResponse } from "@pages/api/users/me";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface EditProfileForm {
  email?: string;
  phone?: string;
  name?: string;
  avatar?: FileList;
}

interface EditProfileResponse {
  success: boolean;
  error?: ProfileErrorResponse;
}

const Edit = () => {
  // define APIs
  const { user, isLoading: userLoading } = useUser();
  const [editProfile, { loading, data }] =
    useMutation<EditProfileResponse>(`/api/users/me`);

  // configure edit profile forms
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    setError,
    watch,
  } = useForm<EditProfileForm>();
  const onValid = async ({ email, phone, name, avatar }: EditProfileForm) => {
    if (loading) return;

    // block submit when the form is completely empty
    if (email === "" && phone === "" && name === "") {
      setError("root", {
        message: "이메일 혹은 휴대폰 번호 중 하나 이상은 반드시 입력해주세요.",
      });
    }

    // if user touches avatar input, we request the cloudflare upload url.
    if (avatar && avatar.length > 0 && user) {
      const avatarId = await getImageId({
        fileList: avatar!,
        fileName: user?.id + "",
      });
      editProfile({
        email,
        phone,
        name,
        avatarId,
      });
    }

    // when avatar image is not provided, we just send it without image.
    editProfile({ email, phone, name });
  };

  // fills form initially, with previous user profile data
  useEffect(() => {
    if (user) {
      setValue("name", user.name ?? "");
      setValue("email", user.email ?? "");
      setValue("phone", user.phone ?? "");
      setAvatarPreview(
        `https://imagedelivery.net/bNh-NL16qgpnc_aca1vxPw/${user.avatar}/avatar`
      );
    }
  }, [user, setValue]);

  // if server responses with error object, we'll show error to users too.
  useEffect(() => {
    if (data && data?.error?.email) {
      setError("email", { message: data.error.email });
    }
    if (data && data?.error?.phone) {
      setError("phone", { message: data.error.phone });
    }
  }, [data, setError]);

  // define user avatar variables
  const avatar = watch("avatar");
  const [avatarPreview, setAvatarPreview] = useState("");

  // get image url and get upload mutate function
  const [getImageId, { loading: uploadImageLoading }] = useImageId();

  // when user provides a new avatar image, we fake fills an avatar component with new image.
  useEffect(() => {
    if (avatar && avatar.length > 0) {
      const file = avatar[0];
      setAvatarPreview(URL.createObjectURL(file));
    }
  }, [avatar]);

  if (userLoading) return null;
  return (
    <Layout title="프로필 수정하기" canGoBack>
      <form onSubmit={handleSubmit(onValid)}>
        <div className="flex p-4 my-4 gap-4 items-center">
          {avatarPreview ? (
            <img
              src={avatarPreview}
              className="w-16 h-16 bg-gray-400 rounded-full"
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
          <TextInput
            id="email"
            name="Email Address"
            register={register("email")}
            type="text"
          />
          <TextInput
            id="phone"
            name="Phone Number"
            register={register("phone")}
            type="number"
          />
          {errors.phone ? (
            <p className="text-center text-red-500 text-sm font-bold">
              {errors.phone.message}
            </p>
          ) : null}
          {errors.email ? (
            <p className="text-center text-red-500 text-sm font-bold">
              {errors.email.message}
            </p>
          ) : null}
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
