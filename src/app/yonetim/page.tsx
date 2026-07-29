import { redirect } from "next/navigation";

/** /yonetim → katalog yönetimine yönlendirir */
export default function AdminHomePage() {
  redirect("/yonetim/viskiler");
}
