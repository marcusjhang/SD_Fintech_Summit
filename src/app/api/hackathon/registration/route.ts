import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase"; 
import { collection, addDoc, Timestamp } from "firebase/firestore";

interface HackathonRegistration {
  teamName: string;
  leaderName: string;
  leaderEmail: string;
  leaderPhone: string;
  members: Array<{
    name: string;
    email: string;
    phone: string;
  }>;
}

export async function POST(req: NextRequest) {
  /**
   * Hackathon Registration API Requirements:
   *
   * 1. **Request Method**: POST
   * 2. **Collection**: `hackathon_registrations` (Firestore)
   * 3. **Required Fields** (in request body):
   *    - `teamName`: string (Name of the team)
   *    - `leaderName`: string (Full name of the team leader)
   *    - `leaderEmail`: string (Email of the team leader, must be valid)
   *    - `leaderPhone`: string (Phone number of the team leader)
   *    - `members`: array of objects (List of team members)
   *      - Each member must have:
   *        - `name`: string (Full name of the member)
   *        - `email`: string (Valid email of the member)
   *        - `phone`: string (Phone number of the member)
   *
   * 4. **Validations**:
   *    - All fields must be provided and must be of the correct type.
   *    - `leaderEmail` and `members[].email` must be valid email addresses.
   *    - At least one member must be included in `members` array.
   *
   * 5. **Database Action**:
   *    - Store the registration details in Firestore under `hackathon_registrations` collection.
   *    - Add a `createdAt` field with a Firestore timestamp.
   *
   * 6. **Responses**:
   *    - **200 OK**: If registration is successful, return success message with Firestore document ID.
   *    - **400 Bad Request**: If any required field is missing or invalid, return an error message.
   *    - **500 Internal Server Error**: If Firestore write operation fails, return a server error message.
   */
  try {
    const body: HackathonRegistration = await req.json();
    
    console.log("Received registration request:", body);

    // Validate required fields
    if (!body.teamName || typeof body.teamName !== "string") {
      return NextResponse.json({ error: "Team name is required and must be a string." }, { status: 400 });
    }

    if (!body.leaderName || typeof body.leaderName !== "string") {
      return NextResponse.json({ error: "Leader name is required and must be a string." }, { status: 400 });
    }

    if (!body.leaderEmail || typeof body.leaderEmail !== "string" || !isValidEmail(body.leaderEmail)) {
      return NextResponse.json({ error: "Leader email is required and must be valid." }, { status: 400 });
    }

    if (!body.leaderPhone || typeof body.leaderPhone !== "string") {
      return NextResponse.json({ error: "Leader phone is required and must be a string." }, { status: 400 });
    }

    if (!Array.isArray(body.members) || body.members.length === 0) {
      return NextResponse.json({ error: "At least one team member is required." }, { status: 400 });
    }

    // Validate each team member
    for (const member of body.members) {
      if (!member.name || typeof member.name !== "string") {
        return NextResponse.json({ error: "Each member must have a valid name." }, { status: 400 });
      }

      if (!member.email || typeof member.email !== "string" || !isValidEmail(member.email)) {
        return NextResponse.json({ error: "Each member must have a valid email address." }, { status: 400 });
      }

      if (!member.phone || typeof member.phone !== "string") {
        return NextResponse.json({ error: "Each member must have a valid phone number." }, { status: 400 });
      }
    }

    // Add to Firestore
    const docRef = await addDoc(collection(db, "hackathon_registrations"), {
      teamName: body.teamName,
      leaderName: body.leaderName,
      leaderEmail: body.leaderEmail,
      leaderPhone: body.leaderPhone,
      members: body.members,
      createdAt: Timestamp.now(),
    });

    console.log("Registration stored with ID:", docRef.id);

    return NextResponse.json({ 
      message: "Hackathon registration successful!", 
      id: docRef.id 
    }, { status: 200 });
  } catch (error) {
    console.error("Error processing registration:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Helper function for email validation
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
  