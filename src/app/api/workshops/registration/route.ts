import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";  // Make sure this path is correct
import { collection, addDoc, Timestamp } from "firebase/firestore";

interface WorkshopRegistration {
  name: string;
  email: string;
  days: {
    day1?: string[];
    day2?: string[];
    day3?: string[];
  };
  questions?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: WorkshopRegistration = await req.json();
    
    console.log("Received workshop registration request:", body);

    // Validate required fields
    if (!body.name || typeof body.name !== "string") {
      return NextResponse.json({ error: "Name is required and must be a string." }, { status: 400 });
    }

    if (!body.email || typeof body.email !== "string" || !isValidEmail(body.email)) {
      return NextResponse.json({ error: "Email is required and must be valid." }, { status: 400 });
    }

    // Validate days structure
    if (!body.days || typeof body.days !== "object") {
      return NextResponse.json({ error: "Workshop days selection is required." }, { status: 400 });
    }

    // Check if at least one workshop is selected
    const hasSelectedWorkshop = 
      (Array.isArray(body.days.day1) && body.days.day1.length > 0) ||
      (Array.isArray(body.days.day2) && body.days.day2.length > 0) ||
      (Array.isArray(body.days.day3) && body.days.day3.length > 0);
    
    if (!hasSelectedWorkshop) {
      return NextResponse.json({ error: "At least one workshop must be selected." }, { status: 400 });
    }

    // Store in Firestore
    const docRef = await addDoc(collection(db, "workshop_registrations"), {
      name: body.name,
      email: body.email,
      days: body.days,
      questions: body.questions || "",
      createdAt: Timestamp.now(),
    });

    console.log("Workshop registration stored with ID:", docRef.id);

    return NextResponse.json({ 
      message: "Workshop registration successful!", 
      id: docRef.id 
    }, { status: 200 });
  } catch (error) {
    console.error("Error processing workshop registration:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}