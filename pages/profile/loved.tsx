import { NextPage } from "next";
import RecordOrg from "@components/organism/record-organism";

const Loved: NextPage = () => {
  return <RecordOrg title="관심목록" recordKind="favs" />;
};

export default Loved;
