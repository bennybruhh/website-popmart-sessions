<?php

require 'includes/session_check.php';

require_once 'db/db_connect.php';

$activePage = 'dashboard';
$page_title = 'Popmart Dashboard';
$db = db_connect();

// total qty in open carts
$cart_count = $db->fetch_one(
    'SELECT COALESCE(SUM(ci.quantity),0) as count FROM carts c JOIN cart_items ci ON ci.cart_id = c.id WHERE c.user_id = ? AND c.status = "open"',
    [$_SESSION['user_id']]
);

// distinct product rows in open cart
$cart_distinct = $db->fetch_one(
    'SELECT COALESCE(COUNT(DISTINCT ci.id),0) as distinct_count FROM carts c JOIN cart_items ci ON ci.cart_id = c.id WHERE c.user_id = ? AND c.status = "open"',
    [$_SESSION['user_id']]
);

// for recent products
$recent_products = $db->fetchAll('SELECT * FROM products ORDER BY created_at DESC LIMIT 6');
?>

<?php require 'includes/header.php'; ?>

<div class="container mt-5 mb-5">
    <h1 class="mb-4">Welcome, <?php echo htmlspecialchars($_SESSION['first_name'] ?? ''); ?>!</h1>

    <!-- User Stats -->
    <div class="row mb-4 align-items-stretch">
        <div class="col-md-4">
            <div class="card text-center shadow-sm h-100">
                <div class="card-body d-flex flex-column justify-content-center">
                    <h2 class="display-4"><?php echo $cart_count['count']; ?></h2>
                    <p class="text-muted">Items in Cart</p>
                    <p class="small text-muted mt-2">Individual products: <?php echo (int)($cart_distinct['distinct_count'] ?? 0); ?></p>
                    <a href="cart.php" class="btn btn-primary mt-3 align-self-center">View Cart</a>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card text-center shadow-sm h-100">
                <div class="card-body d-flex flex-column justify-content-center">
                    <h2 class="display-4"><?php echo count($recent_products); ?></h2>
                    <p class="text-muted">Products Available</p>
                    <a href="products.php" class="btn btn-primary mt-3 align-self-center">Browse</a>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card text-center shadow-sm h-100">
                <div class="card-body d-flex flex-column justify-content-center">
                    <h2 class="display-4">✓</h2>
                    <p class="text-muted">Account Active</p>
                    <a href="logout.php" class="btn btn-danger mt-3 align-self-center">Logout</a>
                </div>
            </div>
        </div>
    </div>

    <!-- Quick Actions -->
    <h3 class="mb-3">Quick Actions</h3>
    <div class="row g-3">
        <div class="col-md-6">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Shop Products</h5>
                    <p class="card-text">Browse our collection of toys you will surely love!</p>
                    <a href="products.php" class="btn btn-primary">Go to Products</a>
                </div>
            </div>
        </div>
        <div class="col-md-6">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">View Cart</h5>
                    <p class="card-text">Check items in your shopping cart.</p>
                    <a href="cart.php" class="btn btn-primary">Go to Cart</a>
                </div>
            </div>
        </div>
    </div>
    
    <?php if (!empty($_SESSION['user_id'])): ?>
    <?php include 'includes/wishlist.php'; ?>
    <?php endif; ?>
</div>

<?php require 'includes/footer.php'; ?>
