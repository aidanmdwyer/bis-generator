<?php
require_once 'db.php';

$conn->query("
    INSERT INTO `bis_count` (`month`, `count`) VALUES (CURRENT_DATE, 0) 
    ON DUPLICATE KEY UPDATE `count` = `count` + 1;
");

$conn->close();
?>