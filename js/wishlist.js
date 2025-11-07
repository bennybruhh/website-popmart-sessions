$(function(){
  function showToast(message, success){
    try {
      if (success) {
        $('#globalToastMessage').text(message);
        new bootstrap.Toast(document.getElementById('globalToast')).show();
      } else {
        $('#globalToastErrorMessage').text(message);
        new bootstrap.Toast(document.getElementById('globalToastError')).show();
      }
    } catch (e) { /* fallback silent */ }
  }

  function renderList(items){
    var $container = $('#wishlistItems');
    if (!$container.length) return;
    if (!items || items.length === 0) {
      $container.html('<div class="list-group-item text-muted">no items saved</div>');
      updateWishlistBadge(0);
      return;
    }
    var html = '';
    // items may be either ids (legacy) or objects with id,name,image
    items.forEach(function(it){
      var id = (typeof it === 'object') ? it.id : it;
      var name = (typeof it === 'object') ? (it.name || ('product #' + id)) : ('product #' + id);
      var img = (typeof it === 'object') ? it.image : null;
  html += '<div class="list-group-item d-flex align-items-center py-3">';
      if (img) {
        html += '<img src="'+img+'" alt="'+name+'" class="me-3" style="width:56px;height:56px;object-fit:cover;border-radius:4px;">';
      }
      html += '<div class="flex-grow-1">';
      html += '<div><strong>'+name+'</strong></div>';
      if (typeof it === 'object' && it.price) html += '<div class="text-muted small">Php '+(parseFloat(it.price).toFixed(2))+'</div>';
      html += '</div>';
  // right-side action buttons: small, spaced, matching site style
  html += '<div class="ms-3 d-flex gap-2">';
  html += '<button class="btn btn-sm btn-outline-primary view-product" data-id="'+id+'">view</button>';
  html += '<button class="btn btn-sm btn-outline-danger remove-wishlist" data-id="'+id+'">remove</button>';
  html += '</div></div>';
    });
    $container.html(html);
    updateWishlistBadge(items.length);
  }

  function fetchList(){
    $.get('/website-popmart-sessions/db/wishlist_list.php', function(res){
      if (typeof res === 'string') { try { res = JSON.parse(res); } catch(e){ res = {success:false}; } }
      if (res.success) renderList(res.data);
      else renderList([]);
    });
  }

  $(document).on('click', '.add-wishlist', function(e){
    e.preventDefault();
    var pid = $(this).data('product-id');
    $.post('/website-popmart-sessions/db/wishlist_add.php', { product_id: pid }, function(res){
      if (typeof res === 'string') { try { res = JSON.parse(res); } catch(e){ res = {success:false}; } }
      if (res.success) { fetchList(); showToast('saved to wishlist', true); }
      else { showToast(res.message || 'failed to save', false); }
    });
  });

  $(document).on('click', '.remove-wishlist', function(){
    var pid = $(this).data('id');
    $.post('/website-popmart-sessions/db/wishlist_remove.php', { product_id: pid }, function(res){
      if (typeof res === 'string') { try { res = JSON.parse(res); } catch(e){ res = {success:false}; } }
      if (res.success) { fetchList(); showToast('removed from wishlist', true); } else showToast(res.message || 'failed to remove', false);
    });
  });

  $(document).on('click', '#clearWishlistBtn', function(){
    // show confirmation modal
    try { new bootstrap.Modal(document.getElementById('confirmClearWishlistModal')).show(); } catch(e) { if (!confirm('clear wishlist?')) return; $('#confirmClearWishlistBtn').trigger('click'); }
  });

  // confirmed clear via modal
  $(document).on('click', '#confirmClearWishlistBtn', function(){
    var $btn = $(this);
    $btn.prop('disabled', true).text('Clearing...');
    $.post('/website-popmart-sessions/db/wishlist_clear.php', function(res){
      try { $('#confirmClearWishlistModal').modal('hide'); } catch(e) { $('#confirmClearWishlistModal').hide(); }
      $btn.prop('disabled', false).text('Yes, clear');
      if (typeof res === 'string') { try { res = JSON.parse(res); } catch(e){ res = {success:false}; } }
      if (res.success) { fetchList(); showToast('wishlist cleared', true); } else showToast(res.message || 'failed to clear', false);
    }).fail(function(){ $btn.prop('disabled', false).text('Yes, clear'); showToast('network error', false); });
  });

  $(document).on('click', '.view-product', function(){
    var pid = $(this).data('id');
    window.location.href = '/website-popmart-sessions/products.php?id=' + pid;
  });

  if ($('#wishlistWidget').length) fetchList();

  // update header badge when wishlist changed
  function updateWishlistBadge(count){
    var $b = $('#wishlistCount');
    if (!$b.length) return;
    if (!count || count === 0) { $b.hide().text('0'); }
    else { $b.show().text(count); }
  }

  // enhance add button UX: disable while saving and show transient saved state
  $(document).on('click', '.add-wishlist', function(e){
    e.preventDefault();
    var $btn = $(this);
    var pid = $btn.data('product-id');
    if ($btn.data('saving')) return;
    $btn.data('saving', true);
    var prevHtml = $btn.html();
    $btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>saving');
    $.post('/website-popmart-sessions/db/wishlist_add.php', { product_id: pid }, function(res){
      if (typeof res === 'string') { try { res = JSON.parse(res); } catch(e){ res = {success:false}; } }
      if (res.success) {
        fetchList(); showToast('saved to wishlist', true);
        $btn.html('saved');
        setTimeout(function(){ $btn.html(prevHtml); $btn.prop('disabled', false); $btn.data('saving', false); }, 1200);
      } else {
        showToast(res.message || 'failed to save', false);
        $btn.html(prevHtml); $btn.prop('disabled', false); $btn.data('saving', false);
      }
    }).fail(function(){ showToast('network error', false); $btn.html(prevHtml); $btn.prop('disabled', false); $btn.data('saving', false); });
  });
});
