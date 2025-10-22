// API Base URL - Update this if your backend is on different port
const API_BASE_URL = "http://localhost:5000/api";

// DOM Elements
const userSection = document.getElementById("user-section");
const adminSection = document.getElementById("admin-section");
const submissionForm = document.getElementById("submissionForm");
const checkStatusBtn = document.getElementById("checkStatusBtn");
const refreshFormsBtn = document.getElementById("refreshFormsBtn");
const formsList = document.getElementById("formsList");
const alertContainer = document.getElementById("alertContainer");

// Check if all DOM elements are found
console.log("DOM Elements loaded:", {
  userSection: !!userSection,
  adminSection: !!adminSection,
  submissionForm: !!submissionForm,
  checkStatusBtn: !!checkStatusBtn,
  formsList: !!formsList,
});

// Tab Switching
document.querySelectorAll(".user-tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => switchTab("user"));
});

document.querySelectorAll(".admin-tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => switchTab("admin"));
});

function switchTab(tab) {
  console.log("Switching to tab:", tab);
  if (tab === "user") {
    userSection.classList.remove("d-none");
    adminSection.classList.add("d-none");
    document
      .querySelectorAll(".user-tab-btn")
      .forEach((btn) => btn.classList.add("active"));
    document
      .querySelectorAll(".admin-tab-btn")
      .forEach((btn) => btn.classList.remove("active"));
  } else {
    userSection.classList.add("d-none");
    adminSection.classList.remove("d-none");
    document
      .querySelectorAll(".admin-tab-btn")
      .forEach((btn) => btn.classList.add("active"));
    document
      .querySelectorAll(".user-tab-btn")
      .forEach((btn) => btn.classList.remove("active"));
    loadAllForms(); // Load forms when admin tab is opened
  }
}

// Show Alert Message
function showAlert(message, type = "info") {
  const alertDiv = document.createElement("div");
  alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
  alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
  alertContainer.appendChild(alertDiv);

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (alertDiv.parentElement) {
      alertDiv.remove();
    }
  }, 5000);
}

