const backendURL = "https://YOUR-BACKEND-NAME.onrender.com"; // replace after deploy

async function uploadFile() {
  const fileInput = document.getElementById("fileInput");
  const receiverId = document.getElementById("receiverId").value;
  const uploadStatus = document.getElementById("uploadStatus");

  if (!fileInput.files.length || !receiverId) {
    uploadStatus.innerText = "Please select a file and enter Receiver ID.";
    return;
  }

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);
  formData.append("receiverId", receiverId);

  uploadStatus.innerText = "Uploading...";
  const response = await fetch(`${backendURL}/upload`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  uploadStatus.innerText = data.message + " | Hash: " + data.hash;
}

async function downloadFile() {
  const receiverId = document.getElementById("downloadReceiverId").value;
  if (!receiverId) return alert("Enter Receiver ID first.");

  const link = document.createElement("a");
  link.href = `${backendURL}/download/${receiverId}`;
  link.click();
}

async function verifyFile() {
  const receiverId = document.getElementById("downloadReceiverId").value;
  const verifyStatus = document.getElementById("verifyStatus");

  if (!receiverId) return alert("Enter Receiver ID first.");

  const res = await fetch(`${backendURL}/verify/${receiverId}`);
  const data = await res.json();

  verifyStatus.innerText = data.message;
}
