import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');

// Ensure local data directory exists for JSON DB fallback
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let isMongoConnected = false;

// --- MONGOOSE SCHEMAS & MODELS ---
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  ecoPoints: { type: Number, default: 0 },
  treesPlanted: { type: Number, default: 0 },
  joinedAt: { type: Date, default: Date.now },
});

const FootprintSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  date: { type: Date, default: Date.now },
  transport: {
    car: Number, // km/week
    bike: Number, // km/week
    publicTransport: Number, // km/week
    flights: Number, // hours/year
  },
  energy: {
    electricity: Number, // kWh/month
  },
  food: {
    habit: String, // vegan, vegetarian, moderate-meat, heavy-meat
  },
  waste: {
    generation: Number, // kg/week
    recycled: Boolean,
  },
  totalEmissions: { type: Number, required: true }, // kg CO2/year
});

const GoalSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  category: { type: String, required: true }, // transport, energy, food, waste
  targetValue: { type: Number, required: true }, // % reduction or absolute target
  currentValue: { type: Number, default: 0 },
  deadline: { type: Date, required: true },
  completed: { type: Boolean, default: false },
  badge: { type: String, default: null }, // e.g. "Eco Commuter"
});

const PostSchema = new mongoose.Schema({
  username: { type: String, required: true },
  content: { type: String, required: true },
  ecoPoints: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  likes: { type: [String], default: [] }, // userIds
});

let UserModel, FootprintModel, GoalModel, PostModel;

try {
  UserModel = mongoose.model('User', UserSchema);
  FootprintModel = mongoose.model('Footprint', FootprintSchema);
  GoalModel = mongoose.model('Goal', GoalSchema);
  PostModel = mongoose.model('Post', PostSchema);
} catch (e) {
  // If models already compiled
  UserModel = mongoose.models.User;
  FootprintModel = mongoose.models.Footprint;
  GoalModel = mongoose.models.Goal;
  PostModel = mongoose.models.Post;
}

// --- LOCAL JSON FILE DB FALLBACK ENGINE ---
const getJsonFile = (filename) => {
  const filePath = path.join(DATA_DIR, `${filename}.json`);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    return [];
  }
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading database file ${filename}.json:`, err);
    return [];
  }
};

const saveJsonFile = (filename, data) => {
  const filePath = path.join(DATA_DIR, `${filename}.json`);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Error writing database file ${filename}.json:`, err);
  }
};

// Seed initial default daily challenges if not present
const seedChallenges = () => {
  const file = path.join(DATA_DIR, 'challenges.json');
  if (!fs.existsSync(file)) {
    const initialChallenges = [
      { id: 'ch1', title: 'Walk/Bike to work/school', description: 'Swap a car trip with active transit today.', points: 15, category: 'transport' },
      { id: 'ch2', title: 'Unplug Standby Appliances', description: 'Unplug devices not in use to save phantom load.', points: 10, category: 'energy' },
      { id: 'ch3', title: 'Meat-Free Day', description: 'Eat entirely plant-based meals today.', points: 20, category: 'food' },
      { id: 'ch4', title: 'Compost Waste', description: 'Properly compost kitchen scraps instead of throwing them away.', points: 10, category: 'waste' },
      { id: 'ch5', title: 'Zero Single-Use Plastics', description: 'Use only reusable bags, bottles, and containers.', points: 15, category: 'waste' },
      { id: 'ch6', title: 'Turn off lights in empty rooms', description: 'Keep electricity usage to a minimum.', points: 10, category: 'energy' },
    ];
    fs.writeFileSync(file, JSON.stringify(initialChallenges, null, 2));
  }
};
seedChallenges();

// --- EXPORTED DB INTERFACE ---
export const dbConnect = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/carbon-footprint';
  console.log(`Connecting to MongoDB at: ${mongoUri}...`);
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
    isMongoConnected = true;
    console.log('Successfully connected to MongoDB.');
  } catch (err) {
    console.warn('\n⚠️  MongoDB connection failed! Falling back to Local JSON File Database. ⚠️\n');
    isMongoConnected = false;
  }
};

