import asyncHandler from "express-async-handler";

// Sample settings data (Replace this with database logic)
let settingsData = {
  theme: "dark",
  notifications: true,
  language: "en",
};

// Get Settings
const settings = asyncHandler(async (req, res) => {
  try {
    res.status(200).json(settingsData);
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ message: "Failed to fetch settings" });
  }
});

// Update Settings
const updateSettings = asyncHandler(async (req, res) => {
  try {
    const { theme, notifications, language } = req.body;
    settingsData = {
      theme: theme || settingsData.theme,
      notifications:
        notifications !== undefined
          ? notifications
          : settingsData.notifications,
      language: language || settingsData.language,
    };

    res
      .status(200)
      .json({
        message: "Settings updated successfully",
        settings: settingsData,
      });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ message: "Failed to update settings" });
  }
});

export { settings, updateSettings };
