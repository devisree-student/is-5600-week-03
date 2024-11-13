// public/chat.js

// Listen for new chat messages using Server-Sent Events (SSE)
new EventSource("/sse").onmessage = function(event) {
    const messagesDiv = document.getElementById("messages");
  
    // Create a new paragraph element to display the message
    const newMessage = document.createElement("p");
    newMessage.textContent = event.data;
  
    // Append the new message to the messages div
    messagesDiv.appendChild(newMessage);
  };
  
  // Handle form submission to send messages to the server
  window.form.addEventListener('submit', function(event) {
    event.preventDefault();  // Prevent page refresh
  
    // Send the chat message via GET request
    fetch(`/chat?message=${encodeURIComponent(window.input.value)}`)
      .then(response => {
        if (response.ok) {
          // Clear the input field if the message is sent successfully
          window.input.value = '';
        }
      })
      .catch(error => {
        console.error("Error sending message:", error);
      });
  });
  