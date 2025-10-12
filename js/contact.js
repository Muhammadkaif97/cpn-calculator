document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById("contact-form");
    const statusMessage = document.getElementById("status-message");
    const submitButton = document.getElementById("submit-button");

    if (form) {
        async function handleSubmit(event) {
            event.preventDefault();
            const data = new FormData(event.target);
            
            submitButton.disabled = true;
            submitButton.innerText = "Sending...";

            fetch(event.target.action, {
                method: form.method,
                body: data,
                headers: {
                    'Accept': 'application/json'
                }
            }).then(response => {
                if (response.ok) {
                    statusMessage.innerHTML = "<p class='text-green-600 font-semibold'>Thanks for your submission!</p>";
                    form.reset();
                } else {
                    response.json().then(data => {
                        if (Object.hasOwn(data, 'errors')) {
                            statusMessage.innerHTML = data["errors"].map(error => error["message"]).join(", ")
                        } else {
                            statusMessage.innerHTML = "<p class='text-red-600 font-semibold'>Oops! There was a problem submitting your form.</p>"
                        }
                    })
                }
            }).catch(error => {
                statusMessage.innerHTML = "<p class='text-red-600 font-semibold'>Oops! There was a problem submitting your form.</p>"
            }).finally(() => {
                 submitButton.disabled = false;
                 submitButton.innerText = "Send Message";
            });
        }
        form.addEventListener("submit", handleSubmit);
    }
});
