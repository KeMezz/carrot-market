import { NextPage } from "next";
import RecordOrg from "@components/organism/record-organism";

const Bought: NextPage = () => {
  return <RecordOrg title="구매내역" recordKind="purchases" />;
};

export default Bought;
