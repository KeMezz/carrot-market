import { useState } from "react";

interface UseImageIdState {
  loading: boolean;
  error: any;
}

type UseImageIdResult = [
  (data: CreateFormArgs) => Promise<void>,
  UseImageIdState
];

interface CreateFormArgs {
  fileList: FileList;
  fileName: string;
}

interface UploadImageArgs {
  uploadURL: string;
  form: FormData;
}

async function getURL() {
  const { uploadURL } = await (await fetch(`/api/files`)).json();
  return uploadURL;
}

function createForm({ fileList, fileName }: CreateFormArgs) {
  const form = new FormData();
  form.append("file", fileList[0], fileName);
  return form;
}

async function uploadImage({ uploadURL, form }: UploadImageArgs) {
  const {
    result: { id },
  } = await (await fetch(uploadURL, { method: "POST", body: form })).json();
  return id;
}

function useImageId(): UseImageIdResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>("");

  async function getImageId({ fileList, fileName }: CreateFormArgs) {
    setLoading(true);
    try {
      const uploadURL = await getURL();
      const form = createForm({ fileList, fileName });
      const id = await uploadImage({ uploadURL, form });
      setLoading(false);
      return id;
    } catch (error) {
      setError(error);
    }
  }

  return [getImageId, { loading, error }];
}

export default useImageId;
