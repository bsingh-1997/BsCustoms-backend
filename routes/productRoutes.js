const express = require("express");
const Product = require("../models/Products");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();
const upload = require("../middlewares/uploadMiddleware");

// 



router.get("/", async (req, res) => {
  try {
    const { search, category, min, max, sort, page = 1, limit = 10 } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      query.category = category;
    }

    if (min || max) {
      query.price = {};
      if (min) query.price.$gte = Number(min);
      if (max) query.price.$lte = Number(max);
    }

    const sortOption = {};
    if (sort === "price_asc") sortOption.price = 1;
    else if (sort === "price_desc") sortOption.price = -1;
    else if (sort === "latest") sortOption.createdAt = -1;

    const products = await Product.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    res.json({
      products,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});


// **GET A SINGLE PRODUCT BY ID**
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// // **UPDATE PRODUCT (Only Admin)**
// router.put("/:id", authMiddleware, async (req, res) => {
//   try {
//     const { name, description, price, category, image } = req.body;
//     const updatedProduct = await Product.findByIdAndUpdate(
//       req.params.id,
//       { name, description, price, category, image },
//       { new: true }
//     );
//     if (!updatedProduct) return res.status(404).json({ msg: "Product not found" });
//     res.json({ msg: "Product updated successfully!", product: updatedProduct });
//   } catch (err) {
//     res.status(500).json({ msg: "Server error", error: err.message });
//   }
// });



// **UPDATE PRODUCT (Only Admin)**
router.put("/:id", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;

    // Optional image
    const imageUrl = req.file?.path;

    // Build update object dynamically
    const updateFields = {
      name,
      description,
      price,
      category,
      stock
    };

    if (imageUrl) {
      updateFields.image = imageUrl;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    );

    if (!updatedProduct) return res.status(404).json({ msg: "Product not found" });

    res.json({ msg: "Product updated successfully!", product: updatedProduct });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});


// **DELETE PRODUCT (Only Admin)**
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ msg: "Product not found" });
    res.json({ msg: "Product deleted successfully!" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});


router.post("/add", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const { name, description, price, category ,stock } = req.body;

    // Image path from Cloudinary via multer
    const imageUrl = req.file?.path;

    const newProduct = new Product({
      name,
      description,
      price,
      category,
      image: imageUrl,
      stock
    });

    await newProduct.save();
    res.status(201).json({ msg: "Product added successfully!", product: newProduct });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
    
    console.log("Request body:", req.body);

    
  }
});



module.exports = router;
