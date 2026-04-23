import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function RootPage() {
  const authed = cookies().get("umurava_authed")?.value === "1";
  redirect(authed ? "/jobs" : "/login");
}
