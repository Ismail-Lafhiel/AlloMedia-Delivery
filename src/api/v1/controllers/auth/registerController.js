const User = require("../../models/User");
const { hashPassword, generateToken } = require("../../helpers/authHelper");

const registerUser = async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    const newUser = await User.create({
      first_name,
      last_name,
      email,
      password: hashedPassword,
    });

    // Generate a JWT token
    const token = generateToken(newUser);

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser.id,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

module.exports = {
  registerUser,
};
