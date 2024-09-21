$(document).ready(function () {
  let actionLock = false;
  const jobNumber = parseInt($("#job_number").val());

  const layout = {
    topStart: {},
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
    layout.topStart.pageLength = {
      menu: menu,
    };
    layout.bottomEnd.paging = true;
  }

  layout.topStart.buttons = [
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
          text: '<span class="tf-icons bx bx-copy bx-18px me-2"></span>Copy current page',
          exportOptions: {
            modifier: {
              page: "current",
            },
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
          },
        },
      ],
    },
    {
      extend: "collection",
      text: '<span class="tf-icons bx bx-play bx-18px me-2"></span>Actions',
      className: "btn btn-sm btn-outline-primary",
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

  $.fn.dataTable.ext.buttons.run_jobs = {
    text: '<span class="tf-icons bx bx-play bx-18px me-2"></span>Run selected jobs',
    action: function (e, dt, node, config) {
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
        targets: "_all", // Target all columns
        createdCell: function (td, cellData, rowData, row, col) {
          $(td).addClass("align-items-center"); // Apply 'text-center' class to <td>
        },
      },
    ],
    order: [[1, "asc"]],
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
      $("#jobs_wrapper th").addClass("text-center");
    },
  });

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

  $(".show-history").on("click", function () {
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

  $(".run-job").on("click", function () {
    const job = {
      name: $(this).data("job"),
      plugin: $(this).data("plugin"),
    };
    executeForm([job]);
  });
});
