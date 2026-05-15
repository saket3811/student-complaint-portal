const API = "http://localhost:3000";

let allComplaints = [];

// Load Admin Data
if (location.pathname.includes("admin")) {

  fetch(API + "/complaints", {
    headers: {
      role: localStorage.getItem("role")
    }
  })
  .then(res => res.json())
  .then(data => {

    allComplaints = data;
    showData(data);

  })
  .catch(err=>{
    console.log(err);
    alert("Server Error");
  });

}


// Show Data
function showData(data){

  let html = "";

  data.forEach(c => {

    html += `
    <tr>

      <td>${c.name}</td>
      <td>${c.roll}</td>

      <td>${c.hostel || "-"}</td>
      <td>${c.room_no || "-"}</td>

      <td>${c.category}</td>

      <td>${c.priority_level || "-"}</td>
      <td>${c.contact_no || "-"}</td>

      <td>${c.message}</td>

      <td>
        ${
          c.photo
          ? `<img src="/uploads/${c.photo}">`
          : "No Image"
        }
      </td>

      <td>${c.status}</td>

      <td>
        ${
          c.status === "Resolved"
          ? "Done"
          : `<button class="btn-resolve"
               onclick="update(${c.id})">
               Resolve
             </button>`
        }
      </td>

    </tr>
    `;

  });

  document.getElementById("data").innerHTML = html;
}

// ================= LOGIN FUNCTION =================

function login(){

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if(!email || !password){
    alert("Please fill all fields");
    return;
  }

  fetch("http://localhost:3000/login",{

    method:"POST",

    headers:{
      "Content-Type":"application/json"
    },

    body:JSON.stringify({
      email: email,
      password: password
    })

  })
  .then(res=>res.json())
  .then(user=>{

    if(!user){
      alert("Invalid Email or Password");
      return;
    }

    // Save login data
    localStorage.setItem("uid", user.id);
    localStorage.setItem("role", user.role);

    // Redirect
    if(user.role==="admin"){
      location.href="admin.html";
    }else{
      location.href="index.html";
    }

  })
  .catch(err=>{
    console.log(err);
    alert("Server error");
  });

}



// Update Status
function update(id){

  fetch(API + "/update/" + id, {

    method:"PUT",

    headers:{
      "Content-Type":"application/json"
    },

    body:JSON.stringify({
      status:"Resolved"
    })

  })
  .then(res=>res.text())
  .then(()=>{
    alert("Complaint Resolved");
    location.reload();
  });

}
