import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
  ref,
  uploadBytes,
  getDownloadURL,
  listAll
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";

import {
  auth,
  db,
  storage
} from "./firebase-config.js";

const authPage = document.getElementById("authPage");
const appPage = document.getElementById("appPage");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const authMessage = document.getElementById("authMessage");

const loginId = document.getElementById("loginId");
const loginPassword = document.getElementById("loginPassword");

const registerId = document.getElementById("registerId");
const registerUsername = document.getElementById("registerUsername");
const registerPassword = document.getElementById("registerPassword");
const registerPassword2 = document.getElementById("registerPassword2");

const profileInfo = document.getElementById("profileInfo");

const photoInput = document.getElementById("photoInput");
const gallery = document.getElementById("gallery");

const uploadMessage = document.getElementById("uploadMessage");

function showMessage(message) {
  authMessage.textContent = message;
}

function cleanId(value) {
  return value.trim();
}

function cleanUsername(value) {
  return value.trim().toLowerCase();
}

function makeAuthEmail(id) {
  return `${id}@auth.ecotrack.local`;
}


// ===============================
// PINDAH FORM
// ===============================

document
  .getElementById("showRegisterBtn")
  .addEventListener("click", () => {

    loginForm.classList.add("hidden");
    registerForm.classList.remove("hidden");

    showMessage("");
  });


document
  .getElementById("showLoginBtn")
  .addEventListener("click", () => {

    registerForm.classList.add("hidden");
    loginForm.classList.remove("hidden");

    showMessage("");
  });


// ===============================
// REGISTER
// ===============================

document
  .getElementById("registerBtn")
  .addEventListener("click", async () => {

    const id = cleanId(registerId.value);
    const username = cleanUsername(registerUsername.value);

    const password = registerPassword.value;
    const password2 = registerPassword2.value;


    if (!/^[0-9]+$/.test(id)) {
      showMessage("ID hanya boleh berisi angka.");
      return;
    }


    if (id.length < 4 || id.length > 20) {
      showMessage("ID harus 4-20 angka.");
      return;
    }


    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      showMessage(
        "Username hanya boleh huruf, angka, dan underscore."
      );
      return;
    }


    if (username.length < 3 || username.length > 30) {
      showMessage("Username harus 3-30 karakter.");
      return;
    }


    if (password.length < 6) {
      showMessage("Password minimal 6 karakter.");
      return;
    }


    if (password !== password2) {
      showMessage("Konfirmasi password tidak sama.");
      return;
    }


    try {

      showMessage("Membuat akun...");


      const credential =
        await createUserWithEmailAndPassword(
          auth,
          makeAuthEmail(id),
          password
        );


      const user = credential.user;


      await setDoc(
        doc(db, "users", user.uid),
        {
          userId: id,
          username: username,
          role: "user",
          createdAt: serverTimestamp()
        }
      );


      showMessage("Akun berhasil dibuat!");


    } catch (error) {

      console.error(error);


      if (
        error.code ===
        "auth/email-already-in-use"
      ) {

        showMessage(
          "ID tersebut sudah digunakan."
        );

      } else {

        showMessage(error.message);

      }

    }

  });


// ===============================
// LOGIN
// ===============================

document
  .getElementById("loginBtn")
  .addEventListener("click", async () => {

    const id = cleanId(loginId.value);
    const password = loginPassword.value;


    if (!/^[0-9]+$/.test(id)) {
      showMessage("ID hanya boleh berupa angka.");
      return;
    }


    if (!password) {
      showMessage("Masukkan password.");
      return;
    }


    try {

      showMessage("Login...");


      await signInWithEmailAndPassword(
        auth,
        makeAuthEmail(id),
        password
      );


      showMessage("");


    } catch (error) {

      console.error(error);

      showMessage("ID atau password salah.");

    }

  });


// ===============================
// LOGOUT
// ===============================

document
  .getElementById("logoutBtn")
  .addEventListener("click", async () => {

    await signOut(auth);

  });


// ===============================
// UPLOAD FOTO
// ===============================

document
  .getElementById("uploadBtn")
  .addEventListener("click", async () => {

    const user = auth.currentUser;
    const file = photoInput.files[0];


    if (!user) {

      uploadMessage.textContent =
        "Kamu belum login.";

      return;
    }


    if (!file) {

      uploadMessage.textContent =
        "Pilih foto terlebih dahulu.";

      return;
    }


    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];


    if (!allowedTypes.includes(file.type)) {

      uploadMessage.textContent =
        "Format harus JPG, PNG, atau WebP.";

      return;
    }


    if (file.size > 5 * 1024 * 1024) {

      uploadMessage.textContent =
        "Ukuran foto maksimal 5 MB.";

      return;
    }


    try {

      uploadMessage.textContent =
        "Mengupload...";


      const extension =
        file.name
          .split(".")
          .pop()
          .toLowerCase();


      const fileName =
        `${crypto.randomUUID()}.${extension}`;


      const fileRef =
        ref(
          storage,
          `photos/${user.uid}/${fileName}`
        );


      await uploadBytes(
        fileRef,
        file,
        {
          contentType: file.type
        }
      );


      const url =
        await getDownloadURL(fileRef);


      showPhoto(
        url,
        file.name
      );


      photoInput.value = "";


      uploadMessage.textContent =
        "Upload berhasil.";


    } catch (error) {

      console.error(error);


      uploadMessage.textContent =
        "Upload gagal: " +
        error.message;

    }

  });


// ===============================
// TAMPILKAN FOTO
// ===============================

function showPhoto(url, name) {

  const div =
    document.createElement("div");

  div.className = "photo";


  const img =
    document.createElement("img");

  img.src = url;
  img.alt = name;


  const p =
    document.createElement("p");

  p.textContent = name;


  div.appendChild(img);
  div.appendChild(p);


  gallery.prepend(div);

}


// ===============================
// LOAD FOTO USER
// ===============================

async function loadPhotos(user) {

  gallery.innerHTML = "";


  try {

    const folder =
      ref(
        storage,
        `photos/${user.uid}`
      );


    const result =
      await listAll(folder);


    for (const item of result.items) {

      const url =
        await getDownloadURL(item);


      showPhoto(
        url,
        item.name
      );

    }

  } catch (error) {

    console.error(
      "Gagal memuat foto:",
      error
    );

  }

}


// ===============================
// CEK LOGIN
// ===============================

onAuthStateChanged(
  auth,
  async (user) => {

    if (user) {

      authPage.classList.add("hidden");
      appPage.classList.remove("hidden");


      try {

        const profile =
          await getDoc(
            doc(
              db,
              "users",
              user.uid
            )
          );


        if (profile.exists()) {

          const data =
            profile.data();


          profileInfo.textContent =
            `ID: ${data.userId} | Username: ${data.username}`;

        }

      } catch (error) {

        console.error(
          "Profil gagal dimuat:",
          error
        );

      }


      await loadPhotos(user);


    } else {

      authPage.classList.remove("hidden");
      appPage.classList.add("hidden");

      gallery.innerHTML = "";

    }

  }
);
