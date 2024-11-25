document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault();  // Prevent the page from refreshing

    const formData = {
        username: event.target.username.value,
        email: event.target.email.value,
        password: event.target.password.value
    };

    // Send form data to backend (Node.js)
    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Registration success:', data);
        alert(data.message);  // Show a success message
        // Optionally, redirect to another page (like login or homepage)
        // window.location.href = '/';
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Registration failed!');
    });
});
