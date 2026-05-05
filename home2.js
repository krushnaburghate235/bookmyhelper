<script>
function redirectPage() {
  const worker = document.getElementById("worker").value.toLowerCase();
  const city = document.getElementById("city").value.toLowerCase();

  let pageName = "";

  if (city === "akola" && worker === "mechanic") {
    pageName = "akolamec.html";
  } else if (city === "nashik" && worker === "plumber") {
    pageName = "nashikplumb.html";
  } else if (city === "nagpur" && worker === "electrician") {
    pageName = "nagpurelectric.html";
  } else {
    pageName = "notfound.html"; 
  }

  window.location.href = pageName; // ✅ use the variable
}
</script>
