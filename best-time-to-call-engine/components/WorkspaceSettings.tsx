import AddPhoneNumbers from "./cards/AddPhoneNumbersCard";
import CallingPreferences from "./cards/CallingPreferencesCard";

const WorkspaceSettings = () => {
  return (
    <aside className="flex flex-col gap-6">
      <CallingPreferences />
      <AddPhoneNumbers />
    </aside>
  );
};

export default WorkspaceSettings;
