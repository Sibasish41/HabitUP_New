const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const { Sequelize, DataTypes, Op } = require("sequelize");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const JWT_SECRET = process.env.JWT_SECRET || "replace-this-secret-before-deployment";
const DB_DIALECT = process.env.DB_DIALECT || "mysql";
const useDatabaseSsl =
  process.env.DB_SSL === "true" ||
  Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.includes("neon.tech"));
const databaseSslOptions = useDatabaseSsl
  ? {
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    }
  : {};

app.use(express.json());
app.use(
  cors({
    origin: [CLIENT_URL, "http://localhost:5173", "http://localhost:4173"],
    credentials: true,
  })
);

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: DB_DIALECT,
      logging: process.env.DB_LOGGING === "true" ? console.log : false,
      ...databaseSslOptions,
    })
  : new Sequelize(
      process.env.DB_NAME || "habitup",
      process.env.DB_USER || "root",
      process.env.DB_PASSWORD || "",
      {
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT || 3306),
        dialect: DB_DIALECT,
        logging: process.env.DB_LOGGING === "true" ? console.log : false,
        ...databaseSslOptions,
      }
    );

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(160),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("USER", "COACH", "DOCTOR", "ADMIN"),
      allowNull: false,
      defaultValue: "USER",
    },
    status: {
      type: DataTypes.ENUM("ACTIVE", "PENDING_REVIEW", "SUSPENDED", "INACTIVE"),
      allowNull: false,
      defaultValue: "ACTIVE",
    },
    joinedAt: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "users",
  }
);

const ProviderProfile = sequelize.define(
  "ProviderProfile",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    specialty: {
      type: DataTypes.STRING(120),
      allowNull: false,
      defaultValue: "General wellness",
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    qualifications: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    sessionFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: 0,
    },
    isAcceptingClients: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "provider_profiles",
  }
);

const Habit = sequelize.define(
  "Habit",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(140),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },
    target: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },
    streak: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    completion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0, max: 100 },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "habits",
  }
);

const Consultation = sequelize.define(
  "Consultation",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    type: {
      type: DataTypes.ENUM("COACH", "DOCTOR"),
      allowNull: false,
    },
    topic: {
      type: DataTypes.STRING(180),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("REQUESTED", "SCHEDULED", "COMPLETED", "CANCELLED", "FOLLOW_UP"),
      allowNull: false,
      defaultValue: "REQUESTED",
    },
    startsAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "consultations",
  }
);

const SubscriptionPlan = sequelize.define(
  "SubscriptionPlan",
  {
    id: {
      type: DataTypes.STRING(40),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    cadence: {
      type: DataTypes.ENUM("month", "year"),
      allowNull: false,
      defaultValue: "month",
    },
    features: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "subscription_plans",
  }
);

const UserSubscription = sequelize.define(
  "UserSubscription",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    status: {
      type: DataTypes.ENUM("ACTIVE", "TRIALING", "PAST_DUE", "CANCELLED"),
      allowNull: false,
      defaultValue: "ACTIVE",
    },
    currentPeriodEnd: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    externalSubscriptionId: {
      type: DataTypes.STRING(160),
      allowNull: true,
    },
  },
  {
    tableName: "user_subscriptions",
  }
);

const Thought = sequelize.define(
  "Thought",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(160),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("DRAFT", "REVIEW", "PUBLISHED", "REJECTED", "ARCHIVED"),
      allowNull: false,
      defaultValue: "REVIEW",
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    reviewNote: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "thoughts",
  }
);

const AdminAction = sequelize.define(
  "AdminAction",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    action: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    entityType: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },
    entityId: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
    },
  },
  {
    tableName: "admin_actions",
  }
);

User.hasOne(ProviderProfile, { foreignKey: { name: "userId", allowNull: false }, as: "providerProfile" });
ProviderProfile.belongsTo(User, { foreignKey: { name: "userId", allowNull: false }, as: "user" });

