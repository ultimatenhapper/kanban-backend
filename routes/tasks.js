const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const auth = require("../middleware/auth");
const taskController = require("../controllers/taskController");

// @route   GET api/tasks
// @desc    Get all tasks for a user
// @access  Private
router.get("/", auth, taskController.getTasks);

// @route   GET api/tasks/:id
// @desc    Get task by ID
// @access  Private
router.get("/:id", auth, taskController.getTaskById);

// @route   POST api/tasks
// @desc    Create a task
// @access  Private
router.post(
  "/",
  [
    auth,
    [
      check("title", "Title is required").not().isEmpty(),
      check("status", "Status is required").isIn([
        "backlog",
        "progress",
        "complete",
        "onHold",
      ]),
    ],
  ],
  taskController.createTask
);

// @route   PUT api/tasks/:id
// @desc    Update a task
// @access  Private
router.put("/:id", auth, taskController.updateTask);

// @route   DELETE api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete("/:id", auth, taskController.deleteTask);

module.exports = router;
