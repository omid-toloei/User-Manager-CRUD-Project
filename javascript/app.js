/* =========================
DOM Elements
========================= */

const loaderParent = document.querySelector(".loader-parent");
const appNotification = document.querySelector(".app-notification");
const appNotificationText = document.querySelector("#appNotificationText");
const appNotificationCloseIcon = document.querySelector(
  ".app-notification-close-icon",
);

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

userList.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const userCard = event.target.closest(".user-card");
  if (!userCard) return;

  if (button.classList.contains("edit-button")) {
    console.log(`Edit : ${userCard.dataset.userId}`);
  }

  if (button.classList.contains("delete-button")) {
    deleteUser(userCard.dataset.userId);
  }
});

/* =========================
API
========================= */

async function request(url, options) {
  if (isLoading) return;

  isLoading = true;
  showLoading(isLoading);

  try {
    let response = await fetch(url, options);

    if (!response.ok) {
      throw response.status;
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      throw "NETWORK_ERROR";
    }
    throw error;
  } finally {
    isLoading = false;
    showLoading(isLoading);
  }
}

async function getUsers() {
  try {
    let apiUsersResponse = await request(
      "https://jsonplaceholder.typicode.com/users",
    );
    users = apiUsersResponse;
    return true;
  } catch (error) {
    showError(error);
    return false;
  }
}

async function createNewUser() {
  if (inputName.value == "" || inputEmail.value == "" || inputCity.value == "")
    return;

  try {
    const emailExists = users.some((user) => user.email == inputEmail.value);
    if (emailExists) {
      clearInputs();
      showNotification("Email already exists", "red", 3000);
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

    clearInputs();

    showNotification("User added successfully", "green", 3000);
  } catch (error) {
    showError(error);
  }
}

async function deleteUser(userId) {
  try {
    await request(`https://jsonplaceholder.typicode.com/users/${userId}`, {
      method: "DELETE",
    });

    const indexUserForDelete = users.findIndex((user) => user.id == userId);

    if (indexUserForDelete == -1) {
      return;
    }

    users.splice(indexUserForDelete, 1);
    showUsers(users);
  } catch (error) {
    showError(error);
  }
}

/* =========================
Functions
========================= */

function showLoading(status) {
  if (status) {
    loaderParent.style.display = "flex";
  } else {
    loaderParent.style.display = "none";
  }
}

function showError(errorStatus) {
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
    case "NETWORK_ERROR":
      errorMessage = "Please check your internet connection";
      break;
    default:
      errorMessage = `Something went wrong (${errorStatus})! please try again later`;
  }

  userList.innerHTML = `<li class="error-state">
          <i class="fa-solid fa-circle-exclamation"></i>
          <h3>${errorMessage}</h3>
        </li>`;
}

function showUsers(array) {
  let showUsersStructure = "";
  array.forEach((object) => {
    showUsersStructure += `<li class="user-card" data-user-id="${object.id}">
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

function clearInputs() {
  inputName.value = "";
  inputEmail.value = "";
  inputCity.value = "";
}

function showNotification(message, backgroundColor, time) {
  appNotification.style.display = "block";
  appNotificationText.innerHTML = message;
  appNotification.style.backgroundColor = backgroundColor;

  setTimeout(() => {
    appNotification.style.display = "none";
  }, time);
}

/* =========================
Render Functions
========================= */

async function run() {
  const success = await getUsers();

  if (!success) return;

  showUsers(users);
}
run();
