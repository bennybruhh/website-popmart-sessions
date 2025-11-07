<?php
header('Content-Type: application/json; charset=utf-8');
if (session_status()===PHP_SESSION_NONE) session_start();
if (empty($_SESSION['user_id'])) { http_response_code(401); echo json_encode(['success'=>false,'message'=>'unauthenticated']); exit; }
unset($_SESSION['wishlist']);
echo json_encode(['success'=>true]);
