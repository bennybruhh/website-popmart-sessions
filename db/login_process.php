<?php
// avoid stray output from included files
// buffer and discard output so ajax gets a clean response
ob_start();
include __DIR__ . '/db_connect.php';
ob_end_clean();

// start session before sending output
if (session_status() === PHP_SESSION_NONE) session_start();

// ensure we return plain text and nothing else
header('Content-Type: text/plain; charset=utf-8');

if ($_SERVER["REQUEST_METHOD"] === "POST") {
  $email = isset($_POST['loginEmail']) ? $_POST['loginEmail'] : '';
  $password = isset($_POST['loginPassword']) ? $_POST['loginPassword'] : '';

  $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
  $stmt->execute([$email]);
  $user = $stmt->fetch();

  if ($user) {
    if (password_verify($password, $user['password'])) {
      // set session values
      $_SESSION['user_id'] = $user['id'];
      $_SESSION['first_name'] = $user['first_name'];
      $_SESSION['last_name'] = $user['last_name'];
      $_SESSION['email'] = $user['email'];
      echo "success";
      exit;
    } else {
      echo "invalid_password";
      exit;
    }
  } else {
    echo "no_user";
    exit;
  }
} else {
  echo "Invalid request method";
  exit;
}
?>
