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

const memberSchema = new mongoose.Schema({
  _id: {
    type: String,
  },
  community: {
    type: String,
  },
  user: {
    type: String,
  },
  role: {
    type: String,
  },
  created_at: {
    type: Date,
  },
});

const Member = mongoose.model("Member", memberSchema);

module.exports = Member;