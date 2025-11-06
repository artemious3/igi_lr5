function preventDefault(e) {
  e.preventDefault();
}
function preventDefaultForScrollKeys(e) {
  const keys = {
    37: 1,
    38: 1,
    39: 1,
    40: 1,
    32: 1,
    33: 1,
    34: 1,
    35: 1,
    36: 1,
  }; // Arrow keys, space, page up/down, home/end
  if (keys[e.keyCode]) {
    preventDefault(e);
    return false;
  }
}

function disablePage() {
  window.addEventListener("wheel", preventDefault, { passive: false });
  window.addEventListener("touchmove", preventDefault, { passive: false });
  window.addEventListener("keydown", preventDefaultForScrollKeys, {
    passive: false,
  });
  window.addEventListener("click", preventDefault, { passive: false });
}

function enablePage() {
  window.removeEventListener("wheel", preventDefault, { passive: false });
  window.removeEventListener("touchmove", preventDefault, { passive: false });
  window.removeEventListener("keydown", preventDefaultForScrollKeys, {
    passive: false,
  });
  window.removeEventListener("click", preventDefault, { passive: false });
}

function ageCheckSuccess() {
  localStorage.setItem("ageChecked", "true");
  document.getElementById("age-checker-container").style.display = "none";
}

function ageCheckFail() {
  localStorage.setItem("ageChecked", "false");
  document.getElementById("age-checker-container").style.display = "initial";
  document.getElementById("age-bad-message").style.display = "initial";
  document.getElementById("age-checker").style.display = "none";
  alert("You need parents' permission!");
}

//https://stackoverflow.com/questions/4060004/calculate-age-given-the-birth-date-in-the-format-yyyymmdd
function getAge(dateString) {
  var today = new Date();
  var birthDate = new Date(dateString);
  var age = today.getFullYear() - birthDate.getFullYear();
  var m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function waitForAgeChecked() {
  document.getElementById("age-checker-container").style.display = "initial";
  document.getElementById("age-checker").style.display = "initial";
  document.getElementById("age-bad-message").style.display = "none";
  let ageInput = document
    .getElementById("age-checker")
    .getElementsByTagName("input")[0];
  ageInput.max = new Date().toISOString().split("T")[0]; //today

  document
    .getElementById("age-confirm-btn")
    .addEventListener("click", function () {
      if (!ageInput.checkValidity()) {
        return;
      }

      let age = getAge(ageInput.value);
      if (age < 18) {
        disablePage();
        ageCheckFail();
      } else {
        enablePage();
        ageCheckSuccess();
      }
    });
}

function checkAge() {
  let ageMaybeChecked = localStorage.getItem("ageChecked");
  if (ageMaybeChecked == "true") {
    enablePage();
    ageCheckSuccess();
  } else if (ageMaybeChecked == "false") {
    disablePage();
    ageCheckFail();
  } else {
    disablePage();
    waitForAgeChecked();
  }
}

document.addEventListener("DOMContentLoaded", function() {
  checkAge();
});
