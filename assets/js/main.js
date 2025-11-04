 /* ----- TYPING EFFECT ----- */
 var typingEffect = new Typed(".typedText",{
    strings : [" Build Deep and Machine Learning systems"," Build financial models"," do Research works", "am a Tutor"],
    loop : true,
    typeSpeed : 100, 
    backSpeed : 80,
    backDelay : 2000

 })

 // Add this to your existing script
document.getElementById('contact-form').addEventListener('submit', sendMail);

function sendMail(event) {
  event.preventDefault();
  
  var params = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    message: document.getElementById("message").value,
  };

  const serviceID = "service_8xt0rlq";
  const templateID = "template_ym9ghe3";

  emailjs.send(serviceID, templateID, params)
    .then(res => {
      document.getElementById("contact-form").reset();
      console.log(res);
      alert("Your message sent successfully!!");
    })
    .catch(err => {
      console.log(err);
      alert("Failed to send message. Please try again.");
    });
}
