 /* ----- TYPING EFFECT ----- */
 var typingEffect = new Typed(".typedText",{
    strings : [" Build Deep and Machine Learning systems"," Build financial models"," do Research works", "am a Tutor"],
    loop : true,
    typeSpeed : 100, 
    backSpeed : 80,
    backDelay : 2000

 })

function sendMail(event) {
  event.preventDefault(); // This is crucial - prevents page refresh
  
  var params = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    message: document.getElementById("message").value, // Changed from "project" to "message"
  };

  const serviceID = "service_8xt0rlq";
  const templateID = "template_ym9ghe3";

  emailjs.send(serviceID, templateID, params)
    .then(res => {
      document.getElementById("name").value = "";
      document.getElementById("email").value = "";
      document.getElementById("message").value = "";
      console.log(res);
      alert("Your message sent successfully!!");
    })
    .catch(err => {
      console.log(err);
      alert("Failed to send message. Please try again.");
    });
}
