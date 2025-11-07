<?php

if (session_status()=== PHP_SESSION_NONE){
    session_start();
}

// redirect unauthenticated users
if (!isset($_SESSION["user_id"])) {
    header('Location: /website-popmart-sessions/index.php?error=Please+login+to+access+this+page');
    exit();
}
?>