const express = require("express");
const router = express.Router();
const Form = require("../models/Form");

// Submit a new form
router.post("/submit", async (req, res) => {
  try {
    const { name, email, phone, purpose, description } = req.body;

    const newForm = new Form({
      name,
      email,
      phone,
      purpose,
      description,
    });

    const savedForm = await newForm.save();

    res.status(201).json({
      success: true,
      message: "Form submitted successfully!",
      data: savedForm,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error submitting form",
      error: error.message,
    });
  }
});

// Get all forms for admin
router.get("/all", async (req, res) => {
  try {
    const forms = await Form.find().sort({ submissionDate: -1 });
    res.json({
      success: true,
      data: forms,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching forms",
      error: error.message,
    });
  }
});

// Check form status by email
router.get("/status/:email", async (req, res) => {
  try {
    const forms = await Form.find({ email: req.params.email }).sort({
      submissionDate: -1,
    });
    res.json({
      success: true,
      data: forms,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching form status",
      error: error.message,
    });
  }
});

// Update form status (Approve/Reject)
router.put("/:id/status", async (req, res) => {
  try {
    const { status, adminComments } = req.body;
    const formId = req.params.id;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const updatedForm = await Form.findByIdAndUpdate(
      formId,
      {
        status: status,
        adminComments: adminComments || "",
      },
      { new: true }
    );

    if (!updatedForm) {
      return res.status(404).json({
        success: false,
        message: "Form not found",
      });
    }

    res.json({
      success: true,
      message: `Form ${status} successfully!`,
      data: updatedForm,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating form status",
      error: error.message,
    });
  }
});

module.exports = router;
