// authentication helpers (forms handled in validation.js)
// logout
$(document).on('click', '#logoutBtn', function(e) {
    e.preventDefault();
    
    if (confirm('Are you sure you want to logout?')) {
        $.ajax({
            type: 'POST',
            url: '/website-popmart-sessions/db/logout_process.php',
            success: function(response) {
                // reload to refresh header
                location.reload();
            },
            error: function() {
                alert('Error logging out. Please try again.');
            }
        });
    }
});

// open login modal when visiting cart if not logged in
$(document).on('click', 'a[href$="/cart.php"], a[href$="cart.php"]', function(e) {
    if (window.IS_LOGGED_IN) return; // allow when logged in
    e.preventDefault();
    // inline feedback
    if ($('#loginModal').length) {
        var loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
        loginModal.show();
        // gentle note in the login modal
        const $box = $('#loginFeedback');
        if ($box.length) {
            $box.html('<div class="alert alert-warning py-2 px-3 mb-0" role="alert">Please log in to add items to your cart.</div>');
        }
    } else {
        // fallback: navigate to index where modal exists
        window.location.href = '/website-popmart-sessions/index.php#login';
    }
});

// Add-to-cart modal and AJAX
$(function(){
    function peso(n){ return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(n); }
    function clampQty(q, max){ q = parseInt(q||'1',10); if(isNaN(q)||q<1) q=1; if(max && q>max) q=max; return q; }
    function updateCartBadge(){
        $.get('/website-popmart-sessions/db/cart_count.php', function(r){
            if (typeof r === 'string') { try { r = JSON.parse(r); } catch(_e) { r = { count: 0 }; } }
            var count = (r && typeof r.count !== 'undefined') ? r.count : 0;
            var badge = document.getElementById('cartCount');
            if (!badge) return;
            if (count > 0) { badge.style.display = 'inline-block'; badge.textContent = count; }
            else { badge.style.display = 'none'; badge.textContent = '0'; }
        });
    }
    // initialize badge on load if logged in
    if (window.IS_LOGGED_IN) updateCartBadge();

    // open add-to-cart modal (or prompt login)
    $(document).on('click', '.add-to-cart', function(e){
        if (!window.IS_LOGGED_IN) {
            e.preventDefault();
            try { new bootstrap.Modal(document.getElementById('loginModal')).show(); } catch(_e) {}
            return;
        }
        e.preventDefault();
        const $card = $(this).closest('.card');
        const productId = $(this).data('product-id');
        const title = $card.find('h5').text().trim();
        const img = $card.find('img').attr('src');
        const unitPrice = parseFloat($(this).data('price')) || parseFloat(($card.find('.card-text').text().replace(/[^0-9.]/g,'')));
        const stock = parseInt($(this).data('stock')) || 25;

        $('#cartModalProductId').val(productId);
        $('#cartModalUnitPrice').val(unitPrice);
        $('#cartModalTitle').text(title);
        $('#cartModalImage').attr('src', img);
        $('#cartModalPrice').text(peso(unitPrice));
        $('#cartModalStock').text('Stock Remaining: ' + stock);
        $('#qtyInput').val(1);
        $('#cartModalTotal').text(peso(unitPrice));
        var atcModal = new bootstrap.Modal(document.getElementById('addToCartModal'));
        atcModal.show();
    });

    function recalc(){
        const qty = clampQty($('#qtyInput').val());
        const unit = parseFloat($('#cartModalUnitPrice').val());
        $('#qtyInput').val(qty);
        $('#cartModalTotal').text(peso(qty * unit));
    }
    $(document).on('click', '#qtyMinus', function(){ $('#qtyInput').val(clampQty($('#qtyInput').val())-1); recalc(); });
    $(document).on('click', '#qtyPlus', function(){ $('#qtyInput').val(clampQty($('#qtyInput').val())+1); recalc(); });
    $(document).on('input', '#qtyInput', recalc);

    // confirm add to cart
    $(document).on('click', '#confirmAddToCartBtn', function(){
        const productId = $('#cartModalProductId').val();
        const quantity = clampQty($('#qtyInput').val());
        $.ajax({
            type: 'POST',
            url: '/website-popmart-sessions/db/cart_add.php',
            data: { product_id: productId, quantity: quantity },
            dataType: 'json',
            success: function(r){
                if(r.success){
                    try { bootstrap.Modal.getInstance(document.getElementById('addToCartModal')).hide(); } catch(_e) {}
                    // show success toast and stay on the same page
                    try {
                        var toastEl = document.getElementById('globalToast');
                        var body = document.getElementById('globalToastMessage');
                        if (body) body.textContent = 'Added to your cart!';
                        var toast = new bootstrap.Toast(toastEl, { delay: 1500 });
                        toast.show();
                    } catch(_err) { /* no-op */ }
                    updateCartBadge();
                } else {
                    // show error toast
                    try {
                        var toastErrEl = document.getElementById('globalToastError');
                        var msg = document.getElementById('globalToastErrorMessage');
                        if (msg) msg.textContent = r.message || 'Failed to add to cart';
                        var toastErr = new bootstrap.Toast(toastErrEl, { delay: 2000 });
                        toastErr.show();
                    } catch(_e) { alert(r.message || 'Failed to add to cart'); }
                }
            },
            error: function(xhr, status, err){
                // try to recover JSON if parse failed
                try {
                    var text = xhr && xhr.responseText ? xhr.responseText.trim() : '';
                    if (text) {
                        var parsed = JSON.parse(text);
                        if (parsed && parsed.success) {
                            try { bootstrap.Modal.getInstance(document.getElementById('addToCartModal')).hide(); } catch(_e) {}
                            try {
                                var toastEl = document.getElementById('globalToast');
                                var body = document.getElementById('globalToastMessage');
                                if (body) body.textContent = 'Added to your cart!';
                                var toast = new bootstrap.Toast(toastEl, { delay: 1500 });
                                toast.show();
                            } catch(_err) {}
                            updateCartBadge();
                            return;
                        }
                    }
                } catch (e) {
                    console.error('Error parsing cart_add response:', e, xhr && xhr.responseText);
                }
                // fallback network error
                alert('Network error. Please try again.');
            }
        });
    });
});
