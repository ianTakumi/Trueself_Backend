const Contact = require("../models/contact.model");

// Get all contact
exports.getAllContact = async (req, res) => {
  try {
    const contacts = await Contact.find();
    res
      .status(200)
      .json({ message: "All contacts", success: true, data: contacts });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error, success: false });
  }
};

// Get status distribution
exports.getStatusDistribution = async (req, res) => {
  try {
    const statusCounts = await Contact.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json(statusCounts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

// Get monthly engagements
exports.getMonthlyEngagements = async (req, res) => {
  try {
    const engagements = await Contact.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          total: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          total: 1,
        },
      },
    ]);

    res.status(200).json(engagements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single contact
exports.getSingleContact = async (req, res) => {
  try {
    const { contactId } = req.params;
    const contact = await Contact.findById(contactId);
    if (!contact) {
      return res
        .status(404)
        .json({ message: "Contact not found", success: false });
    }

    res
      .status(200)
      .json({ message: "Contact found", success: true, data: contact });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error, success: false });
  }
};

// Create a new contact
exports.createContact = async (req, res) => {
  try {
    const { name, email, phoneNumber, subject, message } = req.body;
    const contact = new Contact({
      name,
      email,
      phone: phoneNumber,
      subject,
      message,
    });

    await contact.save();
    res
      .status(201)
      .json({ message: "Contact created", success: true, data: contact });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error, success: false });
  }
};

// Update a contact
exports.updateContact = async (req, res) => {
  try {
    const { contactId } = req.params;
    const { status } = req.body;
    const contact = await Contact.findById(contactId);

    if (!contact) {
      return res
        .status(404)
        .json({ message: "Contact not found", success: false });
    }

    contact.status = status.value;
    await contact.save();
    res
      .status(200)
      .json({ message: "Contact updated", success: true, data: contact });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error, success: false });
  }
};
