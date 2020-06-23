"use strict";

// Unicode characters we will use
const diamond = "\u27e1";
const cross = "\u2756";
let id;

// querySelector returns the first element that matches the
// given CSS selector; in this case, the first span with id "fonts"
let currentFontIcon = document.querySelector("#fonts span");

// add event listeners
document.querySelectorAll("#fonts input").forEach(i => {
  // if status of one button changes, this will be called
  i.addEventListener("change", () => {
    // because these are radio buttons, i.checked is true for
    // the one selected
    if (i.checked) {
      console.log("checked");
      // change diamonds
      // put the crossed diamond in front of this choice
      i.previousElementSibling.textContent = cross;
      // put the regular diamond in front of the last choice
      currentFontIcon.textContent = diamond;
      // and remember that this is the current choice
      currentFontIcon = i.previousElementSibling;

      document.querySelector("#message").className = i.value;
    }
  });
});

//CHANGE COLOR

const colors = [
  "#e6e2cf",
  "#dbcaac",
  "#c9cbb3",
  "#bbc9ca",
  "#A6A5B5",
  "#B5A6AB",
  "#ECCFCF",
  "#eceeeb",
  "#BAB9B5"
];

// querySelectorAll returns a list of all the elements with class color-box
const colorBoxes = document.querySelectorAll(".color-box");

colorBoxes.item(0).style.border = "1px solid black";
let currentColor = colorBoxes.item(0);

colorBoxes.forEach((b, i) => {
  b.style.backgroundColor = colors[i];

  b.addEventListener("click", () => {
    // colorBoxes.forEach((d) => {
    //   d.style.border = 'none';
    // })
    currentColor.style.border = "none";
    b.style.border = "1px solid black";
    document.querySelector(".postcard").style.backgroundColor = colors[i];
    currentColor = b;
  });

  b.addEventListener("mouseover", () => {
    b.style.border = "1px dashed black";
    document.querySelector(".postcard").style.backgroundColor = colors[i];
  });
  b.addEventListener("mouseout", () => {
    if (b != currentColor) {
      b.style.border = "none";
      document.querySelector(".postcard").style.backgroundColor =
        currentColor.style.backgroundColor;
    } else {
      b.style.border = "1px solid black";
    }
  });
});

// UPLOAD postcard data
// When the user hits the button...
document.querySelector("#save").addEventListener("click", () => {
  let msg = document.querySelector("#message");
  let img = document.querySelector("#cardImg");
  let data = {
    image: img.src,
    color: currentColor.style.backgroundColor,
    font: msg.className,
    message: msg.innerText
  };
  console.log(data);

  // new HttpRequest instance
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("POST", "/saveDisplay");
  // important to set this for body-parser
  xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  // setup callback function
  xmlhttp.onloadend = function(e) {
    let link = `https://radial-ten-kilometer.glitch.me/display.html?id=${xmlhttp.responseText}`;
    console.log(link);
    document.querySelector("#popup-container").style.display = "block";
    document.querySelector("#post-link").href = link;
    document.querySelector("#post-link").text = link;
    // immediately switch to display view
    // window.location = 'https://postcard-app.glitch.me/display.html';
  };
  // all set up!  Send off the HTTP request
  xmlhttp.send(JSON.stringify(data));
});

document.querySelector("#close-btn").addEventListener("click", () => {
  document.querySelector("#popup-container").style.display = "none";
});

// UPLOAD IMAGE
document.querySelector("#imgUpload").addEventListener("change", () => {
  // get the file with the file dialog box
  const selectedFile = document.querySelector("#imgUpload").files[0];
  // store it in a FormData object
  const formData = new FormData();
  formData.append("newImage", selectedFile, selectedFile.name);

  let button = document.querySelector(".btn");

  // build an HTTP request data structure
  const xhr = new XMLHttpRequest();
  xhr.open("POST", "/upload", true);
  xhr.onloadend = function(e) {
    // Get the server's response to the upload
    console.log(xhr.responseText);
    let newImage = document.querySelector("#cardImg");
    newImage.src =
      "https://radial-ten-kilometer.glitch.me/images/" + selectedFile.name;
    newImage.style.display = "block";
    document.querySelector(".image").classList.remove("upload");
    button.textContent = "Replace Image";
  };

  button.textContent = "Uploading...";
  // actually send the request
  xhr.send(formData);
});
