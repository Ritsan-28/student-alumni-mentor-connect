# student-alumni-mentor-connect

Testing 

Test All Backend Auth Endpoints
Make sure your backend is running (npm run dev in server/).
Open VS Code → Thunder Client (the extension icon in left sidebar) → New Request.

Test 1: Register
Method: POST
URL: http://localhost:5000/api/auth/register
Body (JSON):
{
  "name": "Arjun Kumar",
  "email": "your_real_email@gmail.com",
  "password": "Test@1234",
  "role": "student"
}
Expected: 201 with message about checking email.
Check your Gmail — you should receive the OTP email.

Test 2: Verify Email
Method: POST
URL: http://localhost:5000/api/auth/verify-email
Body (JSON):
{
  "email": "your_real_email@gmail.com",
  "otp": "123456"
}
Use the actual OTP from your email.
Expected: 200 with "Email verified successfully"

Test 3: Login
Method: POST
URL: http://localhost:5000/api/auth/login
Body (JSON):
{
  "email": "your_real_email@gmail.com",
  "password": "Test@1234"
}
Expected: 200 with accessToken and user data.
Copy the accessToken — you'll use it in future tests.

Test 4: Refresh Token
Method: POST
URL: http://localhost:5000/api/auth/refresh
Expected: 200 with new accessToken
Test 5: Logout
Method: POST
URL: http://localhost:5000/api/auth/logout
Expected: 200 with "Logged out successfully"

Step 7 — Test Backend Profile Endpoints
Make sure backend is running. In Thunder Client:
Test 1: Get My Profile
Method: GET
URL: http://localhost:5000/api/users/me
Headers:
  Authorization: Bearer <your_access_token_from_login>
Expected: 200 with user and profile objects
Test 2: Update My Profile
Method: PUT
URL: http://localhost:5000/api/users/me
Headers:
  Authorization: Bearer <token>
Body (JSON):
{
  "bio": "3rd year CSE student passionate about full-stack development",
  "location": "Chennai, India",
  "skills": ["JavaScript", "React", "Node.js"],
  "careerGoal": "Become a full-stack engineer at a product company"
}
Expected: 200 with updated profile
Test 3: Get User by ID
Method: GET
URL: http://localhost:5000/api/users/<any_user_id>
Headers:
  Authorization: Bearer <token>
Expected: 200 with that user's public profile

Step 3 — Test Backend
Login first to get a fresh token. Then test:
GET http://localhost:5000/api/mentors?role=mentor
Authorization: Bearer <token>
Expected: 200 with results array and pagination object.

GET http://localhost:5000/api/mentors?role=mentor&skill=React
Authorization: Bearer <token>
Expected: filtered results.