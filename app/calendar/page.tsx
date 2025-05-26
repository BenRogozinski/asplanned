import BasePage from "@/components/BasePage/BasePage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calendar"
};

const Calendar: React.FC = () => {
  return (
    <BasePage />
  );
};

export default Calendar;