User.hasMany(Habit, { foreignKey: { name: "userId", allowNull: false }, as: "habits" });
Habit.belongsTo(User, { foreignKey: { name: "userId", allowNull: false }, as: "user" });

User.hasMany(Consultation, { foreignKey: { name: "memberId", allowNull: false }, as: "memberConsultations" });
User.hasMany(Consultation, { foreignKey: { name: "providerId", allowNull: false }, as: "providerConsultations" });
Consultation.belongsTo(User, { foreignKey: { name: "memberId", allowNull: false }, as: "member" });
Consultation.belongsTo(User, { foreignKey: { name: "providerId", allowNull: false }, as: "provider" });

User.hasMany(UserSubscription, { foreignKey: { name: "userId", allowNull: false }, as: "subscriptions" });
SubscriptionPlan.hasMany(UserSubscription, { foreignKey: { name: "planId", allowNull: false }, as: "subscriptions" });
UserSubscription.belongsTo(User, { foreignKey: { name: "userId", allowNull: false }, as: "user" });
UserSubscription.belongsTo(SubscriptionPlan, { foreignKey: { name: "planId", allowNull: false }, as: "plan" });

User.hasMany(Thought, { foreignKey: { name: "authorId", allowNull: false }, as: "thoughts" });
Thought.belongsTo(User, { foreignKey: { name: "authorId", allowNull: false }, as: "author" });
Thought.belongsTo(User, { foreignKey: { name: "reviewedById", allowNull: true }, as: "reviewer" });

User.hasMany(AdminAction, { foreignKey: { name: "adminId", allowNull: false }, as: "adminActions" });
AdminAction.belongsTo(User, { foreignKey: { name: "adminId", allowNull: false }, as: "admin" });

const defaultPlans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    cadence: "month",
    features: ["Habit tracking", "Daily thoughts", "Basic progress insights"],
  },
  {
    id: "premium",
    name: "Premium",
    price: 799,
    cadence: "month",
    features: ["Advanced analytics", "Coach messaging", "Guided programs", "Priority content"],
  },
  {
    id: "care",
    name: "Care Plus",
    price: 1999,
    cadence: "month",
    features: ["Doctor consultations", "Personal wellness plan", "Coach accountability", "Family progress reports"],
  },
];

const publicUser = (user) => {
  const plain = typeof user.get === "function" ? user.get({ plain: true }) : user;
  const { passwordHash, ...safeUser } = plain;
  return safeUser;
};

const signToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role, email: user.email }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const centsToNumber = (value) => Number.parseFloat(value || 0);

const formatPlan = (plan) => ({
  id: plan.id,
  name: plan.name,
  price: centsToNumber(plan.price),
  cadence: plan.cadence,
  features: plan.features || [],
});

const formatHabit = (habit) => ({
  id: habit.id,
  title: habit.title,
  category: habit.category,
  target: habit.target,
  streak: habit.streak,
  completion: habit.completion,
});

const formatThought = (thought) => ({
  id: thought.id,
  title: thought.title,
  category: thought.category,
  content: thought.content,
  status: thought.status,
  author: thought.author?.name || "HabitUP Editorial",
  publishedAt: thought.publishedAt,
});

const formatProvider = (provider) => ({
  id: provider.id,
  name: provider.name,
  email: provider.email,
  role: provider.role,
  status: provider.status,
  specialty: provider.providerProfile?.specialty || "General wellness",
  rating: centsToNumber(provider.providerProfile?.rating),
  sessionFee: centsToNumber(provider.providerProfile?.sessionFee),
});

const formatConsultation = (consultation) => ({
  id: consultation.id,
  user: consultation.member?.name,
  provider: consultation.provider?.name,
  type: consultation.type === "DOCTOR" ? "Doctor" : "Coach",
  topic: consultation.topic,
  status: consultation.status.replace("_", "-"),
  startsAt: consultation.startsAt,
});

