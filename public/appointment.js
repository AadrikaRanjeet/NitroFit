document.getElementById('appointmentForm').addEventListener('submit', async function(event) {
  event.preventDefault(); // Prevent the form from refreshing the page on submit

  // Capture form data
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const appointmentDate = document.getElementById('appointment-date').value;
  const appointmentTime = document.getElementById('appointment-time').value;

  // You can combine date and time fields into one datetime string if needed
  const appointmentDateTime = `${appointmentDate}T${appointmentTime}`;

  try {
    // Send data to the backend using POST request
    const response = await fetch('/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: name,
        email: email,
        phone: phone,
        appointmentDate: appointmentDateTime,
      })
    });

    if (response.ok) {
      // Show confirmation message to the user
      document.getElementById('confirmationMessage').style.display = 'block';
      // Optionally, reset the form
      document.getElementById('appointmentForm').reset();
    } else {
      // Handle errors
      console.error('Failed to book the appointment');
    }
  } catch (error) {
    console.error('Error occurred:', error);
  }
});
