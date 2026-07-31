/* =========================
DOM Elements
========================= */

const loaderParent = document.querySelector(".loader-parent");
const appNotification = document.querySelector(".app-notification");
const appNotificationCloseIcon = document.querySelector(".app-notification-close-icon");

const userList = document.querySelector(".user-list");

const searchBox = document.querySelector("#searchBox");
const showCountResult = document.querySelector("#showCountResult");

// post form
const newUserForm = document.querySelector("#newUserForm");
const inputName = document.querySelector("#inputName");
const inputEmail = document.querySelector("#inputEmail");
const inputCity = document.querySelector("#inputCity");
const submitBtn = document.querySelector("#submitBtn");

/* =========================
Global Variables
========================= */

let users = [];

let isLoading = false;

/* =========================
Event Listeners
========================= */

searchBox.addEventListener("keyup", () => {
  showCountResult.style.display = "none";
  searchByName(users);
});

newUserForm.addEventListener("submit", (event) => {
  event.preventDefault();
});

submitBtn.addEventListener("click", () => {
  createNewUser();
});

appNotificationCloseIcon.addEventListener("click", () => {
  appNotification.style.display = "none";
});

/* =========================
API
========================= */

async function request(url, options) {
  try {
    if (isLoading) return;

    showLoading("true");

    let response = await fetch(url, options);

    if (!response.ok) {
      throw response.status;
    }

    let dataJson = await response.json();
    return dataJson;
  } catch (error) {
    showError(error, url);
  } finally {
    showLoading("false");
  }
}

async function getUsers() {
  let apiUsersResponse = await request(
    "https://jsonplaceholder.typicode.com/users",
  );
  users = apiUsersResponse;
}

async function createNewUser() {
  const emailExists = users.some((user) => user.email == inputEmail.value);
  if (emailExists) {
    appNotification.style.display = "block";
    inputName.value = "";
    inputEmail.value = "";
    inputCity.value = ""; 
    return;
  }

  let newUser = {
    name: inputName.value,
    email: inputEmail.value,
    address: {
      city: inputCity.value,
    },
  };

  let response = await request("https://jsonplaceholder.typicode.com/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newUser),
  });

  users.push(response);
  showUsers(users);

  inputName.value = "";
  inputEmail.value = "";
  inputCity.value = "";
}

/* =========================
Functions
========================= */

function showLoading(status) {
  if (status == "true") {
    loaderParent.style.display = "flex";
  } else {
    loaderParent.style.display = "none";
  }
}

function showError(errorStatus, url) {
  let errorMessage = "";

  switch (errorStatus) {
    case 404:
      errorMessage = "data not found!";
      break;
    case 500:
      errorMessage = "The server is not responding! please try again later...";
      break;
    case 503:
      errorMessage = "The server is temporarily unavailable!";
      break;
    default:
      errorMessage = "Something went wrong! please try again later...";
  }

  userList.innerHTML = `<li class="error-state">
          <i class="fa-solid fa-circle-exclamation"></i>
          <h3>${errorMessage}</h3>
          <button class="retry-btn">
            <i class="fa-solid fa-rotate-right"></i>
            Try Again
          </button>
        </li>`;
  const retryBtn = document.querySelector(".retry-btn");
  retryBtn.addEventListener("click", () => {
    request(url);
  });
}

function showUsers(array) {
  let showUsersStructure = "";
  array.forEach((object) => {
    showUsersStructure += `<li class="user-card">
          <div class="user-details">
            <h3>${object.name}</h3>
            <p>${object.email}</p>
            <span>${object.address.city}</span>
          </div>
          <div class="user-actions">
            <button class="edit-button">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="delete-button">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </li>`;
  });

  userList.innerHTML = showUsersStructure;
}

function searchByName(array) {
  let searchBoxValue = searchBox.value;

  let searchResult = array.filter((object) => {
    return object.name.includes(searchBoxValue);
  });

  switch (searchResult.length) {
    case 0:
      userList.innerHTML = `<li class="error-state">
          <i class="fa-solid fa-circle-exclamation"></i>
          <h3>No results found!</h3>
        </li>`;
      break;
    case 1:
      showCountResult.style.display = "block";
      showCountResult.textContent = "1 result found";
      showUsers(searchResult);
      break;
    case array.length:
      showCountResult.style.display = "none";
      showUsers(users);
      break;
    default:
      showCountResult.style.display = "block";
      showCountResult.innerHTML = `${searchResult.length} results`;
      showUsers(searchResult);
  }
}

/* =========================
Render Functions
========================= */

async function run() {
  await getUsers();
  showUsers(users);
}
run();
