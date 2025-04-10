const { Router } = require("express");
const router = Router();
// const agency = require("../Models/agency");
// const User = require("../Models/user");
// const admin = require("../Models/admin");
const jwt = require("jsonwebtoken");
const { log } = require("console");
const cookieParser = require("cookie-parser");
const Agency = require("../Models/agency");
// async function insertAgencyData() {
//     try {
//         const agencyData = {
//             name: "Mystic Travels",
//             destination: "Marrakech, Morocco",
//             enrolledUsers: [],
//             description: "Immerse yourself in the rich history, vibrant markets, and exotic flavors of Marrakech.",
//           };

//       const agency = new Agency(agencyData);

//       const savedAgency = await agency.save();

//       console.log("Agency data inserted successfully:", savedAgency);
//     } catch (error) {
//       console.error("Error inserting agency data:", error);
//     }
//   }
//   insertAgencyData()

/**
 * @swagger
 * /agency/login:
 *   post:
 *     summary: Log in to the agency system
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

/**
 * @swagger
 * /agency/signup:
 *   post:
 *     summary: Create a new agency
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Agency created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

/**
 * @swagger
 * /agency/getAllAgency:
 *   get:
 *     summary: Get all agencies
 *     responses:
 *       200:
 *         description: Agencies fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Agency'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

/**
 * @swagger
 * /agency/enroll/{agencyId}:
 *   post:
 *     summary: Enroll a user to an agency
 *     parameters:
 *       - in: path
 *         name: agencyId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the agency
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: User enrolled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

/**
 * @swagger
 * /agency/unenroll/{agencyId}:
 *   put:
 *     summary: Unenroll a user from an agency
 *     parameters:
 *       - in: path
 *         name: agencyId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the agency
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: User unenrolled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */


router.post("/login", async (req,res)=>{
  try {
    const {name, password}= req.body;

    if (!name || !password) {
      return res
        .status(400)
        .json({ error: "Please provide username and password" });
    }

    const agency = await Agency.findOne({name});

    if (!agency) {
      return res.status(401).json({ error: "Invalid name or password" });
    }

    // Compare passwords (assuming you're using plain text for now - you should use bcrypt in production)
    if (agency.password !== password) {
      return res.status(401).json({ error: "Invalid name or password" });
    }

    const token = jwt.sign({ agencyId: agency._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "24h",
    });

    // Set cookie with proper options
    res.cookie("agencyId", agency._id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Only send cookie over HTTPS in production
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: "strict"
    });

    // Send success response with token
    res.status(200).json({ 
      message: "Login successful", 
      token,
      agencyId: agency._id 
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.post("/signup", async (req, res) => {
  try {
    const { name, password, email, phone, destination, description, userId } = req.body;

    // Validate required fields
    if (!name || !password || !email || !phone) {
      return res.status(400).json({ error: "Please provide all required fields: name, password, email, and phone" });
    }

    // Check if agency with same name or email already exists
    const existingAgency = await Agency.findOne({
      $or: [{ name }, { email }]
    });

    if (existingAgency) {
      return res.status(400).json({ 
        error: existingAgency.name === name 
          ? "An agency with this name already exists" 
          : "An agency with this email already exists" 
      });
    }

    // Create new agency
    const newAgency = new Agency({
      name,
      password, // Note: In production, you should hash the password
      email,
      phone,
      destination: destination || "",
      description: description || "",
      enrolledUsers: [userId] // Add the creating user as the first enrolled user
    });

    await newAgency.save();

    // Generate agency JWT token
    const agencyToken = jwt.sign(
      { agencyId: newAgency._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "24h" }
    );

    // Set agency cookie
    res.cookie("agencyId", newAgency._id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: "strict"
    });

    res.status(201).json({
      message: "Agency registered successfully",
      agencyToken,
      agencyId: newAgency._id,
      // Don't include user token in response as it's already in localStorage
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/getAllAgency", async (req, res) => {
  try {
    const data = await Agency.find();
    return res.status(200).json({ data });
  } catch (error) {
    console.log("error in get agency ", error);
    return res.status(500).json({ message: "Internel Server error" });
  }
});

router.post("/enroll/:agencyId", async (req, res) => {
  const agencyId = req.params.agencyId;
  console.log(agencyId);
  try {
    await Agency.findByIdAndUpdate(
      agencyId,
      {
        $push: { enrolledUsers: req.body.userId },
      },
      {
        new: true,
      }
    );
    res.status(200).json({ message: "enrolled successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.put("/unenroll/:agencyId", async (req, res) => {
  const agencyId = req.params.agencyId;
  try {
    await Agency.findByIdAndUpdate(
      agencyId,
      {
        $pull: { enrolledUsers: req.body.userId },
      },
      {
        new: true,
      }
    );
    res.status(200).json({ message: "unenrolled successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get agency details
router.get("/:agencyId", async (req, res) => {
  try {
    const agency = await Agency.findById(req.params.agencyId);
    if (!agency) {
      return res.status(404).json({ error: "Agency not found" });
    }
    res.json(agency);
  } catch (error) {
    console.error("Error fetching agency:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get enrolled users for an agency
router.get("/:agencyId/users", async (req, res) => {
  try {
    const agency = await Agency.findById(req.params.agencyId).populate('enrolledUsers');
    if (!agency) {
      return res.status(404).json({ error: "Agency not found" });
    }
    res.json(agency.enrolledUsers);
  } catch (error) {
    console.error("Error fetching enrolled users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
