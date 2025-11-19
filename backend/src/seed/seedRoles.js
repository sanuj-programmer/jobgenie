const mongoose = require("mongoose");
require("dotenv").config();
const Role = require("../models/Role");

const roles = [
  {
    title: "Frontend Developer",
    requiredSkills: ["html", "css", "javascript", "react"],
    description:
      "Builds responsive UIs using HTML, CSS, JavaScript and frameworks like React.",
    sampleRoadmap: ["HTML", "CSS", "JavaScript", "React", "Git", "API Integration"],
  },
  {
    title: "Backend Developer",
    requiredSkills: ["node", "express", "mongodb", "api"],
    description:
      "Builds APIs, handles databases, authentication, backend logic.",
    sampleRoadmap: ["Node.js", "Express.js", "MongoDB", "JWT Auth", "Docker"],
  },
  {
    title: "Full Stack Developer",
    requiredSkills: ["html", "css", "javascript", "react", "node", "express", "mongodb"],
    description: "Works on both frontend & backend.",
    sampleRoadmap: ["React", "Node.js", "Express", "MongoDB", "CI/CD"],
  },
  {
    title: "Data Analyst",
    requiredSkills: ["python", "sql", "excel", "tableau"],
    description: "Analyzes datasets using Python, SQL, and visualization tools.",
    sampleRoadmap: ["Excel", "SQL", "Python", "Tableau", "PowerBI"],
  },
  {
    title: "Machine Learning Engineer",
    requiredSkills: ["python", "numpy", "pandas", "ml"],
    description: "Builds ML models using Python libraries.",
    sampleRoadmap: ["Python", "Pandas", "Sklearn", "TensorFlow"],
  },
  {
    title: "DevOps Engineer",
    requiredSkills: ["linux", "docker", "aws", "ci/cd"],
    description:
      "Handles CI/CD pipelines, cloud hosting, security, and containerization.",
    sampleRoadmap: ["Linux", "Docker", "AWS", "Kubernetes"],
  },
  {
    title: "Android Developer",
    requiredSkills: ["java", "kotlin", "android"],
    description: "Builds Android applications.",
    sampleRoadmap: ["Kotlin", "XML", "Android Studio"],
  },
  {
    title: "Cloud Engineer",
    requiredSkills: ["aws", "gcp", "networking"],
    description: "Deploys and manages cloud applications.",
    sampleRoadmap: ["AWS", "GCP", "Terraform"],
  },
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Role.deleteMany({});
    await Role.insertMany(roles);
    console.log("Roles seeded successfully!");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
