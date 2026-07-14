const BASE_URL = "https://sitemint-t6b7.onrender.com/api";

async function runTests() {
  const testEmail = `auto_user_${Date.now()}@sitemint.app`;
  const testPassword = "SecurePassword123!";
  const testName = "Automation Tester";

  console.log("🚀 Testing authentication API flow on:", BASE_URL);

  // 1. Test Registration
  console.log("\n1️⃣ Registering a new business owner...");
  try {
    const registerResponse = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contact_email: testEmail,
        password: testPassword,
        full_name: testName
      })
    });

    const registerData: any = await registerResponse.json();
    console.log("Registration Response Status:", registerResponse.status);
    console.log("Registration Response Data:", registerData);

    if (registerResponse.status === 201 && registerData.status === "success") {
      console.log("✅ Registration test PASSED!");
    } else {
      console.error("❌ Registration test FAILED!");
      return;
    }
  } catch (err: any) {
    console.error("❌ Registration request failed:", err.message);
    return;
  }

  // 2. Test Login
  console.log("\n2️⃣ Logging in with registered credentials...");
  try {
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });

    const loginData: any = await loginResponse.json();
    console.log("Login Response Status:", loginResponse.status);
    console.log("Login Response Data:", loginData);

    if (loginResponse.status === 200 && loginData.status === "success") {
      console.log("✅ Login test PASSED!");
    } else {
      console.error("❌ Login test FAILED!");
    }
  } catch (err: any) {
    console.error("❌ Login request failed:", err.message);
  }
}

runTests();
