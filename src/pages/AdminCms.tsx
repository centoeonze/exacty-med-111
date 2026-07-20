import GrapesEditor from "@/cms/GrapesEditor";

type Props = {
  onLogout?: () => void | Promise<void>;
};

const AdminCms = ({ onLogout }: Props) => <GrapesEditor onLogout={onLogout} />;

export default AdminCms;
