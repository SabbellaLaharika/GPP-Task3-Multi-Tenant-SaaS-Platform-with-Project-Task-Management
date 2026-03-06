const run = async () => {
    try {
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@demo.com', password: 'Demo@123', tenantSubdomain: 'demo' })
        });
        const loginData = await loginRes.json();
        const token = loginData?.data?.token;
        if (!token) {
            console.log("Login failed", loginData);
            return;
        }

        const meRes = await fetch('http://localhost:5000/api/auth/me', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        console.log("Status:", meRes.status);
        console.log("Response:", await meRes.text());
    } catch (error) {
        console.error("Fetch error:", error);
    }
};
run();
