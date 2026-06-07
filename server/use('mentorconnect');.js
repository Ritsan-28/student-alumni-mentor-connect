use("mentorconnect");

db.users.updateOne(
  { email: "riteshkumaran2005@gmail.com" },
  { $set: { role: "admin", isVerified: true } },
);
