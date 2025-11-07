<?php
header('Content-Type: application/json; charset=utf-8');
if (session_status()===PHP_SESSION_NONE) session_start();
if (empty($_SESSION['user_id'])) { http_response_code(401); echo json_encode(['success'=>false,'message'=>'unauthenticated']); exit; }
$product_id = isset($_POST['product_id']) ? (int)$_POST['product_id'] : 0;
if ($product_id <= 0) { http_response_code(400); echo json_encode(['success'=>false,'message'=>'invalid product']); exit; }
if (!isset($_SESSION['wishlist']) || !is_array($_SESSION['wishlist'])) $_SESSION['wishlist'] = [];
if (!in_array($product_id, $_SESSION['wishlist'])) $_SESSION['wishlist'][] = $product_id;
echo json_encode(['success'=>true,'data'=>array_values($_SESSION['wishlist'])]);
