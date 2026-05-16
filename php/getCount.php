<?php
require_once 'db.php';

$result = $conn->query("SELECT SUM(`count`) AS total FROM `bis_count`;");

if ($result && $row = $result->fetch_assoc()) {
    echo $row['total'];
} else {
    echo -1;
}

$conn->close();
?>