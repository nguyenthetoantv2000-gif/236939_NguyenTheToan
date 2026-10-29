
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// ==================== 1. MIDDLEWARE ====================

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
  ]
}));
app.use(express.json());

// ==================== 2. FOOD SCHEMA ====================

const foodSchema = new mongoose.Schema(
  {
    foodId: {
      type: String,
      required: [true, "Ma mon an la bat buoc"],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Ten mon an la bat buoc"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Danh muc la bat buoc"],
      trim: true,
    },
    cuisine: {
      type: String,
      required: [true, "Am thuc la bat buoc"],
      trim: true,
    },
    ingredients: {
      type: [String],
      required: true,
      validate: {
        validator: (items) =>
          Array.isArray(items) && items.length > 0,
        message: "Nguyen lieu phai co it nhat mot phan tu",
      },
    },
    price: {
      type: Number,
      required: [true, "Gia mon an la bat buoc"],
      min: [0, "Gia khong duoc am"],
    },
    quantity: {
      type: Number,
      required: [true, "So luong la bat buoc"],
      min: [0, "So luong khong duoc am"],
      validate: {
        validator: Number.isInteger,
        message: "So luong phai la so nguyen",
      },
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    imageUrl: {
      type: String,
      default: "",
      trim: true,
      validate: {
        validator: (value) =>
          value === "" || /^https?:\/\/.+/i.test(value),
        message: "imageUrl phai la URL HTTP/HTTPS hop le",
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Food = mongoose.model("Food", foodSchema);

// ==================== 3. VALIDATE INPUT ====================

const allowedFields = [
  "foodId",
  "name",
  "category",
  "cuisine",
  "ingredients",
  "price",
  "quantity",
  "description",
  "imageUrl",
];

function validateFood(body, isUpdate = false) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return "Du lieu gui len phai la object JSON";
  }

  const keys = Object.keys(body);

  if (keys.length === 0) {
    return "Du lieu khong duoc de trong";
  }

  const unknownFields = keys.filter(
    (key) => !allowedFields.includes(key)
  );

  if (unknownFields.length > 0) {
    return `Truong khong hop le: ${unknownFields.join(", ")}`;
  }

  const requiredFields = [
    "foodId",
    "name",
    "category",
    "cuisine",
    "ingredients",
    "price",
    "quantity",
  ];

  if (!isUpdate) {
    const missingFields = requiredFields.filter(
      (key) =>
        body[key] === undefined ||
        body[key] === null ||
        body[key] === ""
    );

    if (missingFields.length > 0) {
      return `Thieu truong bat buoc: ${missingFields.join(", ")}`;
    }
  }

  for (const field of [
    "foodId",
    "name",
    "category",
    "cuisine",
  ]) {
    if (
      body[field] !== undefined &&
      (typeof body[field] !== "string" ||
        body[field].trim() === "")
    ) {
      return `${field} phai la chuoi khong rong`;
    }
  }

  if (body.ingredients !== undefined) {
    if (
      !Array.isArray(body.ingredients) ||
      body.ingredients.length === 0 ||
      body.ingredients.some(
        (item) => typeof item !== "string" || !item.trim()
      )
    ) {
      return "ingredients phai la mang chuoi khong rong";
    }
  }

  if (
    body.price !== undefined &&
    (typeof body.price !== "number" ||
      !Number.isFinite(body.price) ||
      body.price < 0)
  ) {
    return "price phai la so khong am";
  }

  if (
    body.quantity !== undefined &&
    (!Number.isInteger(body.quantity) || body.quantity < 0)
  ) {
    return "quantity phai la so nguyen khong am";
  }

  for (const field of ["description", "imageUrl"]) {
    if (
      body[field] !== undefined &&
      typeof body[field] !== "string"
    ) {
      return `${field} phai la chuoi`;
    }
  }

  if (
    body.imageUrl &&
    !/^https?:\/\/.+/i.test(body.imageUrl)
  ) {
    return "imageUrl phai bat dau bang http:// hoac https://";
  }

  return null;
}

// ==================== 4. HELPER FUNCTIONS ====================

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isValidObjectId(id) {
  return mongoose.isValidObjectId(id);
}

// ==================== 5. HEALTH CHECK ====================

app.get("/health", (req, res) => {
  const connected = mongoose.connection.readyState === 1;

  res.status(connected ? 200 : 503).json({
    success: connected,
    message: connected
      ? "Backend va MongoDB dang hoat dong"
      : "MongoDB chua ket noi",
  });
});

// ==================== 6. GET ALL / SEARCH FOODS ====================

app.get("/api/foods", async (req, res, next) => {
  try {
    const search = req.query.search?.trim();
    let filter = {};

    if (search) {
      const keyword = new RegExp(escapeRegex(search), "i");

      filter = {
        $or: [
          { name: keyword },
          { category: keyword },
          { cuisine: keyword },
        ],
      };
    }

    const foods = await Food.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: foods.length,
      data: foods,
    });
  } catch (error) {
    next(error);
  }
});

// ==================== 7. GET FOOD BY ID ====================

app.get("/api/foods/:id", async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "ID mon an khong hop le",
      });
    }

    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Khong tim thay mon an",
      });
    }

    res.status(200).json({
      success: true,
      data: food,
    });
  } catch (error) {
    next(error);
  }
});

// ==================== 8. CREATE FOOD ====================

app.post("/api/foods", async (req, res, next) => {
  try {
    const validationError = validateFood(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const food = await Food.create(req.body);

    res.status(201).json({
      success: true,
      message: "Them mon an thanh cong",
      data: food,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "foodId da ton tai",
      });
    }

    next(error);
  }
});

// ==================== 9. UPDATE FOOD ====================

app.put("/api/foods/:id", async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "ID mon an khong hop le",
      });
    }

    const validationError = validateFood(req.body, true);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const food = await Food.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Khong tim thay mon an",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cap nhat mon an thanh cong",
      data: food,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "foodId da ton tai",
      });
    }

    next(error);
  }
});

// ==================== 10. DELETE FOOD ====================

app.delete("/api/foods/:id", async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "ID mon an khong hop le",
      });
    }

    const food = await Food.findByIdAndDelete(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Khong tim thay mon an",
      });
    }

    res.status(200).json({
      success: true,
      message: "Xoa mon an thanh cong",
      data: food,
    });
  } catch (error) {
    next(error);
  }
});

// ==================== 11. NOT FOUND ====================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Khong tim thay API: ${req.method} ${req.originalUrl}`,
  });
});

// ==================== 12. ERROR HANDLER ====================

app.use((error, req, res, next) => {
  console.error("API error:", error.message);

  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({
      success: false,
      message: "JSON khong hop le",
    });
  }

  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  res.status(500).json({
    success: false,
    message: "Loi may chu",
  });
});

// ==================== 13. START SERVER ====================

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error(
        "Thieu MONGODB_URI. Kiem tra file backend/.env"
      );
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Da ket noi MongoDB Atlas");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server dang chay tai port ${PORT}`);
    });
  } catch (error) {
    console.error("Loi khoi dong server:", error.message);
    process.exit(1);
  }
}

startServer();
