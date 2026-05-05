<?php
$conn = new mysqli("127.0.0.1:4306", "root", "", "bookmyhelpr");

if ($conn->connect_error) {
    die("❌ Connection failed: " . $conn->connect_error);
}

$userName = $_POST['userName'] ?? '';
$phone    = $_POST['phone'] ?? '';
$altPhone = $_POST['altPhone'] ?? '';
$address  = $_POST['address'] ?? '';
$flat     = $_POST['flat'] ?? '';

// Validation
if (empty($userName) || empty($phone) || empty($altPhone) || empty($address) || empty($flat)) {
    die("❌ All fields are required.");
}

// Insert query
$sql = "INSERT INTO booking (userName, phone, altPhone, address, flat) 
        VALUES (?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ssssi", $userName, $phone, $altPhone, $address, $flat);

if ($stmt->execute()) {
    echo "✅ Booking confirmed for <b>" . htmlspecialchars($userName) . "</b>!";
} else {
    echo "❌ Error: " . $stmt->error;
}

$stmt->close();
$conn->close();
?>
