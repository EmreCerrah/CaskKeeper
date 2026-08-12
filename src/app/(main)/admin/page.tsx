import { redirect } from "next/navigation";

/** /admin → katalog yönetimine yönlendirir */
export default function AdminHomePage() {
  redirect("/admin/whiskeys");
}
