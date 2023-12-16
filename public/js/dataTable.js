
  $(document).ready(function () {
    $('#myTable').DataTable({
        "pagingType": "full_numbers", // Adds pagination with first, last, previous, and next buttons
        "lengthMenu": [10, 25, 50, 75, 100], // Sets the number of records per page dropdown
        "pageLength": 10, // Sets the default number of records per page
        "ordering": true, // Enables sorting
        "info": true, // Shows information about the table
        "searching": true, // Enables searching
        "responsive": true, // Enables responsive design for mobile devices
        "columnDefs": [
            {
                "targets": 'no-sort', // Add the class "no-sort" to th elements you don't want to be sortable
                "orderable": false,
            }
        ],
        "language": {
            "emptyTable": "No data available in table", // Custom message for empty table
            "infoEmpty": "Showing 0 to 0 of 0 entries", // Custom message when there is no data to show
            "zeroRecords": "No matching records found", // Custom message for zero records found
            "search": "Search:", // Custom label for search input
            "paginate": {
                "first": "First", // Custom label for the first page button
                "last": "Last", // Custom label for the last page button
                "next": "Next", // Custom label for the next page button
                "previous": "Previous" // Custom label for the previous page button
            }
        }
    });
});

