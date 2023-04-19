import { NextPage } from "next";
import RecordOrg from "@components/organism/record-organism";

const Sold: NextPage = () => {
  return <RecordOrg title="판매내역" recordKind="sales" />;
};

export default Sold;
