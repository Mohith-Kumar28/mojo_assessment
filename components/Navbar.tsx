"use client";
import React from "react";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { FaBars, FaFacebook } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import Image from "next/image";

import ProfileDropdown from "@/app/profile/profileDropdown";
import PagesList from "./pages-list";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";

const Navbar = () => {
  const { data: session }: any = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Dashboard", href: "/dashboard" },
  ];

  return (
    <>
      {console.log(session)}
      {/*
    <div>
      <ul className="flex justify-between m-10 item-center">
        <div>
          <Link href="/">
            <li>Home</li>
          </Link>
        </div>
        <div className="flex gap-10">
          <Link href="/dashboard">
            <li>Dashboard</li>
          </Link>
          {!session ? (
            <>
              <Link href="/login">
                <li>Login</li>
              </Link>
              <Link href="/register">
                <li>Register</li>
              </Link>
            </>
          ) : (
            <>
              {session.user?.email}
              <li>
                <button
                  onClick={() => {
                    signOut();
                  }}
                  className="p-2 px-5 -mt-1 bg-blue-800 rounded-full"
                >
                  Logout
                </button>
              </li>
            </>
          )}
        </div>
      </ul>
    </div>
                */}

      <header className="bg-white">
        <nav
          className="mx-auto flex max-w-7xl items-center justify-between gap-x-6 p-6 lg:px-8"
          aria-label="Global"
        >
          <div className="flex flex-1 items-center justify-end gap-x-6">
            {session && (
              <Button
                variant="ghost"
                onClick={() => {
                  signOut();
                }}
              >
                Log out
                <LogOut className="size-4 ml-2" />
              </Button>
            )}
          </div>
        </nav>
      </header>
    </>
  );
};

export default Navbar;
