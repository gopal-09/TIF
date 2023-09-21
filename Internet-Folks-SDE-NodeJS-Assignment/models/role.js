const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://gopalreddy6197:admin@cluster0.4d4bn72.mongodb.net/", {
  useNewUrlParser: true, 
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

const roleSchema = new mongoose.Schema({
  _id: {
    type: String,
  },
  name: {
    type: String,
    maxLength: 64,
  },
  created_at: {
    type: Date,
  },
  updated_at: {
    type: Date,
  },
});

const Role = mongoose.model("Role", roleSchema);

module.exports = Role;