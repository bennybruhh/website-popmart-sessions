<?php
header('Content-Type: application/json; charset=utf-8');
if (session_status()===PHP_SESSION_NONE) session_start();
if (empty($_SESSION['user_id'])) { http_response_code(401); echo json_encode(['success'=>false,'message'=>'unauthenticated']); exit; }

$wl = isset($_SESSION['wishlist']) && is_array($_SESSION['wishlist']) ? array_values(array_map('intval', $_SESSION['wishlist'])) : [];
if (empty($wl)) {
	echo json_encode(['success'=>true,'data'=>[]]);
	exit;
}

// lookup product metadata so the widget can display names and thumbnails
require_once __DIR__ . '/db_connect.php';
global $pdo;
try {
	$placeholders = implode(',', array_fill(0, count($wl), '?'));
	$sql = "SELECT id, name, image_path, price FROM products WHERE id IN ($placeholders)";
	$stmt = $pdo->prepare($sql);
	$stmt->execute($wl);
	$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

	// re-order results to match wishlist order
	$byId = [];
	foreach ($rows as $r) { $byId[(int)$r['id']] = $r; }
	$out = [];
	foreach ($wl as $pid) {
		if (isset($byId[$pid])) {
			$out[] = [
				'id' => (int)$byId[$pid]['id'],
				'name' => $byId[$pid]['name'],
				'image' => $byId[$pid]['image_path'] ?? null,
				'price' => isset($byId[$pid]['price']) ? (float)$byId[$pid]['price'] : null,
			];
		}
	}

	echo json_encode(['success'=>true,'data'=>$out]);
} catch (Exception $e) {
	http_response_code(500);
	echo json_encode(['success'=>false,'message'=>'server error']);
}