const logAdminAction = async (adminId, action, entityType, entityId, metadata = {}) => {
  await AdminAction.create({ adminId, action, entityType, entityId, metadata });
};

const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Authentication token is required." });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(payload.sub, {
      include: [
        { model: ProviderProfile, as: "providerProfile" },
        {
          model: UserSubscription,
          as: "subscriptions",
          include: [{ model: SubscriptionPlan, as: "plan" }],
        },
      ],
    });

    if (!user) {
      return res.status(401).json({ message: "User no longer exists." });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: "You do not have access to this resource." });
  }

  next();
};

const ensureDefaultPlans = async () => {
  const planCount = await SubscriptionPlan.count();

  if (planCount === 0) {
    await SubscriptionPlan.bulkCreate(defaultPlans);
  }
};

const createDefaultSubscription = async (userId) => {
  await UserSubscription.create({
    userId,
    planId: "free",
    status: "ACTIVE",
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });
};

app.get("/health", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: "ok", service: "HabitUP API", database: "connected", timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status: "degraded", service: "HabitUP API", database: "unavailable" });
  }
});

app.post("/auth/register", async (req, res, next) => {
  try {
    const { name, email, password, role = "USER" } = req.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const allowedRoles = ["USER", "COACH", "DOCTOR"];

    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid registration role." });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
    }

    const existingUser = await User.findOne({ where: { email: normalizedEmail } });

    if (existingUser) {
      return res.status(409).json({ message: "An account already exists with this email." });
    }

    const user = await sequelize.transaction(async (transaction) => {
      const createdUser = await User.create(
        {
          name,
          email: normalizedEmail,
          passwordHash: await bcrypt.hash(password, 10),
          role,
          status: role === "USER" ? "ACTIVE" : "PENDING_REVIEW",
          joinedAt: new Date().toISOString().slice(0, 10),
        },
        { transaction }
      );

      await UserSubscription.create(
        {
          userId: createdUser.id,
          planId: "free",
          status: "ACTIVE",
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        { transaction }
      );

      if (["COACH", "DOCTOR"].includes(role)) {
        await ProviderProfile.create(
          {
            userId: createdUser.id,
            specialty: role === "DOCTOR" ? "Lifestyle medicine" : "Habit accountability",
          },
          { transaction }
        );
      }

      return createdUser;
    });

    res.status(201).json({
      token: signToken(user),
      user: publicUser(user),
    });
  } catch (error) {
    next(error);
  }
});

