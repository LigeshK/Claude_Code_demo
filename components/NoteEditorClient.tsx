"use client";

import dynamic from "next/dynamic";

const NoteEditor = dynamic(() => import("./NoteEditor"), { ssr: false });

export default NoteEditor;
