<?php
require_once 'db.php';

$conn->query("
    INSERT INTO `bis_count` (`month`, `count`) VALUES (DATE_FORMAT(CURRENT_DATE, '%Y-%m-01'), 1) 
    ON DUPLICATE KEY UPDATE `count` = `count` + 1;
");

$conn->close();
?>