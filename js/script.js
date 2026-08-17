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

// add new user form
const newUserForm = document.querySelector("#newUserForm");
const newUserInputName = document.querySelector("#newUserInputName");
const newUserInputEmail = document.querySelector("#newUserInputEmail");
const newUserInputCity = document.querySelector("#newUserInputCity");
const newUserSubmitBtn = document.querySelector("#newUserSubmitBtn");

// edit user form
const editUserForm = document.querySelector("#editUserForm");
const editUserInputName = document.querySelector("#editUserInputName");
const editUserInputEmail = document.querySelector("#editUserInputEmail");
const editUserInputCity = document.querySelector("#editUserInputCity");
const editUserSubmitBtn = document.querySelector("#editUserSubmitBtn");
const editUserCancelBtn = document.querySelector("#editUserCancelBtn");

/* =========================
Global Variables
========================= */

let users = [];
let editingUserId = null;
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

editUserForm.addEventListener("submit", (event) => {
  event.preventDefault();
});

newUserSubmitBtn.addEventListener("click", () => {
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
    showEditForm(Number(userCard.dataset.userId));
  }

  if (button.classList.contains("delete-button")) {
    deleteUser(userCard.dataset.userId);
  }
});

editUserCancelBtn.addEventListener("click", () => {
  editUserForm.style.display = "none";
  newUserForm.style.display = "flex";

  clearInputs("editUserForm");
});

editUserSubmitBtn.addEventListener("click", () => {
  if (validateEditForm()) {
    editUser(editingUserId);
  } else {
    return;
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
  if (
    newUserInputName.value == "" ||
    newUserInputEmail.value == "" ||
    newUserInputCity.value == ""
  )
    return;

  try {
    const emailExists = users.some(
      (user) => user.email == newUserInputEmail.value,
    );
    if (emailExists) {
      clearInputs("newUserForm");
      showNotification("Email already exists", "red", 3000);
      return;
    }

    let newUser = {
      name: newUserInputName.value,
      email: newUserInputEmail.value,
      address: {
        city: newUserInputCity.value,
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

async function editUser(userId) {
  try {
    let updatedUser = await request(
      `https://jsonplaceholder.typicode.com/users/${userId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editUserInputName.value,
          email: editUserInputEmail.value,
          address: {
            city: editUserInputCity.value,
          },
        }),
      },
    );

    updateUsersArray(updatedUser);

    editUserForm.style.display = "none";
    newUserForm.style.display = "flex";
    
    clearInputs("editUserForm");

    showUsers(users);

    showNotification("User successfully changed", "green", 3000);

    editingUserId = null;
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

function clearInputs(form) {
  if (form === "newUserForm") {
    newUserInputName.value = "";
    newUserInputEmail.value = "";
    newUserInputCity.value = "";
  } else if (form === "editUserForm") {
    editUserInputName.value = "";
    editUserInputEmail.value = "";
    editUserInputCity.value = "";
  }
}

function showEditForm(userId) {
  editUserForm.style.display = "flex";
  newUserForm.style.display = "none";

  editingUserId = userId;

  let user = users.find((user) => user.id == userId);

  editUserInputName.value = user.name;
  editUserInputEmail.value = user.email;
  editUserInputCity.value = user.address.city;
}

function showNotification(message, backgroundColor, time) {
  appNotification.style.display = "block";
  appNotificationText.innerHTML = message;
  appNotification.style.backgroundColor = backgroundColor;

  setTimeout(() => {
    appNotification.style.display = "none";
  }, time);
}

function validateEditForm() {
  let userEditingIndex = users.findIndex((user) => user.id === editingUserId);
  let usersWithoutEditingUser = users.filter(
    (_, index) => index !== userEditingIndex,
  );
  let emailExists = usersWithoutEditingUser.some(
    (user) => user.email == editUserInputEmail.value,
  );
  

  if (
    editUserInputName.value == "" ||
    editUserInputEmail.value == "" ||
    editUserInputCity.value == ""
  ) {
    showNotification("Input fields must not be empty", "red", 3000);
    return false;
  } else if (emailExists) {
    showNotification("Email already exists", "red", 3000);
    return false;
  } else {
    return true;
  }
}

function updateUsersArray(updatedUser) {
  let userIndex = users.findIndex(user => user.id === editingUserId);
  users[userIndex] = updatedUser;
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
