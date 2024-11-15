$(document).ready(function () {
  let actionLock = false;
  const jobNumber = parseInt($("#job_number").val());
  const isReadOnly = $("#is-read-only").val().trim() === "True";

  const layout = {
    top1: {
      searchPanes: {
        viewTotal: true,
        cascadePanes: true,
        collapse: false,
        columns: [2, 3, 4, 5, 6],
      },
    },
    topStart: {},
    topEnd: {
      buttons: [
        {
          extend: "toggle_filters",
          className: "btn btn-sm btn-outline-primary toggle-filters",
        },
      ],
      search: true,
    },
    bottomStart: {
      info: true,
    },
    bottomEnd: {},
  };

  if (jobNumber > 10) {
    const menu = [10];
    if (jobNumber > 25) {
      menu.push(25);
    }
    if (jobNumber > 50) {
      menu.push(50);
    }
    if (jobNumber > 100) {
      menu.push(100);
    }
    menu.push({ label: "All", value: -1 });
    layout.bottomStart = {
      pageLength: {
        menu: menu,
      },
      info: true,
    };
    layout.bottomEnd.paging = true;
  }

  layout.topStart.buttons = [
    {
      extend: "toggle_filters",
      className: "btn btn-sm btn-outline-primary toggle-filters",
    },
    {
      extend: "colvis",
      columns: "th:not(:first-child)",
      text: '<span class="tf-icons bx bx-columns bx-18px me-2"></span>Columns',
      className: "btn btn-sm btn-outline-primary",
      columnText: function (dt, idx, title) {
        return idx + 1 + ". " + title;
      },
    },
    {
      extend: "colvisRestore",
      text: '<span class="tf-icons bx bx-reset bx-18px me-2"></span>Reset<span class="d-none d-md-inline"> columns</span>',
      className: "btn btn-sm btn-outline-primary",
    },
    {
      extend: "collection",
      text: '<span class="tf-icons bx bx-export bx-18px me-2"></span>Export',
      className: "btn btn-sm btn-outline-primary",
      buttons: [
        {
          extend: "copy",
          text: '<span class="tf-icons bx bx-copy bx-18px me-2"></span>Copy visible',
          exportOptions: {
            columns: ":visible:not(:first-child):not(:last-child)",
          },
        },
        {
          extend: "csv",
          text: '<span class="tf-icons bx bx-table bx-18px me-2"></span>CSV',
          bom: true,
          filename: "bw_jobs",
          exportOptions: {
            modifier: {
              search: "none",
            },
            columns: ":not(:first-child):not(:last-child)",
          },
        },
        {
          extend: "excel",
          text: '<span class="tf-icons bx bx-table bx-18px me-2"></span>Excel',
          filename: "bw_jobs",
          exportOptions: {
            modifier: {
              search: "none",
            },
            columns: ":not(:first-child):not(:last-child)",
          },
        },
      ],
    },
    {
      extend: "collection",
      text: '<span class="tf-icons bx bx-play bx-18px me-2"></span>Actions',
      className: "btn btn-sm btn-outline-primary action-button disabled",
      buttons: [
        {
          extend: "run_jobs",
        },
      ],
    },
  ];

  const getSelectedJobs = () => {
    const jobs = [];
    $("tr.selected").each(function () {
      const $this = $(this);
      const name = $this.find("td:eq(1)").text().trim();
      const plugin = $this.find("td:eq(2)").text().trim();
      jobs.push({ name: name, plugin: plugin });
    });
    return jobs;
  };

  const executeForm = (jobs) => {
    const form = $("<form>", {
      method: "POST",
      action: `${window.location.pathname}/run`,
      class: "visually-hidden",
    });

    // Add CSRF token and jobs as hidden inputs
    form.append(
      $("<input>", {
        type: "hidden",
        name: "csrf_token",
        value: $("#csrf_token").val(),
      }),
    );
    form.append(
      $("<input>", {
        type: "hidden",
        name: "jobs",
        value: JSON.stringify(jobs),
      }),
    );

    // Append the form to the body and submit it
    form.appendTo("body").submit();
  };

  $.fn.dataTable.ext.buttons.toggle_filters = {
    text: '<span class="tf-icons bx bx-filter bx-18px me-2"></span><span id="show-filters">Show</span><span id="hide-filters" class="d-none">Hide</span><span class="d-none d-md-inline"> filters</span>',
    action: function (e, dt, node, config) {
      jobs_table.searchPanes.container().slideToggle(); // Smoothly hide or show the container
      $("#show-filters").toggleClass("d-none"); // Toggle the visibility of the 'Show' span
      $("#hide-filters").toggleClass("d-none"); // Toggle the visibility of the 'Hide' span
    },
  };

  $.fn.dataTable.ext.buttons.run_jobs = {
    text: '<span class="tf-icons bx bx-play bx-18px me-2"></span>Run selected jobs',
    action: function (e, dt, node, config) {
      if (isReadOnly) {
        alert("This action is not allowed in read-only mode.");
        return;
      }
      if (actionLock) {
        return;
      }
      actionLock = true;
      $(".dt-button-background").click();

      const jobs = getSelectedJobs();
      if (jobs.length === 0) {
        actionLock = false;
        return;
      }

      executeForm(jobs);

      actionLock = false;
    },
  };

  $(".history-start-date, .history-end-date").each(function () {
    const isoDateStr = $(this).text().trim();

    // Parse the ISO format date string
    const date = new Date(isoDateStr);

    // Check if the date is valid
    if (!isNaN(date)) {
      // Convert to local date and time string
      const localDateStr = date.toLocaleString();

      // Update the text content with the local date string
      $(this).text(localDateStr);
    } else {
      // Handle invalid date
      console.error(`Invalid date string: ${isoDateStr}`);
      $(this).text("Invalid date");
    }
  });

  const jobs_table = new DataTable("#jobs", {
    columnDefs: [
      {
        orderable: false,
        render: DataTable.render.select(),
        targets: 0,
      },
      {
        orderable: false,
        targets: -1,
      },
      {
        searchPanes: {
          show: true,
          combiner: "or",
        },
        targets: [2],
      },
      {
        searchPanes: {
          show: true,
          header: "Interval",
          options: [
            {
              label: "Every day",
              value: function (rowData, rowIdx) {
                return rowData[3].includes("day");
              },
            },
            {
              label: "Every hour",
              value: function (rowData, rowIdx) {
                return rowData[3].includes("hour");
              },
            },
            {
              label: "Every week",
              value: function (rowData, rowIdx) {
                return rowData[3].includes("week");
              },
            },
            {
              label: "Once",
              value: function (rowData, rowIdx) {
                return rowData[3].includes("once");
              },
            },
          ],
          combiner: "or",
          orderable: false,
        },
        targets: 3,
      },
      {
        searchPanes: {
          show: true,
          header: "Reload",
          options: [
            {
              label: '<i class="bx bx-xs bx-x text-danger"></i>&nbsp;No',
              value: function (rowData, rowIdx) {
                return rowData[4].includes("bx-x");
              },
            },
            {
              label: '<i class="bx bx-xs bx-check text-success"></i>&nbsp;Yes',
              value: function (rowData, rowIdx) {
                return rowData[4].includes("bx-check");
              },
            },
          ],
          combiner: "or",
          orderable: false,
        },
        targets: 4,
      },
      {
        searchPanes: {
          show: true,
          header: "Async",
          options: [
            {
              label: '<i class="bx bx-xs bx-x text-danger"></i>&nbsp;No',
              value: function (rowData, rowIdx) {
                return rowData[5].includes("bx-x");
              },
            },
            {
              label: '<i class="bx bx-xs bx-check text-success"></i>&nbsp;Yes',
              value: function (rowData, rowIdx) {
                return rowData[5].includes("bx-check");
              },
            },
          ],
          combiner: "or",
          orderable: false,
        },
        targets: 5,
      },
      {
        searchPanes: {
          show: true,
          header: "Last run state",
          options: [
            {
              label: '<i class="bx bx-xs bx-x text-danger"></i>&nbsp;Failed',
              value: function (rowData, rowIdx) {
                return rowData[6].includes("bx-x");
              },
            },
            {
              label:
                '<i class="bx bx-xs bx-check text-success"></i>&nbsp;Success',
              value: function (rowData, rowIdx) {
                return rowData[6].includes("bx-check");
              },
            },
          ],
          combiner: "or",
          orderable: false,
        },
        targets: 6,
      },
    ],
    order: [[2, "asc"]],
    autoFill: false,
    responsive: true,
    select: {
      style: "multi+shift",
      selector: "td:first-child",
      headerCheckbox: false,
    },
    layout: layout,
    language: {
      info: "Showing _START_ to _END_ of _TOTAL_ jobs",
      infoEmpty: "No jobs available",
      infoFiltered: "(filtered from _MAX_ total jobs)",
      lengthMenu: "Display _MENU_ jobs",
      zeroRecords: "No matching jobs found",
      select: {
        rows: {
          _: "Selected %d jobs",
          0: "No jobs selected",
          1: "Selected 1 job",
        },
      },
    },
    initComplete: function (settings, json) {
      $("#jobs_wrapper .btn-secondary").removeClass("btn-secondary");
    },
  });

  jobs_table.searchPanes.container().hide();

  $(".action-button")
    .parent()
    .attr(
      "data-bs-original-title",
      "Please select one or more rows to perform an action.",
    )
    .attr("data-bs-placement", "top")
    .tooltip();

  $("#jobs").removeClass("d-none");
  $("#jobs-waiting").addClass("visually-hidden");

  jobs_table.on("mouseenter", "td", function () {
    if (jobs_table.cell(this).index() === undefined) return;
    const rowIdx = jobs_table.cell(this).index().row;

    jobs_table
      .cells()
      .nodes()
      .each((el) => el.classList.remove("highlight"));

    jobs_table
      .cells()
      .nodes()
      .each(function (el) {
        if (jobs_table.cell(el).index().row === rowIdx)
          el.classList.add("highlight");
      });
  });

  jobs_table.on("mouseleave", "td", function () {
    jobs_table
      .cells()
      .nodes()
      .each((el) => el.classList.remove("highlight"));
  });

  jobs_table.on("select", function (e, dt, type, indexes) {
    // Enable the actions button
    $(".action-button")
      .removeClass("disabled")
      .parent()
      .attr("data-bs-toggle", null)
      .attr("data-bs-original-title", null)
      .attr("data-bs-placement", null)
      .tooltip("dispose");
  });

  jobs_table.on("deselect", function (e, dt, type, indexes) {
    // If no rows are selected, disable the actions button
    if (jobs_table.rows({ selected: true }).count() === 0) {
      $(".action-button")
        .addClass("disabled")
        .parent()
        .attr("data-bs-toggle", "tooltip")
        .attr(
          "data-bs-original-title",
          "Please select one or more rows to perform an action.",
        )
        .attr("data-bs-placement", "top")
        .tooltip();
      $("#select-all-rows").prop("checked", false);
    }
  });

  // Event listener for the select-all checkbox
  $("#select-all-rows").on("change", function () {
    const isChecked = $(this).prop("checked");

    if (isChecked) {
      // Select all rows on the current page
      jobs_table.rows({ page: "current" }).select();
    } else {
      // Deselect all rows on the current page
      jobs_table.rows({ page: "current" }).deselect();
    }
  });

  $(document).on("click", ".show-history", function () {
    const historyModal = $("#modal-job-history");
    const job = $(this).data("job");
    const plugin = $(this).data("plugin");

    const history = $(`#job-${job}-${plugin}-history`).clone();
    const historyCount = history.find("ul").length - 1;
    historyModal
      .find(".modal-title")
      .html(
        `Last${historyCount > 1 ? " " + historyCount : ""} execution${
          historyCount > 1 ? "s" : ""
        } of Job <span class="fw-bold fst-italic">${job}</span> from plugin <span class="fw-bold fst-italic">${plugin}</span>`,
      );
    history.removeClass("visually-hidden");
    historyModal.find(".modal-body").html(history);

    const modal = new bootstrap.Modal(historyModal);
    modal.show();
  });

  $(document).on("click", ".run-job", function () {
    if (isReadOnly) {
      alert("This action is not allowed in read-only mode.");
      return;
    }
    const job = {
      name: $(this).data("job"),
      plugin: $(this).data("plugin"),
    };
    executeForm([job]);
  });
});