// Form Submission
if (submissionForm) {
  submissionForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("Form submission started");

    const submitBtn = submissionForm.querySelector('button[type="submit"]');
    const submitText = document.getElementById("submitBtnText");
    const submitSpinner = document.getElementById("submitSpinner");

    // Get form data
    const formData = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      phone: document.getElementById("phone").value,
      purpose: document.getElementById("purpose").value,
      description: document.getElementById("description").value,
    };

    console.log("Submitting form data:", formData);

    // Show loading state
    submitText.textContent = "Submitting...";
    if (submitSpinner) submitSpinner.classList.remove("d-none");
    submitBtn.disabled = true;

    try {
      const response = await fetch(`${API_BASE_URL}/forms/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      console.log("Form submission response:", result);

      if (result.success) {
        showAlert(
          "✅ Form submitted successfully! Your request is under review.",
          "success"
        );
        submissionForm.reset();
      } else {
        showAlert(`❌ Error: ${result.message}`, "danger");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      showAlert(
        "❌ Network error. Please check if backend server is running.",
        "danger"
      );
    } finally {
      // Reset button state
      submitText.textContent = "Submit Form";
      if (submitSpinner) submitSpinner.classList.add("d-none");
      submitBtn.disabled = false;
    }
  });
}

// Check Form Status
if (checkStatusBtn) {
  checkStatusBtn.addEventListener("click", async () => {
    const email = document.getElementById("checkEmail").value.trim();

    if (!email) {
      showAlert(
        "⚠️ Please enter your email address to check status.",
        "warning"
      );
      return;
    }

    const statusResults = document.getElementById("statusResults");
    checkStatusBtn.disabled = true;
    checkStatusBtn.textContent = "Checking...";

    try {
      console.log("Checking status for email:", email);
      const response = await fetch(
        `${API_BASE_URL}/forms/status/${encodeURIComponent(email)}`
      );
      const result = await response.json();
      console.log("Status check response:", result);

      if (result.success) {
        displayStatusResults(result.data, statusResults);
      } else {
        showAlert(`❌ Error: ${result.message}`, "danger");
        statusResults.innerHTML = "";
      }
    } catch (error) {
      console.error("Error checking status:", error);
      showAlert("❌ Network error. Please try again.", "danger");
      statusResults.innerHTML = "";
    } finally {
      checkStatusBtn.disabled = false;
      checkStatusBtn.textContent = "Check Status";
    }
  });
}

// Display Status Results
function displayStatusResults(forms, container) {
  if (forms.length === 0) {
    container.innerHTML = `
            <div class="alert alert-info">
                No forms found for this email address.
            </div>
        `;
    return;
  }

  // Sort by submission date (newest first)
  forms.sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate));

  container.innerHTML = `
        <h6>Your Form Submissions (${forms.length}):</h6>
        ${forms
          .map(
            (form) => `
            <div class="card mb-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <h6 class="card-title">${form.purpose}</h6>
                        <span class="badge ${getStatusBadgeClass(form.status)}">
                            ${form.status.toUpperCase()}
                        </span>
                    </div>
                    <p class="card-text"><strong>Description:</strong> ${
                      form.description
                    }</p>
                    <p class="card-text"><small class="text-muted">
                        Submitted: ${new Date(
                          form.submissionDate
                        ).toLocaleString()}
                    </small></p>
                    ${
                      form.adminComments
                        ? `
                        <div class="alert alert-info mt-2">
                            <strong>Admin Response:</strong> ${form.adminComments}
                        </div>
                    `
                        : form.status === "pending"
                        ? `
                        <div class="alert alert-warning mt-2">
                            ⏳ Your request is under review. Please check back later.
                        </div>
                    `
                        : ""
                    }
                </div>
            </div>
        `
          )
          .join("")}
    `;
}

// Get Status Badge Class
function getStatusBadgeClass(status) {
  switch (status) {
    case "approved":
      return "bg-success";
    case "rejected":
      return "bg-danger";
    default:
      return "bg-warning";
  }
}

// Load All Forms for Admin
async function loadAllForms() {
  if (!formsList) return;

  formsList.innerHTML = `
        <div class="text-center">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p>Loading forms...</p>
        </div>
    `;

  try {
    console.log("Loading all forms...");
    const response = await fetch(`${API_BASE_URL}/forms/all`);
    const result = await response.json();
    console.log("Forms loaded:", result);

    if (result.success) {
      displayAllForms(result.data);
    } else {
      formsList.innerHTML = `<div class="alert alert-danger">Error loading forms: ${result.message}</div>`;
    }
  } catch (error) {
    console.error("Error loading forms:", error);
    formsList.innerHTML = `
            <div class="alert alert-danger">
                Network error. Please check if backend server is running on port 5000.
            </div>
        `;
  }
}

// Display All Forms in Admin Panel
function displayAllForms(forms) {
  if (!formsList) return;

  if (forms.length === 0) {
    formsList.innerHTML = `
            <div class="alert alert-info">
                No forms submitted yet.
            </div>
        `;
    return;
  }

  // Count statistics
  const pendingCount = forms.filter((f) => f.status === "pending").length;
  const approvedCount = forms.filter((f) => f.status === "approved").length;
  const rejectedCount = forms.filter((f) => f.status === "rejected").length;

  formsList.innerHTML = `
        <div class="row mb-3">
            <div class="col-md-4">
                <div class="card text-white bg-warning">
                    <div class="card-body text-center">
                        <h4>${pendingCount}</h4>
                        <p class="mb-0">Pending</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card text-white bg-success">
                    <div class="card-body text-center">
                        <h4>${approvedCount}</h4>
                        <p class="mb-0">Approved</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card text-white bg-danger">
                    <div class="card-body text-center">
                        <h4>${rejectedCount}</h4>
                        <p class="mb-0">Rejected</p>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead class="table-dark">
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Purpose</th>
                        <th>Description</th>
                        <th>Submitted</th>
                        <th>Status</th>
                        <th>Admin Comments</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${forms
                      .map(
                        (form) => `
                        <tr>
                            <td>${form.name}</td>
                            <td>${form.email}</td>
                            <td>${form.purpose}</td>
                            <td>${form.description}</td>
                            <td>${new Date(
                              form.submissionDate
                            ).toLocaleString()}</td>
                            <td>
                                <span class="badge ${getStatusBadgeClass(
                                  form.status
                                )}">
                                    ${form.status.toUpperCase()}
                                </span>
                            </td>
                            <td>${form.adminComments || "No comments"}</td>
                            <td>
                                ${
                                  form.status === "pending"
                                    ? `
                                    <div class="btn-group btn-group-sm">
                                        <button class="btn btn-success" onclick="updateFormStatus('${form._id}', 'approved')">
                                            ✅ Approve
                                        </button>
                                        <button class="btn btn-danger" onclick="updateFormStatus('${form._id}', 'rejected')">
                                            ❌ Reject
                                        </button>
                                    </div>
                                `
                                    : `
                                    <span class="text-muted">Completed</span>
                                `
                                }
                            </td>
                        </tr>
                    `
                      )
                      .join("")}
                </tbody>
            </table>
        </div>
    `;
}

// Update Form Status (Approve/Reject)
async function updateFormStatus(formId, status) {
  console.log("Updating form:", formId, "to:", status);

  if (!confirm(`Are you sure you want to ${status} this form?`)) {
    return;
  }

  // Admin comments ke liye prompt
  const adminComments =
    prompt(`Please enter comments for ${status} action:`) || "";

  try {
    const response = await fetch(`${API_BASE_URL}/forms/${formId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: status,
        adminComments: adminComments,
      }),
    });

    const result = await response.json();
    console.log("Update form response:", result);

    if (result.success) {
      showAlert(`✅ Form ${status} successfully!`, "success");
      // Reload the forms list
      loadAllForms();
    } else {
      showAlert(`❌ Error: ${result.message}`, "danger");
    }
  } catch (error) {
    console.error("Error updating form:", error);
    showAlert("❌ Network error. Please try again.", "danger");
  }
}

// Refresh Forms List
if (refreshFormsBtn) {
  refreshFormsBtn.addEventListener("click", loadAllForms);
}

// Initialize - Load forms if on admin tab
document.addEventListener("DOMContentLoaded", () => {
  console.log("Form Approval System Frontend Loaded Successfully!");
});
