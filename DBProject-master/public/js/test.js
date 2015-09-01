$('#rowSelectAll').on('switch-change', function(){
    $val = $('#rowSelectAll').bootstrapSwitch('status');
    $('.toggle-state-switch').each(function( index ) {
      $(this).bootstrapSwitch('setState' , $val);
});
});