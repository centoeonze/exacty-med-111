import GrapesEditor from "@/cms/GrapesEditor";
import { installProdUpload413Diag } from "@/cms/prodUpload413Diag";

// TEMPORARY: exposes window.__EXACTY_PROD_413_DIAG__ (manual only; does not auto-run).
installProdUpload413Diag();

type Props = {
  onLogout?: () => void | Promise<void>;
};

const AdminCms = ({ onLogout }: Props) => <GrapesEditor onLogout={onLogout} />;

export default AdminCms;
