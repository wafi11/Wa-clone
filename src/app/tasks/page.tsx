"use client";
import { useUser } from "@clerk/nextjs";

export default function GetUser() {
  const { user } = useUser();
  console.log(user);

  return <div></div>;
}
