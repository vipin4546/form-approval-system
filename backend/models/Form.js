const mongoose = require("mongoose");

const formSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  purpose: { type: String, required: true },
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  submissionDate: { type: Date, default: Date.now },
  adminComments: { type: String, default: "" },
});

module.exports = mongoose.model("Form", formSchema);
