import { notFound } from "next/navigation";

import AuthScreen, {
  type AuthKind,
} from "../../../components/customer/AuthScreen";

import ProfileScreen from "../../../components/customer/ProfileScreen";

export default async function CustomerPage({
  params,
}: {
  params: Promise<{
    screen: string;
  }>;
}) {
  const { screen } = await params;

  if (screen === "profile") {
    return <ProfileScreen />;
  }

  if (
    ![
      "login",
      "register",
      "verify-otp",
      "forgot-password",
      "reset-password",
    ].includes(screen)
  ) {
    notFound();
  }

  return (
    <AuthScreen
      key={screen}
      kind={screen as AuthKind}
    />
  );
}