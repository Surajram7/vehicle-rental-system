async function runTests() {
    console.log('Testing Admin Login...');
    try {
        const response = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@rental.com', password: 'admin123' })
        });
        const data = await response.json();
        if (data.success && data.user.role === 'admin') {
            console.log('Admin login test PASSED.');
        } else {
            console.error('Admin login test FAILED.', data);
        }

        console.log('Testing Vehicles Fetch...');
        const vehiclesResponse = await fetch('http://localhost:3001/api/vehicles');
        const vehicles = await vehiclesResponse.json();
        if (Array.isArray(vehicles) && vehicles.length > 0) {
            console.log('Vehicles fetch test PASSED. (' + vehicles.length + ' vehicles found)');
        } else {
             console.error('Vehicles fetch test FAILED.', vehicles);
        }
    } catch (e) {
        console.error('Tests threw an error:', e.message);
    }
}
runTests();
