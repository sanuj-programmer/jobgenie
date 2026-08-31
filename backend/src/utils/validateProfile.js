function validateProfile(data) {
  if (!data || typeof data !== "object") {
    return { isValid: false, errors: ["Invalid profile payload."] };
  }

  const errors = [];

  // 1. Name: Max 100 chars, required
  const name = typeof data.name === "string" ? data.name.trim() : "";
  if (!name) {
    errors.push("Name is required.");
  } else if (name.length > 100) {
    errors.push("Name cannot exceed 100 characters.");
  }

  // 2. Email: Max 254 chars, valid format
  const email = typeof data.email === "string" ? data.email.trim() : "";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    errors.push("Email is required.");
  } else if (email.length > 254) {
    errors.push("Email cannot exceed 254 characters.");
  } else if (!emailRegex.test(email)) {
    errors.push("Please provide a valid email format.");
  }

  // 3. Phone Number: Max 20 chars, allowed characters, structure validation
  const phoneNumber = typeof data.phoneNumber === "string" ? data.phoneNumber.trim() : "";
  const phoneCharRegex = /^[0-9+\-\s()]{7,20}$/;
  const digitCount = phoneNumber.replace(/\D/g, "").length;
  if (!phoneNumber) {
    errors.push("Phone number is required.");
  } else if (phoneNumber.length > 20) {
    errors.push("Phone number cannot exceed 20 characters.");
  } else if (!phoneCharRegex.test(phoneNumber) || digitCount < 7) {
    errors.push("Please provide a valid phone number (digits, +, -, spaces, and () allowed, min 7 digits).");
  }

  // 4. Skills: Max 500 chars, comma-separated array
  let skills = [];
  if (typeof data.skills === "string") {
    if (data.skills.length > 500) {
      errors.push("Skills text cannot exceed 500 characters.");
    }
    skills = data.skills.split(",").map(s => s.trim()).filter(Boolean);
  } else if (Array.isArray(data.skills)) {
    const joined = data.skills.join(", ");
    if (joined.length > 500) {
      errors.push("Skills cannot exceed 500 characters.");
    }
    skills = data.skills.map(s => String(s).trim()).filter(Boolean);
  }

  if (skills.length === 0) {
    errors.push("At least one skill is required.");
  }

  // 5. Experience: Min 0, Max 50, integer or at most 1 decimal place
  const expRaw = String(data.experienceYears !== undefined && data.experienceYears !== null ? data.experienceYears : "").trim();
  const expNum = Number(expRaw);
  const expFormatRegex = /^\d+(\.\d)?$/;

  if (expRaw === "" || isNaN(expNum) || !expFormatRegex.test(expRaw)) {
    errors.push("Experience must be a numeric value with at most 1 decimal place (e.g., 2 or 3.5).");
  } else if (expNum < 0 || expNum > 50) {
    errors.push("Experience must be between 0 and 50 years.");
  }

  // 6. Education: Max 200 chars, required
  const education = typeof data.education === "string" ? data.education.trim() : "";
  if (!education) {
    errors.push("Education is required.");
  } else if (education.length > 200) {
    errors.push("Education cannot exceed 200 characters.");
  }

  // 7. Location: Max 100 chars, required
  const location = typeof data.location === "string" ? data.location.trim() : "";
  if (!location) {
    errors.push("Location is required.");
  } else if (location.length > 100) {
    errors.push("Location cannot exceed 100 characters.");
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: {
      name: name.slice(0, 100),
      email: email.slice(0, 254),
      phoneNumber: phoneNumber.slice(0, 20),
      skills: skills.map(s => s.slice(0, 100)).slice(0, 50),
      experienceYears: isNaN(expNum) ? 0 : parseFloat(Math.min(Math.max(expNum, 0), 50).toFixed(1)),
      education: education.slice(0, 200),
      location: location.slice(0, 100)
    }
  };
}

module.exports = { validateProfile };