app.post("/auth/login", async (req, res, next) => {
  try {
    const normalizedEmail = String(req.body.email || "").trim().toLowerCase();
    const user = await User.findOne({ where: { email: normalizedEmail } });

    if (!user || !(await bcrypt.compare(req.body.password || "", user.passwordHash))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (!["ACTIVE", "PENDING_REVIEW"].includes(user.status)) {
      return res.status(403).json({ message: "This account is not active." });
    }

    res.json({
      token: signToken(user),
      user: publicUser(user),
    });
  } catch (error) {
    next(error);
  }
});

app.get("/auth/me", requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

app.post("/setup/admin", async (req, res, next) => {
  try {
    const { name, email, password, setupKey } = req.body;

    if (!process.env.BOOTSTRAP_ADMIN_KEY || setupKey !== process.env.BOOTSTRAP_ADMIN_KEY) {
      return res.status(403).json({ message: "Invalid setup key." });
    }

    const adminCount = await User.count({ where: { role: "ADMIN" } });

    if (adminCount > 0) {
      return res.status(409).json({ message: "Admin bootstrap has already been completed." });
    }

    if (!name || !email || !password || password.length < 8) {
      return res.status(400).json({ message: "Name, email, and an 8 character password are required." });
    }

    const user = await User.create({
      name,
      email: String(email).trim().toLowerCase(),
      passwordHash: await bcrypt.hash(password, 10),
      role: "ADMIN",
      status: "ACTIVE",
      joinedAt: new Date().toISOString().slice(0, 10),
    });

    res.status(201).json({
      token: signToken(user),
      user: publicUser(user),
    });
  } catch (error) {
    next(error);
  }
});

app.get("/platform", async (req, res, next) => {
  try {
    const [plans, thoughts, providers] = await Promise.all([
      SubscriptionPlan.findAll({ where: { isActive: true }, order: [["price", "ASC"]] }),
      Thought.findAll({
        where: { status: "PUBLISHED" },
        include: [{ model: User, as: "author", attributes: ["id", "name"] }],
        order: [["publishedAt", "DESC"]],
        limit: 6,
      }),
      User.findAll({
        where: { role: { [Op.in]: ["COACH", "DOCTOR"] }, status: { [Op.in]: ["ACTIVE", "PENDING_REVIEW"] } },
        include: [{ model: ProviderProfile, as: "providerProfile" }],
        order: [["name", "ASC"]],
      }),
    ]);

    res.json({
      subscriptions: plans.map(formatPlan),
      thoughts: thoughts.map(formatThought),
      providers: providers.map(formatProvider),
    });
  } catch (error) {
    next(error);
  }
});

app.get("/providers", requireAuth, async (req, res, next) => {
  try {
    const providers = await User.findAll({
      where: { role: { [Op.in]: ["COACH", "DOCTOR"] }, status: { [Op.in]: ["ACTIVE", "PENDING_REVIEW"] } },
      include: [{ model: ProviderProfile, as: "providerProfile" }],
      order: [["name", "ASC"]],
    });

    res.json({ providers: providers.map(formatProvider) });
  } catch (error) {
    next(error);
  }
});

app.patch("/providers/me", requireAuth, requireRole("COACH", "DOCTOR"), async (req, res, next) => {
  try {
    const [profile] = await ProviderProfile.findOrCreate({
      where: { userId: req.user.id },
      defaults: {
        specialty: req.user.role === "DOCTOR" ? "Lifestyle medicine" : "Habit accountability",
      },
    });

    await profile.update({
      specialty: req.body.specialty ?? profile.specialty,
      bio: req.body.bio ?? profile.bio,
      qualifications: req.body.qualifications ?? profile.qualifications,
      sessionFee: req.body.sessionFee ?? profile.sessionFee,
      isAcceptingClients: req.body.isAcceptingClients ?? profile.isAcceptingClients,
    });

    const user = await User.findByPk(req.user.id, {
      include: [{ model: ProviderProfile, as: "providerProfile" }],
    });

    res.json({ provider: formatProvider(user) });
  } catch (error) {
    next(error);
  }
});

app.patch("/admin/providers/:id", requireAuth, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const provider = await User.findOne({
      where: { id: req.params.id, role: { [Op.in]: ["COACH", "DOCTOR"] } },
      include: [{ model: ProviderProfile, as: "providerProfile" }],
    });

    if (!provider) {
      return res.status(404).json({ message: "Provider not found." });
    }

    await provider.update({
      status: req.body.status ?? provider.status,
    });

    const [profile] = await ProviderProfile.findOrCreate({
      where: { userId: provider.id },
      defaults: {
        specialty: provider.role === "DOCTOR" ? "Lifestyle medicine" : "Habit accountability",
      },
    });

    await profile.update({
      specialty: req.body.specialty ?? profile.specialty,
      bio: req.body.bio ?? profile.bio,
      qualifications: req.body.qualifications ?? profile.qualifications,
      sessionFee: req.body.sessionFee ?? profile.sessionFee,
      rating: req.body.rating ?? profile.rating,
      isAcceptingClients: req.body.isAcceptingClients ?? profile.isAcceptingClients,
    });

    await logAdminAction(req.user.id, "UPDATE_PROVIDER_PROFILE", "User", provider.id, req.body);

    const updatedProvider = await User.findByPk(provider.id, {
      include: [{ model: ProviderProfile, as: "providerProfile" }],
    });

    res.json({ provider: formatProvider(updatedProvider) });
  } catch (error) {
    next(error);
  }
});

