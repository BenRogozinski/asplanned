import BasePage from "@/components/BasePage/BasePage";
import DynamicList from "@/components/DynamicList/DynamicList";
import DynamicTable from "@/components/DynamicTable/DynamicTable";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "TESTING PAGE",
};

const MyInfo: React.FC = async () => {
  return (
    <BasePage>
      <DynamicTable
        title="Classes"
        alternatingColors
        expandableRows
        dataUrl="/api/classes"
        columnWidths={["auto", "80px"]}
      />
      <DynamicList
        title="Recent Activity"
        dataUrl="/api/recentActivity"
      />
    </BasePage>
  );
};

export default MyInfo;