import BasePage from "@/components/BasePage/BasePage";
import { Metadata } from "next";
import { getNavigator } from "@/lib/aspen";
import trim from "@/lib/trim";

export const metadata: Metadata = {
  title: "Class Overview"
};

export default async function ClassOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const classId = (await searchParams).id as string

  const aspen = await getNavigator();

  if (!aspen) {
    return;
  }

  await aspen.navigate("/portalClassList.do?navkey=academics.classes.list");
  aspen.setField("userEvent", "2100");
  aspen.setField("userParam", classId);
  await aspen.submit();
  if (!aspen.dom) {
    throw new Error("Failed to load DOM from Aspen");
  }

  const className = aspen.dom("#propertyValue\\(relSscMstOid_relMstCskOid_cskCourseDesc\\)-span").text();
  const teachers = aspen.dom("#propertyValue\\(relSscMstOid_mstStaffView\\)-span").text().split(";").map((str) => trim(str));
  const teacherEmail = aspen.dom("#propertyValue\\(relSscMstOid_relMstStfPrim_relStfPsnOid_psnEmail01\\)-span > a:nth-child(1)").text();
  const classroom = aspen.dom("#propertyValue\\(relSscMstOid_mstRoomView\\)-span").text();
  const cumulative = trim(aspen.dom("div.detailContainer:nth-child(5) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2)").text());
  

  console.log({
    className,
    teachers,
    teacherEmail,
    classroom,
    cumulative
  });

  return (
    <BasePage>
      <h1>DEBUG INFO</h1>
      Internal ID: {classId}<br/>
      Class: {className}<br/>
      Teachers: {teachers}<br/>
      Teacher Email: {teacherEmail}<br/>
      Classroom: {classroom}<br/>
      Cumulative: {cumulative}<br/>
    </BasePage>
  )
}