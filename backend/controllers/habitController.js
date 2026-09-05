const Habit = require("../models/Habit");

exports.toggleHabit = async (req, res) => {
  try {
    const { title, date } = req.body; // date = "YYYY-MM-DD"
    const userId = req.student?._id;

    let habit = await Habit.findOne({ userId, title });

    if (!habit) {
      habit = await Habit.create({ userId, title, daysCompleted: [date], lastCompleted: date, streak: 1 });
    } else {
      const isCompleted = habit.daysCompleted.includes(date);
      if (isCompleted) {
        habit.daysCompleted = habit.daysCompleted.filter(d => d !== date);
        // recalculate streak logic could go here simple decrement for now
        habit.streak = Math.max(0, habit.streak - 1);
      } else {
        habit.daysCompleted.push(date);
        habit.lastCompleted = date;
        habit.streak += 1;
      }
      await habit.save();
    }

    res.status(200).json({ success: true, data: habit });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update habit", error: error.message });
  }
};

exports.getHabits = async (req, res) => {
  try {
    const userId = req.user?._id;
    const habits = await Habit.find({ userId });
    res.status(200).json({ success: true, data: habits });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch habits", error: error.message });
  }
};
