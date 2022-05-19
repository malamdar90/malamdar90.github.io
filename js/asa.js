$.fn.dataTable.ext.search.push(
    function( settings, data, dataIndex ) {
        var min = parseFloat( $('#min').val(), 10 );
        var max = parseFloat( $('#max').val(), 10 );
        var age = parseFloat( data[2] ) || 0; // use data for the age column
        var min2 = parseFloat( $('#min1').val());
        var max2 = parseFloat( $('#max1').val());
        var age2 = parseFloat( data[3] ) || 0; // use data for the age column
        if (isNaN(min) && isNaN(max) && isNaN(min2) && isNaN(max2))
            return true;
        if(min > age || max<age || min2 > age2 || max2<age2)
            return false;
        return true;
    }
);

$(document).ready(function() {
  $("#min1").val("");
  $("#max1").val("");
  $("#min").val("");
  $("#max").val("");

    $('table.table').DataTable( {
        "initComplete": function () {
            var api = this.api();
            api.$('td').click( function () {
                if(this.cellIndex==1){
                    api.search( this.innerHTML ).draw();
                }
            } );
        },
        scrollY:        400,
        scrollCollapse: true,
        paging:         false
    } );
    // DataTable
    var table = $('#example').DataTable();
 

    // Apply the search
    var column =table.column(0);
    var select = $('<select><option value="All">All</option></select>')
        .appendTo( $("#periodfilter"))
        .on( 'change', function () {
            var val = $.fn.dataTable.util.escapeRegex(
                $(this).val()
            );
            if(val=="All") val="";
            column
                .search( val ? '^'+val+'$' : '', true, false )
                .draw();
        } );

    column.data().unique().sort().each( function ( d, j ) {
        select.append( '<option value="'+d+'">'+d+'</option>' )
    } );

    // Event listener to the two range filtering inputs to redraw on input
    $('#min').keyup( function() {
        table.draw();
    } );
   $('#max').keyup( function() {
        table.draw();
    } );
   $('#min1').keyup( function() {
        table.draw();
    } );
     $('#max1').keyup( function() {
        table.draw();
    } );
} );

