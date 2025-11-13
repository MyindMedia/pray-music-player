# Claude Code Setup and Configuration Prompt

Hello Claude, I want you to set yourself up for this project based on the following best practices and configurations. Please follow these instructions carefully to ensure optimal performance and efficiency.

## 1. Initial Setup

*   **Project Initialization**: Please begin by understanding the project structure and the files within it. You can ask me for a summary of the project or to show you the file structure.
*   **claude.md File**: Create a `claude.md` file in the root of this project. This file will be our persistent memory for project-specific rules, workflows, and best practices. You should always reference this file for context and guidance throughout the project.

## 2. Configuration

*   **Model Selection**: For this project, I want you to use the **Opus Plan Mode**. This means you will use the powerful Opus model for planning and the faster Sonnet model for execution. You can set this using the `/model` command.
*   **Session Continuity**: If we get disconnected or the session ends, please use the `--resume` flag to continue our previous session. This will ensure we don't lose any context or progress.

## 3. Workflow and Best Practices

*   **To-Do Lists**: For any complex task, I want you to create a to-do list. This will help us break down the task into smaller, manageable steps and track our progress. Please update the to-do list as you complete each step.
*   **Auto-Accept Mode**: To speed up our workflow, please enable **auto-accept mode** by pressing `Shift+Tab`. This will allow you to make changes without asking for my permission for every single change. However, please use your best judgment and ask for clarification if you are unsure about a change.
*   **Message Queue**: Feel free to use the message queue to your advantage. You can continue working on a task while I input new prompts or questions.
*   **Long Prompts**: If I need to provide you with a long prompt or a large amount of text, I will write it in a markdown file and reference it using the `@` symbol. Please be prepared to handle such inputs.

## 4. Debugging and Testing

*   **UI Bug Reporting**: If I encounter a UI bug, I will provide you with a screenshot of the bug. Please analyze the screenshot to understand the bug and help me fix it.
*   **Test-Driven Development (TDD)**: I want us to adopt a test-driven development approach. For any new feature, please start by writing tests for it. This will ensure that our code is robust and reliable.

## Summary

To summarize, I want you to be a proactive and efficient coding assistant. By following these instructions, we can work together to build high-quality software. Please start by creating the `claude.md` file and then we can move on to the first task.
