const mongoose = require("mongoose");

mongoose.connect(process.env.Mongodb_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

const userSchema = new mongoose.Schema({
  _id: {
    type: String,
  },
  name: {
    type: String,
    maxLength: 64,
    default: null,
  },
  email: {
    type: String,
    unique: true,
    maxLength: 128,
  },
  password: {
    type: String,
  },
  created_at: {
    type: Date
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;