app.get("/dashboard", requireAuth, async (req, res, next) => {
  try {
    const role = req.user.role;

    if (role === "ADMIN") {
      const [activeMembers, providerCount, reviewCount, subscriptions] = await Promise.all([
        User.count({ where: { role: "USER", status: "ACTIVE" } }),
        User.count({ where: { role: { [Op.in]: ["COACH", "DOCTOR"] } } }),
        Thought.count({ where: { status: "REVIEW" } }),
        UserSubscription.findAll({
          where: { status: { [Op.in]: ["ACTIVE", "TRIALING"] } },
          include: [{ model: SubscriptionPlan, as: "plan" }],
        }),
      ]);
      const mrr = subscriptions.reduce((total, item) => total + centsToNumber(item.plan?.price), 0);

      return res.json({
        role,
        stats: [
          { label: "Active members", value: String(activeMembers), trend: "Live" },
          { label: "Monthly recurring revenue", value: `Rs. ${Math.round(mrr).toLocaleString("en-IN")}`, trend: "Active plans" },
          { label: "Providers", value: String(providerCount), trend: "Care network" },
          { label: "Open reviews", value: String(reviewCount), trend: "Content queue" },
        ],
        queue: [
          `Approve ${await User.count({ where: { role: { [Op.in]: ["COACH", "DOCTOR"] }, status: "PENDING_REVIEW" } })} provider applications`,
          `Review ${reviewCount} submitted daily thoughts`,
          "Check recent admin audit actions",
        ],
      });
    }

    if (["COACH", "DOCTOR"].includes(role)) {
      const consultations = await Consultation.findAll({
        where: { providerId: req.user.id },
        include: [
          { model: User, as: "member", attributes: ["id", "name", "email"] },
          { model: User, as: "provider", attributes: ["id", "name", "email"] },
        ],
        order: [["startsAt", "ASC"]],
      });
      const assignedMembers = new Set(consultations.map((item) => item.memberId)).size;
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const sessionsThisWeek = consultations.filter((item) => item.startsAt && new Date(item.startsAt) >= weekStart).length;
      const followUps = consultations.filter((item) => item.status === "FOLLOW_UP").length;

      return res.json({
        role,
        stats: [
          { label: "Assigned members", value: String(assignedMembers), trend: "Active care" },
          { label: "Sessions this week", value: String(sessionsThisWeek), trend: "Scheduled" },
          { label: "Average rating", value: String(req.user.providerProfile?.rating || "0.00"), trend: "Profile" },
          { label: "Follow-ups due", value: String(followUps), trend: "Care tasks" },
        ],
        consultations: consultations.map(formatConsultation),
      });
    }

    const [habits, consultations] = await Promise.all([
      Habit.findAll({ where: { userId: req.user.id, isActive: true }, order: [["createdAt", "ASC"]] }),
      Consultation.findAll({
        where: { memberId: req.user.id },
        include: [
          { model: User, as: "member", attributes: ["id", "name", "email"] },
          { model: User, as: "provider", attributes: ["id", "name", "email"] },
        ],
        order: [["startsAt", "ASC"]],
      }),
    ]);
    const completion = habits.length
      ? Math.round(habits.reduce((total, habit) => total + habit.completion, 0) / habits.length)
      : 0;
    const streak = habits.reduce((max, habit) => Math.max(max, habit.streak), 0);

    res.json({
      role,
      stats: [
        { label: "Current streak", value: `${streak} days`, trend: "Best active habit" },
        { label: "Weekly completion", value: `${completion}%`, trend: "Average" },
        { label: "Care sessions", value: String(consultations.length), trend: "Scheduled" },
        { label: "Wellness score", value: String(Math.min(100, completion + Math.min(streak, 20))), trend: "Derived" },
      ],
      habits: habits.map(formatHabit),
      consultations: consultations.map(formatConsultation),
    });
  } catch (error) {
    next(error);
  }
});

