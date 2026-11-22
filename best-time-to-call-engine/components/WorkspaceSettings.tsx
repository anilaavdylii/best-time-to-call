import type { ShiftSettings } from "@/lib/schedule";
import AddPhoneNumbers from "./cards/AddPhoneNumbersCard";
import ShiftSettingsCard from "./cards/ShiftSettingsCard";

type Props = { prefs: ShiftSettings; onApply: (prefs: ShiftSettings) => void };

const WorkspaceSettings = ({ prefs, onApply }: Props) => {
  return (
    <aside className="flex flex-col gap-6">
      <ShiftSettingsCard value={prefs} onApply={onApply} />
      <AddPhoneNumbers />
    </aside>
  );
};

export default WorkspaceSettings;
