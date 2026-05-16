<?php
try {
    $conn = new mysqli("localhost", "cwiltoo1_cwil", "8#*[vI%]LakB?v6k", "cwiltoo1_stats");
} catch (mysqli_sql_exception $e) {
    die("MySQL Error: " . $e->getMessage());
}

if ($conn->connect_errno) {
    die('Database connection failed: ' . $conn->connect_error);
}
?>