app.get("/habits", requireAuth, async (req, res, next) => {
  try {
    const where = req.user.role === "ADMIN" ? {} : { userId: req.user.id };
    const habits = await Habit.findAll({ where, order: [["createdAt", "DESC"]] });
    res.json({ habits: habits.map(formatHabit) });
  } catch (error) {
    next(error);
  }
});

app.post("/habits", requireAuth, requireRole("USER", "ADMIN"), async (req, res, next) => {
  try {
    const { title, category, target, userId } = req.body;

    if (!title || !category || !target) {
      return res.status(400).json({ message: "Title, category, and target are required." });
    }

    const habit = await Habit.create({
      userId: req.user.role === "ADMIN" && userId ? userId : req.user.id,
      title,
      category,
      target,
    });

    if (req.user.role === "ADMIN") {
      await logAdminAction(req.user.id, "CREATE_HABIT", "Habit", habit.id, { userId: habit.userId });
    }

    res.status(201).json({ habit: formatHabit(habit) });
  } catch (error) {
    next(error);
  }
});

app.patch("/habits/:id", requireAuth, async (req, res, next) => {
  try {
    const where = req.user.role === "ADMIN" ? { id: req.params.id } : { id: req.params.id, userId: req.user.id };
    const habit = await Habit.findOne({ where });

    if (!habit) {
      return res.status(404).json({ message: "Habit not found." });
    }

    await habit.update({
      title: req.body.title ?? habit.title,
      category: req.body.category ?? habit.category,
      target: req.body.target ?? habit.target,
      streak: req.body.streak ?? habit.streak,
      completion: req.body.completion ?? habit.completion,
      isActive: req.body.isActive ?? habit.isActive,
    });

    res.json({ habit: formatHabit(habit) });
  } catch (error) {
    next(error);
  }
});

app.get("/consultations", requireAuth, async (req, res, next) => {
  try {
    const where = {};

    if (req.user.role === "USER") {
      where.memberId = req.user.id;
    }

    if (["COACH", "DOCTOR"].includes(req.user.role)) {
      where.providerId = req.user.id;
    }

    const consultations = await Consultation.findAll({
      where,
      include: [
        { model: User, as: "member", attributes: ["id", "name", "email"] },
        { model: User, as: "provider", attributes: ["id", "name", "email"] },
      ],
      order: [["startsAt", "ASC"]],
    });

    res.json({ consultations: consultations.map(formatConsultation) });
  } catch (error) {
    next(error);
  }
});

app.post("/consultations", requireAuth, async (req, res, next) => {
  try {
    const { providerId, memberId, topic, type, startsAt } = req.body;
    const resolvedMemberId = req.user.role === "ADMIN" && memberId ? memberId : req.user.id;

    if (!providerId || !topic || !type) {
      return res.status(400).json({ message: "Provider, topic, and type are required." });
    }

    const provider = await User.findOne({ where: { id: providerId, role: type } });

    if (!provider) {
      return res.status(404).json({ message: "Provider not found for this consultation type." });
    }

    const consultation = await Consultation.create({
      memberId: resolvedMemberId,
      providerId,
      topic,
      type,
      startsAt,
      status: startsAt ? "SCHEDULED" : "REQUESTED",
    });

    res.status(201).json({ consultation });
  } catch (error) {
    next(error);
  }
});

app.get("/content/thoughts", requireAuth, async (req, res, next) => {
  try {
    const where = req.user.role === "ADMIN" ? {} : { [Op.or]: [{ status: "PUBLISHED" }, { authorId: req.user.id }] };
    const thoughts = await Thought.findAll({
      where,
      include: [{ model: User, as: "author", attributes: ["id", "name"] }],
      order: [["createdAt", "DESC"]],
    });

    res.json({ thoughts: thoughts.map(formatThought) });
  } catch (error) {
    next(error);
  }
});