export const DB = {
  isMongo: () => isMongoConnected,

  users: {
    async findByEmail(email) {
      if (isMongoConnected) {
        return await UserModel.findOne({ email: email.toLowerCase() });
      } else {
        const users = getJsonFile('users');
        return users.find(u => u.email === email.toLowerCase()) || null;
      }
    },

    async findById(id) {
      if (isMongoConnected) {
        return await UserModel.findById(id);
      } else {
        const users = getJsonFile('users');
        const user = users.find(u => u.id === id);
        return user ? { ...user, _id: user.id } : null;
      }
    },

    async create(userData) {
      if (isMongoConnected) {
        const user = new UserModel(userData);
        return await user.save();
      } else {
        const users = getJsonFile('users');
        const newUser = {
          id: uuidv4(),
          ...userData,
          ecoPoints: 0,
          treesPlanted: 0,
          joinedAt: new Date().toISOString(),
        };
        users.push(newUser);
        saveJsonFile('users', users);
        return { ...newUser, _id: newUser.id };
      }
    },

    async addPoints(userId, points) {
      if (isMongoConnected) {
        return await UserModel.findByIdAndUpdate(userId, { $inc: { ecoPoints: points } }, { new: true });
      } else {
        const users = getJsonFile('users');
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
          users[userIndex].ecoPoints = (users[userIndex].ecoPoints || 0) + points;
          saveJsonFile('users', users);
          return { ...users[userIndex], _id: users[userIndex].id };
        }
        return null;
      }
    },

    async plantTree(userId, pointsCost = 100) {
      if (isMongoConnected) {
        const user = await UserModel.findById(userId);
        if (user && user.ecoPoints >= pointsCost) {
          user.ecoPoints -= pointsCost;
          user.treesPlanted += 1;
          return await user.save();
        }
        return null;
      } else {
        const users = getJsonFile('users');
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex !== -1 && users[userIndex].ecoPoints >= pointsCost) {
          users[userIndex].ecoPoints -= pointsCost;
          users[userIndex].treesPlanted = (users[userIndex].treesPlanted || 0) + 1;
          saveJsonFile('users', users);
          return { ...users[userIndex], _id: users[userIndex].id };
        }
        return null;
      }
    },

    async getLeaderboard() {
      if (isMongoConnected) {
        return await UserModel.find({}, 'username ecoPoints treesPlanted joinedAt')
          .sort({ ecoPoints: -1 })
          .limit(10);
      } else {
        const users = getJsonFile('users');
        return users
          .map(u => ({ id: u.id, _id: u.id, username: u.username, ecoPoints: u.ecoPoints, treesPlanted: u.treesPlanted, joinedAt: u.joinedAt }))
          .sort((a, b) => b.ecoPoints - a.ecoPoints)
          .slice(0, 10);
      }
    }
  },

  footprints: {
    async create(userId, footprintData) {
      if (isMongoConnected) {
        const footprint = new FootprintModel({ userId, ...footprintData });
        return await footprint.save();
      } else {
        const footprints = getJsonFile('footprints');
        const newFootprint = {
          id: uuidv4(),
          userId,
          date: new Date().toISOString(),
          ...footprintData,
        };
        footprints.push(newFootprint);
        saveJsonFile('footprints', footprints);
        return { ...newFootprint, _id: newFootprint.id };
      }
    },

    async getByUserId(userId) {
      if (isMongoConnected) {
        return await FootprintModel.find({ userId }).sort({ date: -1 });
      } else {
        const footprints = getJsonFile('footprints');
        return footprints
          .filter(f => f.userId === userId)
          .sort((a, b) => new Date(b.date) - new Date(a.date));
      }
    }
  },

  goals: {
    async getByUserId(userId) {
      if (isMongoConnected) {
        return await GoalModel.find({ userId });
      } else {
        const goals = getJsonFile('goals');
        return goals.filter(g => g.userId === userId).map(g => ({ ...g, _id: g.id }));
      }
    },

    async create(userId, goalData) {
      if (isMongoConnected) {
        const goal = new GoalModel({ userId, ...goalData });
        return await goal.save();
      } else {
        const goals = getJsonFile('goals');
        const newGoal = {
          id: uuidv4(),
          userId,
          completed: false,
          currentValue: 0,
          badge: null,
          ...goalData,
        };
        goals.push(newGoal);
        saveJsonFile('goals', goals);
        return { ...newGoal, _id: newGoal.id };
      }
    },

    async update(userId, goalId, updateData) {
      if (isMongoConnected) {
        return await GoalModel.findOneAndUpdate({ _id: goalId, userId }, updateData, { new: true });
      } else {
        const goals = getJsonFile('goals');
        const index = goals.findIndex(g => g.id === goalId && g.userId === userId);
        if (index !== -1) {
          goals[index] = { ...goals[index], ...updateData };
          saveJsonFile('goals', goals);
          return { ...goals[index], _id: goals[index].id };
        }
        return null;
      }
    },

    async delete(userId, goalId) {
      if (isMongoConnected) {
        return await GoalModel.findOneAndDelete({ _id: goalId, userId });
      } else {
        const goals = getJsonFile('goals');
        const index = goals.findIndex(g => g.id === goalId && g.userId === userId);
        if (index !== -1) {
          const deleted = goals[index];
          const filtered = goals.filter(g => !(g.id === goalId && g.userId === userId));
          saveJsonFile('goals', filtered);
          return deleted;
        }
        return null;
      }
    }
  },

  challenges: {
    async getAll() {
      // Direct load from JSON file (preseeded)
      return getJsonFile('challenges');
    },

    async complete(userId, challengeId, points) {
      const userChallengesFile = 'user_challenges';
      const userChallenges = getJsonFile(userChallengesFile);
      const todayStr = new Date().toISOString().split('T')[0];

      // Check if already completed today
      const alreadyCompleted = userChallenges.some(
        c => c.userId === userId && c.challengeId === challengeId && c.date === todayStr
      );

      if (alreadyCompleted) {
        return { success: false, message: 'Challenge already completed today!' };
      }

      // Add to completed list
      userChallenges.push({
        id: uuidv4(),
        userId,
        challengeId,
        date: todayStr
      });
      saveJsonFile(userChallengesFile, userChallenges);

      // Award points
      const updatedUser = await DB.users.addPoints(userId, points);
      return { success: true, user: updatedUser };
    },

    async getCompletedToday(userId) {
      const userChallenges = getJsonFile('user_challenges');
      const todayStr = new Date().toISOString().split('T')[0];
      return userChallenges
        .filter(c => c.userId === userId && c.date === todayStr)
        .map(c => c.challengeId);
    }
  },

  posts: {
    async getAll() {
      if (isMongoConnected) {
        return await PostModel.find().sort({ createdAt: -1 });
      } else {
        const posts = getJsonFile('posts');
        return posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(p => ({ ...p, _id: p.id }));
      }
    },

    async create(username, content, ecoPoints) {
      if (isMongoConnected) {
        const post = new PostModel({ username, content, ecoPoints });
        return await post.save();
      } else {
        const posts = getJsonFile('posts');
        const newPost = {
          id: uuidv4(),
          username,
          content,
          ecoPoints,
          createdAt: new Date().toISOString(),
          likes: [],
        };
        posts.push(newPost);
        saveJsonFile('posts', posts);
        return { ...newPost, _id: newPost.id };
      }
    },

    async like(postId, userId) {
      if (isMongoConnected) {
        const post = await PostModel.findById(postId);
        if (post) {
          const index = post.likes.indexOf(userId);
          if (index === -1) {
            post.likes.push(userId);
          } else {
            post.likes.splice(index, 1);
          }
          return await post.save();
        }
        return null;
      } else {
        const posts = getJsonFile('posts');
        const index = posts.findIndex(p => p.id === postId);
        if (index !== -1) {
          const post = posts[index];
          const likeIndex = post.likes.indexOf(userId);
          if (likeIndex === -1) {
            post.likes.push(userId);
          } else {
            post.likes.splice(likeIndex, 1);
          }
          saveJsonFile('posts', posts);
          return { ...post, _id: post.id };
        }
        return null;
      }
    }
  }
};
