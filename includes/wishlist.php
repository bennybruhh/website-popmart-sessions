<?php
// session-backed wishlist widget (render only for logged-in users)
if (session_status() === PHP_SESSION_NONE) session_start();
if (empty($_SESSION['user_id'])) return; // don't render when not logged in
?>
<div id="wishlistWidget" class="card mb-3 mt-4">
  <div class="card-body">
    <div class="d-flex justify-content-between align-items-center mb-2">
      <h5 class="mb-0">Wishlist</h5>
      <button id="clearWishlistBtn" class="btn btn-sm btn-outline-danger">clear</button>
    </div>
    <div id="wishlistItems" class="list-group">
      <div class="list-group-item text-muted d-flex align-items-center">
        <div class="spinner-border spinner-border-sm me-2" role="status"><span class="visually-hidden">Loading...</span></div>
        <div>loading…</div>
      </div>
    </div>
  </div>
</div>

<!-- confirm clear modal (local to wishlist widget) -->
<div class="modal fade" id="confirmClearWishlistModal" tabindex="-1" aria-labelledby="confirmClearWishlistLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="confirmClearWishlistLabel">Clear wishlist</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">Are you sure you want to remove all items from your wishlist?</div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button type="button" id="confirmClearWishlistBtn" class="btn btn-danger">Yes, clear</button>
      </div>
    </div>
  </div>
</div>