app.post("/content/thoughts", requireAuth, requireRole("COACH", "DOCTOR", "ADMIN"), async (req, res, next) => {
  try {
    const { title, category, content } = req.body;

    if (!title || !category || !content) {
      return res.status(400).json({ message: "Title, category, and content are required." });
    }

    const thought = await Thought.create({
      title,
      category,
      content,
      authorId: req.user.id,
      status: req.user.role === "ADMIN" ? "PUBLISHED" : "REVIEW",
      publishedAt: req.user.role === "ADMIN" ? new Date() : null,
    });

    if (req.user.role === "ADMIN") {
      await logAdminAction(req.user.id, "PUBLISH_THOUGHT", "Thought", thought.id);
    }

    res.status(201).json({ thought: formatThought({ ...thought.get({ plain: true }), author: req.user }) });
  } catch (error) {
    next(error);
  }
});

app.patch("/content/thoughts/:id/review", requireAuth, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const { status, reviewNote } = req.body;
    const allowedStatuses = ["PUBLISHED", "REJECTED", "ARCHIVED"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid review status." });
    }

    const thought = await Thought.findByPk(req.params.id, {
      include: [{ model: User, as: "author", attributes: ["id", "name"] }],
    });

    if (!thought) {
      return res.status(404).json({ message: "Thought not found." });
    }

    await thought.update({
      status,
      reviewNote,
      reviewedById: req.user.id,
      publishedAt: status === "PUBLISHED" ? new Date() : thought.publishedAt,
    });
    await logAdminAction(req.user.id, `REVIEW_THOUGHT_${status}`, "Thought", thought.id, { reviewNote });

    res.json({ thought: formatThought(thought) });
  } catch (error) {
    next(error);
  }
});

app.get("/subscriptions", async (req, res, next) => {
  try {
    const subscriptions = await SubscriptionPlan.findAll({ where: { isActive: true }, order: [["price", "ASC"]] });
    res.json({ subscriptions: subscriptions.map(formatPlan) });
  } catch (error) {
    next(error);
  }
});

app.post("/subscriptions", requireAuth, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const { id, name, price, cadence = "month", features = [] } = req.body;

    if (!id || !name) {
      return res.status(400).json({ message: "Plan id and name are required." });
    }

    const plan = await SubscriptionPlan.create({ id, name, price, cadence, features });
    await logAdminAction(req.user.id, "CREATE_SUBSCRIPTION_PLAN", "SubscriptionPlan", plan.id);

    res.status(201).json({ plan: formatPlan(plan) });
  } catch (error) {
    next(error);
  }
});

app.patch("/admin/users/:id/status", requireAuth, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["ACTIVE", "PENDING_REVIEW", "SUSPENDED", "INACTIVE"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid user status." });
    }

    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    await user.update({ status });
    await logAdminAction(req.user.id, "UPDATE_USER_STATUS", "User", user.id, { status });

    res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

app.get("/admin/actions", requireAuth, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const actions = await AdminAction.findAll({
      include: [{ model: User, as: "admin", attributes: ["id", "name", "email"] }],
      order: [["createdAt", "DESC"]],
      limit: 50,
    });
    res.json({ actions });
  } catch (error) {
    next(error);
  }
});

app.use((req, res) => {
  res.status(404).json({ message: "API route not found." });
});

app.use((error, req, res, next) => {
  console.error(error);

  if (error.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({ message: "A record with this value already exists." });
  }

  if (error.name === "SequelizeValidationError") {
    return res.status(400).json({ message: error.errors.map((item) => item.message).join(", ") });
  }

  res.status(500).json({ message: "Something went wrong on the server." });
});

const start = async () => {
  await sequelize.authenticate();
  await sequelize.sync({ alter: process.env.DB_SYNC_ALTER === "true" });
  await ensureDefaultPlans();

  app.listen(PORT, () => {
    console.log(`HabitUP API running on port ${PORT}`);
  });
};

start().catch((error) => {
  console.error("Failed to start HabitUP API:", error.message);
  process.exit(1);
});
